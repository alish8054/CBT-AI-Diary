package com.diploma.backend.controller;

import com.diploma.backend.Entity.DreamEntry;
import com.diploma.backend.Entity.User;
import com.diploma.backend.repository.DreamEntryRepository;
import com.diploma.backend.security.AccessControlService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dreams")
@RequiredArgsConstructor
public class DreamController {

    private final DreamEntryRepository dreamRepository;
    private final AccessControlService accessControl;

    @GetMapping
    public List<DreamEntry> getDreams(@RequestParam(required = false) Long userId, HttpServletRequest request) {
        Long targetUserId = userId == null ? accessControl.currentUserId(request) : userId;
        accessControl.requireSelfOrAssignedPsychologist(request, targetUserId);
        return dreamRepository.findTop3ByUserIdOrderByCreatedAtDesc(targetUserId);
    }

    @GetMapping("/all")
    public List<DreamEntry> getHistory(@RequestParam(required = false) Long userId, HttpServletRequest request) {
        Long targetUserId = userId == null ? accessControl.currentUserId(request) : userId;
        accessControl.requireSelfOrAssignedPsychologist(request, targetUserId);
        return dreamRepository.findAllByUserIdOrderByCreatedAtDesc(targetUserId);
    }

    @PostMapping
    public ResponseEntity<?> createDream(@RequestBody Map<String, Object> payload, HttpServletRequest request) {
        Object textValue = payload.get("text") != null ? payload.get("text") : payload.get("content");
        if (textValue == null || textValue.toString().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Dream text is required");
        }

        User user = accessControl.currentUser(request);
        DreamEntry entry = new DreamEntry();
        entry.setText(textValue.toString());
        entry.setCreatedAt(LocalDateTime.now());
        entry.setUser(user);

        return ResponseEntity.ok(dreamRepository.save(entry));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<DreamEntry>> getUserDreams(@PathVariable Long userId, HttpServletRequest request) {
        accessControl.requireSelfOrAssignedPsychologist(request, userId);
        return ResponseEntity.ok(dreamRepository.findByUserId(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDream(@PathVariable Long id, @RequestBody Map<String, String> payload,
                                         HttpServletRequest request) {
        DreamEntry dream = dreamRepository.findById(id).orElseThrow();
        accessControl.requireSelf(request, dream.getUser().getId());
        String text = payload.get("text") != null ? payload.get("text") : payload.get("content");
        if (text == null || text.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Dream text is required");
        }
        dream.setText(text);
        return ResponseEntity.ok(dreamRepository.save(dream));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDream(@PathVariable Long id, HttpServletRequest request) {
        DreamEntry dream = dreamRepository.findById(id).orElseThrow();
        accessControl.requireSelf(request, dream.getUser().getId());
        dreamRepository.delete(dream);
        return ResponseEntity.ok().build();
    }
}