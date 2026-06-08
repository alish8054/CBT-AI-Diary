package com.diploma.backend.controller;

import com.diploma.backend.Entity.PsychologistRequest;
import com.diploma.backend.Entity.User;
import com.diploma.backend.repository.PsychologistRequestRepository;
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
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PsychologistRequestRepository psychologistRequestRepository;
    private final AccessControlService accessControl;
    private static final String UPLOAD_DIR = "uploads/";

    @PutMapping("/{id}/profile-picture")
    public ResponseEntity<?> updateProfilePicture(@PathVariable Long id, @RequestBody Map<String, Object> payload,
                                                  HttpServletRequest request) {
        accessControl.requireSelf(request, id);
        String profilePicture = asString(payload.get("profilePicture"));
        if (profilePicture == null || profilePicture.isBlank()) {
            return ResponseEntity.badRequest().body("Profile picture is required");
        }

        User user = accessControl.currentUser(request);
        user.setPhotoUrl(profilePicture);
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PostMapping("/{id}/avatar")
    public ResponseEntity<?> uploadAvatar(@PathVariable Long id, @RequestParam("file") MultipartFile file,
                                          HttpServletRequest request) {
        accessControl.requireSelf(request, id);
        try {
            User user = accessControl.currentUser(request);
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }
            String originalName = file.getOriginalFilename() == null ? "avatar" : Paths.get(file.getOriginalFilename()).getFileName().toString();
            String fileName = UUID.randomUUID() + "_" + originalName;
            Path filePath = Paths.get(UPLOAD_DIR + fileName);
            Files.write(filePath, file.getBytes());
            String fileUrl = "/uploads/" + fileName;
            user.setPhotoUrl(fileUrl);
            return ResponseEntity.ok(userRepository.save(user));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("File upload failed");
        }
    }

    @GetMapping("/psychologists")
    public ResponseEntity<List<User>> getPsychologists() {
        return ResponseEntity.ok(userRepository.findAllByRole("PSYCHOLOGIST"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id, HttpServletRequest request) {
        User target = userRepository.findById(id).orElseThrow();
        Long currentUserId = accessControl.currentUserId(request);
        if (currentUserId.equals(id) || "PSYCHOLOGIST".equals(target.getRole())) {
            return ResponseEntity.ok(target);
        }
        accessControl.requirePsychologistAssignedToClient(request, id);
        return ResponseEntity.ok(target);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> payload,
                                        HttpServletRequest request) {
        accessControl.requireSelf(request, id);
        User user = accessControl.currentUser(request);

        if (payload.containsKey("fullName")) user.setFullName(asString(payload.get("fullName")));
        if (payload.containsKey("email")) user.setEmail(asString(payload.get("email")));
        if (payload.containsKey("phone")) user.setPhone(asString(payload.get("phone")));
        if (payload.containsKey("birthDate")) user.setBirthDate(asString(payload.get("birthDate")));
        if (payload.containsKey("aboutMe")) user.setAboutMe(asString(payload.get("aboutMe")));
        if (payload.containsKey("specialization")) user.setSpecialization(asString(payload.get("specialization")));
        if (payload.containsKey("certificateUrls")) user.setCertificateUrls(asString(payload.get("certificateUrls")));
        if (payload.containsKey("socialLinks")) user.setSocialLinks(asString(payload.get("socialLinks")));
        if (payload.containsKey("experience")) user.setExperience(asInteger(payload.get("experience")));

        return ResponseEntity.ok(userRepository.save(user));
    }

    @PostMapping("/{clientId}/select-psychologist/{psychId}")
    public ResponseEntity<?> selectPsychologist(@PathVariable Long clientId, @PathVariable Long psychId,
                                                HttpServletRequest request) {
        accessControl.requireSelf(request, clientId);
        User client = accessControl.currentUser(request);
        User psychologist = userRepository.findById(psychId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Psychologist not found"));
        if (!"PSYCHOLOGIST".equals(psychologist.getRole())) {
            return ResponseEntity.badRequest().body("Selected user is not a psychologist");
        }
        client.setPsychologist(psychologist);
        return ResponseEntity.ok(userRepository.save(client));
    }

    @PostMapping("/{clientId}/psychologist-requests/{psychId}")
    public ResponseEntity<?> requestPsychologist(@PathVariable Long clientId, @PathVariable Long psychId,
                                                 HttpServletRequest request) {
        accessControl.requireSelf(request, clientId);
        User client = accessControl.currentUser(request);
        User psychologist = userRepository.findById(psychId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Psychologist not found"));

        if (!"CLIENT".equals(client.getRole())) {
            return ResponseEntity.badRequest().body("Only clients can request a psychologist");
        }
        if (!"PSYCHOLOGIST".equals(psychologist.getRole())) {
            return ResponseEntity.badRequest().body("Selected user is not a psychologist");
        }
        if (client.getPsychologist() != null) {
            return ResponseEntity.badRequest().body("You already have a psychologist");
        }

        var existing = psychologistRequestRepository
                .findByClientIdAndPsychologistIdAndStatus(clientId, psychId, "PENDING");
        if (existing.isPresent()) {
            return ResponseEntity.ok(existing.get());
        }

        PsychologistRequest psychologistRequest = new PsychologistRequest();
        psychologistRequest.setClient(client);
        psychologistRequest.setPsychologist(psychologist);
        psychologistRequest.setStatus("PENDING");
        return ResponseEntity.ok(psychologistRequestRepository.save(psychologistRequest));
    }

    @GetMapping("/{clientId}/psychologist-requests/pending")
    public ResponseEntity<?> getPendingPsychologistRequests(@PathVariable Long clientId, HttpServletRequest request) {
        accessControl.requireSelf(request, clientId);
        return ResponseEntity.ok(psychologistRequestRepository.findByClientIdAndStatus(clientId, "PENDING"));
    }

    @DeleteMapping("/me/psychologist")
    public ResponseEntity<?> removePsychologist(@RequestParam(required = false) Long clientId, HttpServletRequest request) {
        Long currentUserId = accessControl.currentUserId(request);
        if (clientId != null) {
            accessControl.requireSelf(request, clientId);
        }
        User client = accessControl.currentUser(request);
        client.setPsychologist(null);
        return ResponseEntity.ok(userRepository.save(client));
    }

    private String asString(Object value) {
        return value == null ? null : value.toString();
    }

    private Integer asInteger(Object value) {
        if (value == null || value.toString().isBlank()) return null;
        return Integer.valueOf(value.toString());
    }
}