package com.diploma.backend.controller;

import com.diploma.backend.service.DailyAdviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai-advice")
@RequiredArgsConstructor
public class DailyAdviceController {

    private final DailyAdviceService dailyAdviceService;

    @GetMapping("/daily/{userId}")
    public ResponseEntity<?> getDailyAdvice(@PathVariable Long userId) {
        return ResponseEntity.ok(dailyAdviceService.generateDailyAdvice(userId));
    }
}
