package com.diploma.backend.security;

import jakarta.servlet.http.HttpServletRequest;

public final class AuthContext {
    public static final String USER_ATTRIBUTE = "authenticatedUser";

    private AuthContext() {
    }

    public static AuthenticatedUser currentUser(HttpServletRequest request) {
        Object value = request.getAttribute(USER_ATTRIBUTE);
        if (value instanceof AuthenticatedUser user) {
            return user;
        }
        throw new IllegalStateException("Authenticated user is missing");
    }

    public static Long currentUserId(HttpServletRequest request) {
        return currentUser(request).id();
    }

    public static boolean hasRole(HttpServletRequest request, String role) {
        return role.equals(currentUser(request).role());
    }
}
