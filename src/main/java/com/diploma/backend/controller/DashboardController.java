package com.diploma.backend.controller;

import com.diploma.backend.repository.AssignmentRepository;
import com.diploma.backend.repository.DiaryEntryRepository;
import com.diploma.backend.repository.DreamEntryRepository;
import com.diploma.backend.security.AccessControlService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DiaryEntryRepository diaryEntryRepository;
    private final DreamEntryRepository dreamEntryRepository;
    private final AssignmentRepository assignmentRepository;
    private final AccessControlService accessControl;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats(@RequestParam(required = false) Long userId, HttpServletRequest request) {
        Long targetUserId = userId == null ? accessControl.currentUserId(request) : userId;
        accessControl.requireSelfOrAssignedPsychologist(request, targetUserId);

        long diaryCount = diaryEntryRepository.findByUser_Id(targetUserId).size();
        long sleepCount = dreamEntryRepository.findByUserId(targetUserId).size();
        long taskCount = assignmentRepository.findByClientId(targetUserId).stream()
                .filter(assignment -> !assignment.isCompleted())
                .count();

        return ResponseEntity.ok(Map.of(
                "diaryCount", diaryCount,
                "sleepCount", sleepCount,
                "taskCount", taskCount
        ));
    }
}