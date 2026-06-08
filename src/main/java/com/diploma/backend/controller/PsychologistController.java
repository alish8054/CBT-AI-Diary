package com.diploma.backend.controller;

import com.diploma.backend.Entity.MoodEntry;
import com.diploma.backend.Entity.PsychologistRequest;
import com.diploma.backend.Entity.User;
import com.diploma.backend.repository.MoodEntryRepository;
import com.diploma.backend.repository.PsychologistRequestRepository;
import com.diploma.backend.repository.UserRepository;
import com.diploma.backend.security.AccessControlService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/psychologist")
@RequiredArgsConstructor
public class PsychologistController {

    private final UserRepository userRepository;
    private final PsychologistRequestRepository psychologistRequestRepository;
    private final MoodEntryRepository moodRepository;
    private final AccessControlService accessControl;

    @GetMapping("/clients/my")
    public List<User> getMyClients(@RequestParam(required = false) Long psychologistId, HttpServletRequest request) {
        if (psychologistId != null) {
            accessControl.requireSelf(request, psychologistId);
        }
        accessControl.requirePsychologist(request);
        return userRepository.findByPsychologistId(accessControl.currentUserId(request));
    }

    @GetMapping("/requests")
    public List<PsychologistRequest> getPendingRequests(@RequestParam(required = false) Long psychologistId,
                                                        HttpServletRequest request) {
        if (psychologistId != null) {
            accessControl.requireSelf(request, psychologistId);
        }
        accessControl.requirePsychologist(request);
        return psychologistRequestRepository.findByPsychologistIdAndStatus(accessControl.currentUserId(request), "PENDING");
    }

    @PostMapping("/requests/{requestId}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long requestId,
                                            @RequestParam(required = false) Long psychologistId,
                                            HttpServletRequest request) {
        if (psychologistId != null) {
            accessControl.requireSelf(request, psychologistId);
        }
        accessControl.requirePsychologist(request);
        Long currentPsychologistId = accessControl.currentUserId(request);
        PsychologistRequest psychologistRequest = psychologistRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        if (!psychologistRequest.getPsychologist().getId().equals(currentPsychologistId)) {
            return ResponseEntity.status(403).body("This request belongs to another psychologist");
        }

        User client = psychologistRequest.getClient();
        client.setPsychologist(psychologistRequest.getPsychologist());
        userRepository.save(client);

        psychologistRequest.setStatus("ACCEPTED");
        psychologistRequestRepository.save(psychologistRequest);

        psychologistRequestRepository.findByClientIdAndStatus(client.getId(), "PENDING")
                .forEach(other -> {
                    other.setStatus("CANCELLED");
                    psychologistRequestRepository.save(other);
                });

        return ResponseEntity.ok(client);
    }

    @PostMapping("/requests/{requestId}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long requestId,
                                           @RequestParam(required = false) Long psychologistId,
                                           HttpServletRequest request) {
        if (psychologistId != null) {
            accessControl.requireSelf(request, psychologistId);
        }
        accessControl.requirePsychologist(request);
        Long currentPsychologistId = accessControl.currentUserId(request);
        PsychologistRequest psychologistRequest = psychologistRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        if (!psychologistRequest.getPsychologist().getId().equals(currentPsychologistId)) {
            return ResponseEntity.status(403).body("This request belongs to another psychologist");
        }

        psychologistRequest.setStatus("REJECTED");
        return ResponseEntity.ok(psychologistRequestRepository.save(psychologistRequest));
    }

    @GetMapping("/list")
    public List<User> getAllPsychologists() {
        return userRepository.findByRole("PSYCHOLOGIST");
    }

    @GetMapping("/client/{clientId}/mood-history")
    public List<Map<String, String>> getClientMoodHistory(@PathVariable Long clientId, HttpServletRequest request) {
        accessControl.requirePsychologistAssignedToClient(request, clientId);
        return moodRepository.findByUserIdOrderByDateDesc(clientId).stream()
                .sorted(Comparator.comparing(MoodEntry::getDate))
                .map(m -> Map.of(
                        "date", m.getDate().toString(),
                        "mood", m.getMood()
                ))
                .collect(Collectors.toList());
    }
}