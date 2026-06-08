package com.diploma.backend.controller;

import com.diploma.backend.service.AiChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiChatService aiChatService;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, Object> payload) {
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

        return ResponseEntity.ok(Map.of("response", aiChatService.chat(message)));
    }
}
