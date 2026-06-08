package com.diploma.backend.security;

import com.diploma.backend.Entity.User;
import com.diploma.backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AccessControlService {
    private final UserRepository userRepository;

    public User currentUser(HttpServletRequest request) {
        Long userId = AuthContext.currentUserId(request);
        return findUserOrThrow(userId, HttpStatus.UNAUTHORIZED, "Authenticated user not found");
    }

    public User findUser(Long userId) {
        return findUserOrThrow(userId, HttpStatus.NOT_FOUND, "User not found");
    }

    public Long currentUserId(HttpServletRequest request) {
        return AuthContext.currentUserId(request);
    }

    public void requireSelf(HttpServletRequest request, Long userId) {
        if (!currentUserId(request).equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can access only your own data");
        }
    }

    public void requirePsychologist(HttpServletRequest request) {
        if (!"PSYCHOLOGIST".equals(AuthContext.currentUser(request).role())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Psychologist role required");
        }
    }

    public void requireSelfOrAssignedPsychologist(HttpServletRequest request, Long clientId) {
        Long currentUserId = currentUserId(request);
        if (currentUserId.equals(clientId)) {
            return;
        }
        requirePsychologistAssignedToClient(request, clientId);
    }

    public void requirePsychologistAssignedToClient(HttpServletRequest request, Long clientId) {
        requirePsychologist(request);
        Long psychologistId = currentUserId(request);
        User client = findUserOrThrow(clientId, HttpStatus.NOT_FOUND, "Client not found");
        if (client.getPsychologist() == null || !psychologistId.equals(client.getPsychologist().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Client is not assigned to this psychologist");
        }
    }

    private User findUserOrThrow(Long userId, HttpStatus status, String message) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(status, message));
    }
}
