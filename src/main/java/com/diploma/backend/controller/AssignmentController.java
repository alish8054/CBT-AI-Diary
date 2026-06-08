package com.diploma.backend.controller;

import com.diploma.backend.Entity.Assignment;
import com.diploma.backend.Entity.User;
import com.diploma.backend.repository.AssignmentRepository;
import com.diploma.backend.repository.UserRepository;
import com.diploma.backend.security.AccessControlService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {
    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final AccessControlService accessControl;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> payload, HttpServletRequest request) {
        accessControl.requirePsychologist(request);
        Long psychId = accessControl.currentUserId(request);
        Long clientId = Long.valueOf(payload.get("clientId").toString());
        accessControl.requirePsychologistAssignedToClient(request, clientId);

        Assignment assignment = new Assignment();
        assignment.setTitle((String) payload.get("title"));
        assignment.setDescription((String) payload.get("description"));
        assignment.setPsychologist(userRepository.findById(psychId).orElseThrow());
        assignment.setClient(userRepository.findById(clientId).orElseThrow());

        return ResponseEntity.ok(assignmentRepository.save(assignment));
    }

    @GetMapping("/client/{id}")
    public List<Assignment> getForClient(@PathVariable Long id, HttpServletRequest request) {
        accessControl.requireSelfOrAssignedPsychologist(request, id);
        return assignmentRepository.findByClientIdOrderByCreatedAtDesc(id);
    }

    @GetMapping("/psychologist/{id}")
    public List<Assignment> getForPsychologist(@PathVariable Long id, HttpServletRequest request) {
        accessControl.requireSelf(request, id);
        accessControl.requirePsychologist(request);
        return assignmentRepository.findByPsychologistIdOrderByCreatedAtDesc(id);
    }

    @PutMapping("/{id}/complete")
    public Assignment complete(@PathVariable Long id, @RequestBody Map<String, String> payload, HttpServletRequest request) {
        Assignment assignment = assignmentRepository.findById(id).orElseThrow();
        accessControl.requireSelf(request, assignment.getClient().getId());
        assignment.setClientAnswer(payload.get("answer"));
        assignment.setCompleted(true);
        return assignmentRepository.save(assignment);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Assignment>> getClientAssignments(@PathVariable Long userId, HttpServletRequest request) {
        accessControl.requireSelfOrAssignedPsychologist(request, userId);
        return ResponseEntity.ok(assignmentRepository.findByClientId(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAssignment(@PathVariable Long id, @RequestBody Map<String, String> payload,
                                              HttpServletRequest request) {
        Assignment assignment = assignmentRepository.findById(id).orElseThrow();
        requireAssignmentPsychologist(assignment, request);
        assignment.setTitle(payload.get("title"));
        assignment.setDescription(payload.get("description"));
        return ResponseEntity.ok(assignmentRepository.save(assignment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAssignment(@PathVariable Long id, HttpServletRequest request) {
        Assignment assignment = assignmentRepository.findById(id).orElseThrow();
        requireAssignmentPsychologist(assignment, request);
        assignmentRepository.delete(assignment);
        return ResponseEntity.ok().build();
    }

    private void requireAssignmentPsychologist(Assignment assignment, HttpServletRequest request) {
        accessControl.requirePsychologist(request);
        if (assignment.getPsychologist() == null
                || !accessControl.currentUserId(request).equals(assignment.getPsychologist().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this assignment");
        }
    }
}