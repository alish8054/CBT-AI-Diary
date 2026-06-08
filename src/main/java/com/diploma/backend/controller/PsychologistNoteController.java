package com.diploma.backend.controller;

import com.diploma.backend.Entity.PsychologistNote;
import com.diploma.backend.Entity.User;
import com.diploma.backend.repository.PsychologistNoteRepository;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/psychologist-tools/notes")
@RequiredArgsConstructor
public class PsychologistNoteController {

    private final PsychologistNoteRepository noteRepository;
    private final UserRepository userRepository;
    private final AccessControlService accessControl;

    @GetMapping
    public ResponseEntity<List<PsychologistNote>> getNotes(@RequestParam(required = false) Long psychologistId,
                                                           HttpServletRequest request) {
        Long currentPsychologistId = accessControl.currentUserId(request);
        if (psychologistId != null) {
            accessControl.requireSelf(request, psychologistId);
        }
        accessControl.requirePsychologist(request);
        return ResponseEntity.ok(noteRepository.findByPsychologistIdOrderByCreatedAtDesc(currentPsychologistId));
    }

    @PostMapping
    public ResponseEntity<?> createNote(@RequestBody Map<String, Object> payload, HttpServletRequest request) {
        accessControl.requirePsychologist(request);
        Long psychId = accessControl.currentUserId(request);
        PsychologistNote note = new PsychologistNote();
        note.setTitle((String) payload.get("title"));
        note.setContent((String) payload.get("content"));
        note.setPsychologist(userRepository.findById(psychId).orElseThrow());

        Object clientIdObj = payload.get("clientId");
        if (clientIdObj != null && !clientIdObj.toString().trim().isEmpty()) {
            Long clientId = Long.valueOf(clientIdObj.toString());
            accessControl.requirePsychologistAssignedToClient(request, clientId);
            User client = userRepository.findById(clientId).orElseThrow();
            note.setClient(client);
        }

        return ResponseEntity.ok(noteRepository.save(note));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PsychologistNote> updateNote(@PathVariable Long id, @RequestBody Map<String, String> payload,
                                                       HttpServletRequest request) {
        PsychologistNote note = noteRepository.findById(id).orElseThrow();
        requireNoteOwner(note, request);
        note.setTitle(payload.get("title"));
        note.setContent(payload.get("content"));
        return ResponseEntity.ok(noteRepository.save(note));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable Long id, HttpServletRequest request) {
        PsychologistNote note = noteRepository.findById(id).orElseThrow();
        requireNoteOwner(note, request);
        noteRepository.delete(note);
        return ResponseEntity.ok().build();
    }

    private void requireNoteOwner(PsychologistNote note, HttpServletRequest request) {
        accessControl.requirePsychologist(request);
        if (note.getPsychologist() == null
                || !accessControl.currentUserId(request).equals(note.getPsychologist().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this note");
        }
    }
}