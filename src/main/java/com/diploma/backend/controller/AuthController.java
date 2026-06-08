package com.diploma.backend.controller;

import com.diploma.backend.Entity.User;
import com.diploma.backend.repository.UserRepository;
import com.diploma.backend.security.PasswordService;
import com.diploma.backend.security.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final Set<String> ALLOWED_ROLES = Set.of("CLIENT", "PSYCHOLOGIST");
    private static final String PASSWORD_RULE_MESSAGE =
            "Password must be at least 6 characters and include a letter, a number, and a symbol such as @ or _.";

    private final UserRepository userRepository;
    private final PasswordService passwordService;
    private final TokenService tokenService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (user.getUsername() == null || user.getUsername().isBlank()
                || user.getPassword() == null || user.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username and password are required"));
        }
        if (!isStrongPassword(user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", PASSWORD_RULE_MESSAGE));
        }
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "User already exists"));
        }

        String role = user.getRole() == null || user.getRole().isBlank() ? "CLIENT" : user.getRole().trim();
        if (!ALLOWED_ROLES.contains(role)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid role"));
        }

        user.setRole(role);
        user.setPassword(passwordService.hash(user.getPassword()));
        user.setSubscriptionEndsAt(LocalDate.now().plusDays(30));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Registration successful"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        Optional<User> userOptional = userRepository.findByUsername(loginRequest.getUsername());
        if (userOptional.isEmpty() || !passwordService.matches(loginRequest.getPassword(), userOptional.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username or password"));
        }

        User user = userOptional.get();
        if (passwordService.needsUpgrade(user.getPassword())) {
            user.setPassword(passwordService.hash(loginRequest.getPassword()));
            userRepository.save(user);
        }

        return ResponseEntity.ok(Map.ofEntries(
                Map.entry("accessToken", tokenService.createToken(user.getId(), user.getUsername(), user.getRole())),
                Map.entry("userId", user.getId()),
                Map.entry("id", user.getId()),
                Map.entry("username", user.getUsername()),
                Map.entry("role", user.getRole()),
                Map.entry("email", valueOrEmpty(user.getEmail())),
                Map.entry("fullName", valueOrEmpty(user.getFullName())),
                Map.entry("photoUrl", valueOrEmpty(user.getPhotoUrl())),
                Map.entry("subscriptionEndsAt", user.getSubscriptionEndsAt() == null ? "" : user.getSubscriptionEndsAt().toString())
        ));
    }

    private String valueOrEmpty(String value) {
        return value == null ? "" : value;
    }

    private boolean isStrongPassword(String password) {
        if (password == null || password.codePointCount(0, password.length()) < 6) {
            return false;
        }

        boolean hasLetter = false;
        boolean hasNumber = false;
        boolean hasSymbol = false;

        for (int i = 0; i < password.length(); ) {
            int codePoint = password.codePointAt(i);
            if (Character.isLetter(codePoint)) {
                hasLetter = true;
            } else if (Character.isDigit(codePoint)) {
                hasNumber = true;
            } else if (!Character.isWhitespace(codePoint)) {
                hasSymbol = true;
            }
            i += Character.charCount(codePoint);
        }

        return hasLetter && hasNumber && hasSymbol;
    }
}
