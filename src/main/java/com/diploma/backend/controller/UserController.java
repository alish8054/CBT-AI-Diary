package com.diploma.backend.controller;

import com.diploma.backend.Entity.User;
import com.diploma.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import lombok.RequiredArgsConstructor;

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
    private static final String UPLOAD_DIR = "uploads/";
    @PostMapping("/{id}/avatar")
    public ResponseEntity<?> uploadAvatar(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(UPLOAD_DIR + fileName);
            Files.write(filePath, file.getBytes());
            String fileUrl = "/uploads/" + fileName;
            user.setPhotoUrl(fileUrl);
            userRepository.save(user);

            return ResponseEntity.ok(user); // Возвращаем обновленного юзера

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Ошибка загрузки файла");
        }
    }
    @GetMapping("/psychologists")
    public ResponseEntity<List<User>> getPsychologists() {
        List<User> psychologists = userRepository.findAllByRole("PSYCHOLOGIST");
        return ResponseEntity.ok(psychologists);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));

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
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating user: " + e.getMessage());
        }
    }

    private String asString(Object value) {
        return value == null ? null : value.toString();
    }

    private Integer asInteger(Object value) {
        if (value == null || value.toString().isBlank()) return null;
        return Integer.valueOf(value.toString());
    }

    @PostMapping("/{clientId}/select-psychologist/{psychId}")
    public ResponseEntity<?> selectPsychologist(@PathVariable Long clientId, @PathVariable Long psychId) {
        try {
            User client = userRepository.findById(clientId)
                    .orElseThrow(() -> new RuntimeException("Клиент не найден"));
            User psychologist = userRepository.findById(psychId)
                    .orElseThrow(() -> new RuntimeException("Психолог не найден"));
            client.setPsychologist(psychologist);
            userRepository.save(client);
            return ResponseEntity.ok(client);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Ошибка при выборе психолога: " + e.getMessage());
        }
    }
}
