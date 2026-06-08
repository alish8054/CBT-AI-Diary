package com.diploma.backend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

@Service
public class TokenService {
    private static final Base64.Encoder URL_ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder URL_DECODER = Base64.getUrlDecoder();
    private static final long TOKEN_TTL_SECONDS = 60L * 60L * 24L;

    private final byte[] signingKey;

    public TokenService(@Value("${app.auth.jwt-secret:local-dev-change-this-secret}") String jwtSecret) {
        if (jwtSecret == null || jwtSecret.isBlank()) {
            throw new IllegalStateException("JWT_SECRET is required in production environment variables");
        }
        this.signingKey = jwtSecret.getBytes(StandardCharsets.UTF_8);
    }

    public String createToken(Long userId, String username, String role) {
        long expiresAt = Instant.now().getEpochSecond() + TOKEN_TTL_SECONDS;
        String header = encode("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
        String payload = encode("{\"sub\":" + userId
                + ",\"username\":\"" + jsonEscape(username)
                + "\",\"role\":\"" + jsonEscape(role)
                + "\",\"exp\":" + expiresAt + "}");
        String unsigned = header + "." + payload;
        return unsigned + "." + sign(unsigned);
    }

    public AuthenticatedUser verify(String token) {
        String[] parts = token == null ? new String[0] : token.split("\\.");
        if (parts.length != 3) {
            throw new IllegalArgumentException("Invalid token");
        }

        String unsigned = parts[0] + "." + parts[1];
        if (!constantTimeEquals(sign(unsigned), parts[2])) {
            throw new IllegalArgumentException("Invalid token signature");
        }

        String payload = new String(URL_DECODER.decode(parts[1]), StandardCharsets.UTF_8);
        long expiresAt = longClaim(payload, "exp");
        if (expiresAt < Instant.now().getEpochSecond()) {
            throw new IllegalArgumentException("Token expired");
        }

        return new AuthenticatedUser(
                longClaim(payload, "sub"),
                stringClaim(payload, "username"),
                stringClaim(payload, "role")
        );
    }

    private String encode(String value) {
        return URL_ENCODER.encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private String sign(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(signingKey, "HmacSHA256"));
            return URL_ENCODER.encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Could not sign token", e);
        }
    }

    private long longClaim(String json, String key) {
        String prefix = "\"" + key + "\":";
        int start = json.indexOf(prefix);
        if (start < 0) {
            throw new IllegalArgumentException("Missing token claim: " + key);
        }
        start += prefix.length();
        int end = start;
        while (end < json.length() && Character.isDigit(json.charAt(end))) {
            end++;
        }
        return Long.parseLong(json.substring(start, end));
    }

    private String stringClaim(String json, String key) {
        String prefix = "\"" + key + "\":\"";
        int start = json.indexOf(prefix);
        if (start < 0) {
            throw new IllegalArgumentException("Missing token claim: " + key);
        }
        start += prefix.length();
        int end = json.indexOf('"', start);
        if (end < 0) {
            throw new IllegalArgumentException("Invalid token claim: " + key);
        }
        return json.substring(start, end).replace("\\\"", "\"").replace("\\\\", "\\");
    }

    private String jsonEscape(String value) {
        return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private boolean constantTimeEquals(String expected, String actual) {
        byte[] left = expected.getBytes(StandardCharsets.UTF_8);
        byte[] right = actual.getBytes(StandardCharsets.UTF_8);
        if (left.length != right.length) {
            return false;
        }
        int result = 0;
        for (int i = 0; i < left.length; i++) {
            result |= left[i] ^ right[i];
        }
        return result == 0;
    }
}
