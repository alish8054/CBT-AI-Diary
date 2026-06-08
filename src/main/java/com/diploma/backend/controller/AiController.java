package com.diploma.backend.controller;

import com.diploma.backend.Entity.AiChatMessage;
import com.diploma.backend.Entity.User;
import com.diploma.backend.repository.AiChatMessageRepository;
import com.diploma.backend.security.AccessControlService;
import com.diploma.backend.service.AiChatService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private static final int MAX_MESSAGE_LENGTH = 4_000;

    private final AiChatService aiChatService;
    private final AiChatMessageRepository aiChatMessageRepository;
    private final AccessControlService accessControl;

    @GetMapping("/messages")
    public ResponseEntity<List<Map<String, Object>>> getMessages(HttpServletRequest request) {
        Long userId = accessControl.currentUserId(request);
        return ResponseEntity.ok(aiChatMessageRepository.findAllByUser_IdOrderByCreatedAtAsc(userId)
                .stream()
                .map(this::toDto)
                .toList());
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, Object> payload, HttpServletRequest request) {
        if (payload == null) {
            return ResponseEntity.badRequest().body(Map.of("response", "Message is required"));
        }

        if (!payload.keySet().equals(Set.of("message"))) {
            return ResponseEntity.badRequest().body(Map.of("response", "Only message is accepted"));
        }

        Object rawMessage = payload.get("message");
        String message = rawMessage instanceof String text ? text : null;
        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("response", "Message is required"));
        }
        message = message.trim();
        if (message.length() > MAX_MESSAGE_LENGTH) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message is too long");
        }

        User user = accessControl.currentUser(request);
        saveMessage(user, "user", message);

        String response = aiChatService.chat(message);
        saveMessage(user, "ai", response);

        return ResponseEntity.ok(Map.of("response", response));
    }

    private AiChatMessage saveMessage(User user, String role, String content) {
        AiChatMessage message = new AiChatMessage();
        message.setUser(user);
        message.setRole(role);
        message.setContent(content);
        message.setCreatedAt(LocalDateTime.now());
        return aiChatMessageRepository.save(message);
    }

    private Map<String, Object> toDto(AiChatMessage message) {
        return Map.of(
                "id", message.getId(),
                "role", message.getRole(),
                "text", message.getContent(),
                "createdAt", message.getCreatedAt().toString()
        );
    }
}
