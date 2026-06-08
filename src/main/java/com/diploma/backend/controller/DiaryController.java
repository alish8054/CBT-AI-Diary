package com.diploma.backend.controller;

import com.diploma.backend.Entity.DiaryEntry;
import com.diploma.backend.Entity.User;
import com.diploma.backend.repository.DiaryEntryRepository;
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

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/diary")
@RequiredArgsConstructor
public class DiaryController {

    private final DiaryEntryRepository diaryRepository;
    private final AccessControlService accessControl;

    @GetMapping
    public List<DiaryEntry> getAllEntries(@RequestParam(required = false) Long userId, HttpServletRequest request) {
        Long targetUserId = userId == null ? accessControl.currentUserId(request) : userId;
        accessControl.requireSelfOrAssignedPsychologist(request, targetUserId);
        return diaryRepository.findAllByUser_IdOrderByCreatedAtDesc(targetUserId);
    }

    @GetMapping("/all")
    public List<DiaryEntry> getHistory(@RequestParam(required = false) Long userId, HttpServletRequest request) {
        return getAllEntries(userId, request);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<DiaryEntry>> getUserEntries(@PathVariable Long userId, HttpServletRequest request) {
        accessControl.requireSelfOrAssignedPsychologist(request, userId);
        return ResponseEntity.ok(diaryRepository.findByUser_Id(userId));
    }

    @PostMapping
    public ResponseEntity<?> createDiaryEntry(@RequestBody Map<String, Object> payload, HttpServletRequest request) {
        Long userId = accessControl.currentUserId(request);
        var entries = diaryRepository.findByUser_Id(userId);
        java.time.LocalDate today = java.time.LocalDate.now();
        boolean hasTodayEntry = entries.stream()
                .anyMatch(e -> e.getCreatedAt().toLocalDate().equals(today));

        if (hasTodayEntry) {
            return ResponseEntity.badRequest().body("You already made the main diary entry today.");
        }

        User user = accessControl.currentUser(request);
        DiaryEntry entry = new DiaryEntry();
        entry.setUser(user);
        entry.setText((String) payload.get("text"));

        return ResponseEntity.ok(diaryRepository.save(entry));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDiaryEntry(@PathVariable Long id, @RequestBody Map<String, String> payload,
                                              HttpServletRequest request) {
        DiaryEntry entry = diaryRepository.findById(id).orElseThrow();
        accessControl.requireSelf(request, entry.getUser().getId());
        entry.setText(payload.get("text"));
        return ResponseEntity.ok(diaryRepository.save(entry));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDiaryEntry(@PathVariable Long id, HttpServletRequest request) {
        DiaryEntry entry = diaryRepository.findById(id).orElseThrow();
        accessControl.requireSelf(request, entry.getUser().getId());
        diaryRepository.delete(entry);
        return ResponseEntity.ok().build();
    }
}