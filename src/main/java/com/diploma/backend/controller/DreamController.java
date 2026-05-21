package com.diploma.backend.controller;

import com.diploma.backend.Entity.DreamEntry;
import com.diploma.backend.Entity.User;
import com.diploma.backend.repository.DreamEntryRepository;
import com.diploma.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dreams")
@RequiredArgsConstructor
public class DreamController {

    private final DreamEntryRepository dreamRepository;
    private final UserRepository userRepository;
    private final ChatClient.Builder chatClientBuilder;

    @Value("${spring.ai.openai.api-key:}")
    private String openAiApiKey;

    @GetMapping
    public List<DreamEntry> getDreams(@RequestParam Long userId) {
        return dreamRepository.findTop3ByUserIdOrderByCreatedAtDesc(userId);
    }

    @GetMapping("/all")
    public List<DreamEntry> getHistory(@RequestParam Long userId) {
        return dreamRepository.findAllByUserIdOrderByCreatedAtDesc(userId);
    }

    @PostMapping
    public ResponseEntity<?> analyzeDream(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.valueOf(payload.get("userId").toString());
            Object textValue = payload.get("text") != null ? payload.get("text") : payload.get("content");
            if (textValue == null || textValue.toString().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Dream text is required");
            }

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String text = textValue.toString();
            DreamEntry entry = new DreamEntry();
            entry.setText(text);
            entry.setInterpretation(generateInterpretation(text));
            entry.setCreatedAt(LocalDateTime.now());
            entry.setUser(user);

            return ResponseEntity.ok(dreamRepository.save(entry));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<DreamEntry>> getUserDreams(@PathVariable Long userId) {
        return ResponseEntity.ok(dreamRepository.findByUserId(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDream(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            DreamEntry dream = dreamRepository.findById(id).orElseThrow();
            String text = payload.get("text") != null ? payload.get("text") : payload.get("content");
            if (text == null || text.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Dream text is required");
            }
            dream.setText(text);

            return ResponseEntity.ok(dreamRepository.save(dream));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDream(@PathVariable Long id) {
        dreamRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    private String generateInterpretation(String text) {
        if (openAiApiKey == null || openAiApiKey.isBlank() || "local-development-key".equals(openAiApiKey)) {
            return "AI interpretation is unavailable in local mode. Set OPENAI_API_KEY to enable it.";
        }

        try {
            ChatClient chatClient = chatClientBuilder.build();
            String prompt = "Analyze this dream briefly from a psychological perspective: \"" + text + "\"";
            return chatClient.prompt(new Prompt(prompt)).call().content();
        } catch (Exception e) {
            return "AI interpretation error: " + e.getMessage();
        }
    }
}
