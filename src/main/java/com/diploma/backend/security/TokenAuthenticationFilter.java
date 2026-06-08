package com.diploma.backend.security;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Order(2)
@RequiredArgsConstructor
public class TokenAuthenticationFilter implements Filter {
    private final TokenService tokenService;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        if (isPublic(httpRequest)) {
            chain.doFilter(request, response);
            return;
        }

        String authorization = httpRequest.getHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            unauthorized(httpResponse, "Missing access token");
            return;
        }

        try {
            AuthenticatedUser user = tokenService.verify(authorization.substring("Bearer ".length()).trim());
            httpRequest.setAttribute(AuthContext.USER_ATTRIBUTE, user);
            chain.doFilter(request, response);
        } catch (Exception e) {
            unauthorized(httpResponse, "Invalid access token");
        }
    }

    private boolean isPublic(HttpServletRequest request) {
        String path = request.getRequestURI();
        return "OPTIONS".equalsIgnoreCase(request.getMethod())
                || !path.startsWith("/api/")
                || path.equals("/api/auth/login")
                || path.equals("/api/auth/register");
    }

    private void unauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"error\":\"" + message + "\"}");
    }
}
