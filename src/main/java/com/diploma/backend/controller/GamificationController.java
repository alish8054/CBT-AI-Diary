package com.diploma.backend.controller;

import com.diploma.backend.Entity.User;
import com.diploma.backend.repository.DiaryEntryRepository;
import com.diploma.backend.security.AccessControlService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/gamification")
@RequiredArgsConstructor
public class GamificationController {
    private final DiaryEntryRepository diaryRepository;
    private final AccessControlService accessControl;

    @GetMapping("/status/{userId}")
    public ResponseEntity<?> getInnerWorldStatus(@PathVariable Long userId, HttpServletRequest request) {
        accessControl.requireSelf(request, userId);
        long entriesCount = diaryRepository.findByUser_Id(userId).size();
        int requiredDays = 5;
        boolean isUnlocked = entriesCount >= requiredDays;

        return ResponseEntity.ok(Map.of(
                "daysLogged", entriesCount,
                "requiredDays", requiredDays,
                "isUnlocked", isUnlocked
        ));
    }

    @GetMapping("/world-state/{userId}")
    public ResponseEntity<?> getWorldState(@PathVariable Long userId, HttpServletRequest request) {
        accessControl.requireSelf(request, userId);
        User user = accessControl.currentUser(request);
        String currentMood = user.getTodayMood();
        int moodScore = 5;

        if (currentMood != null && !currentMood.isEmpty()) {
            switch(currentMood) {
                case "joy": case "happy": case "excited": moodScore = 8; break;
                case "sad": case "depressed": case "down": moodScore = 3; break;
                case "annoyed": case "surprised": moodScore = 4; break;
                default: moodScore = 6;
            }
        }

        int weedsCount = Math.max(0, 10 - moodScore);
        return ResponseEntity.ok(Map.of(
                "moodScore", moodScore,
                "weedsCount", weedsCount
        ));
    }
}