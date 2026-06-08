package com.diploma.backend.controller;

import com.diploma.backend.Entity.MoodEntry;
import com.diploma.backend.Entity.User;
import com.diploma.backend.repository.MoodEntryRepository;
import com.diploma.backend.repository.UserRepository;
import com.diploma.backend.security.AccessControlService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/mood")
@RequiredArgsConstructor
public class MoodController {

    private final MoodEntryRepository moodRepository;
    private final UserRepository userRepository;
    private final AccessControlService accessControl;

    @GetMapping("/today/{userId}")
    public ResponseEntity<?> getTodayMood(@PathVariable Long userId, HttpServletRequest request) {
        accessControl.requireSelfOrAssignedPsychologist(request, userId);
        User user = accessControl.findUser(userId);

        if (user.getLastMoodDate() != null && user.getLastMoodDate().equals(LocalDate.now())) {
            return ResponseEntity.ok(Map.of("mood", user.getTodayMood()));
        }
        return ResponseEntity.ok(Map.of("mood", ""));
    }

    @PostMapping("/{userId}")
    public ResponseEntity<?> saveMood(@PathVariable Long userId, @RequestBody Map<String, String> payload,
                                      HttpServletRequest request) {
        accessControl.requireSelf(request, userId);
        User user = accessControl.currentUser(request);
        String mood = payload.get("mood");

        user.setTodayMood(mood);
        user.setLastMoodDate(LocalDate.now());
        userRepository.save(user);

        MoodEntry entry = moodRepository.findByUserIdAndDate(userId, LocalDate.now())
                .orElse(new MoodEntry());
        entry.setUser(user);
        entry.setMood(mood);
        entry.setDate(LocalDate.now());
        moodRepository.save(entry);

        return ResponseEntity.ok().build();
    }
}
