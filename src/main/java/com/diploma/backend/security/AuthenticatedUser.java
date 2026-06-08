package com.diploma.backend.security;

public record AuthenticatedUser(Long id, String username, String role) {
}
