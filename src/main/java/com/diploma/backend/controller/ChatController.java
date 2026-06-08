package com.diploma.backend.controller;

import com.diploma.backend.Entity.Chat;
import com.diploma.backend.Entity.ChatMessage;
import com.diploma.backend.Entity.User;
import com.diploma.backend.repository.ChatMessageRepository;
import com.diploma.backend.repository.ChatRepository;
import com.diploma.backend.repository.UserRepository;
import com.diploma.backend.security.AccessControlService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatRepository chatRepository;
    private final UserRepository userRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final AccessControlService accessControl;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Chat>> getUserChats(@PathVariable Long userId, HttpServletRequest request) {
        accessControl.requireSelf(request, userId);
        return ResponseEntity.ok(chatRepository.findByParticipantId(userId));
    }

    @PostMapping("/create")
    public ResponseEntity<Chat> createChat(@RequestParam(required = false) Long userId, @RequestParam Long targetId,
                                           HttpServletRequest request) {
        Long currentUserId = accessControl.currentUserId(request);
        if (userId != null) {
            accessControl.requireSelf(request, userId);
        }

        Optional<Chat> existingChat = chatRepository.findExistingChat(currentUserId, targetId);
        if (existingChat.isPresent()) {
            return ResponseEntity.ok(existingChat.get());
        }

        User user1 = userRepository.findById(currentUserId).orElseThrow();
        User user2 = userRepository.findById(targetId).orElseThrow();

        Chat chat = new Chat();
        chat.setParticipant1(user1);
        chat.setParticipant2(user2);
        chat.setLastMessage("Chat created");
        chat.setLastMessageTime(LocalDateTime.now());

        chatRepository.save(chat);
        return ResponseEntity.ok(chat);
    }

    @PostMapping("/message")
    public ResponseEntity<ChatMessage> sendMessage(@RequestBody MessageRequest requestBody, HttpServletRequest request) {
        Long currentUserId = accessControl.currentUserId(request);
        Chat chat = chatRepository.findById(requestBody.getChatId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found"));
        requireParticipant(chat, currentUserId);

        ChatMessage message = new ChatMessage();
        message.setChat(chat);
        message.setSenderId(currentUserId);
        message.setContent(requestBody.getContent());
        message.setTimestamp(LocalDateTime.now());
        message.setReadByRecipient(false);

        chatMessageRepository.save(message);

        chat.setLastMessage(requestBody.getContent());
        chat.setLastMessageTime(LocalDateTime.now());
        chatRepository.save(chat);

        return ResponseEntity.ok(message);
    }

    @GetMapping("/{chatId}/messages")
    public ResponseEntity<List<ChatMessage>> getChatMessages(@PathVariable Long chatId, HttpServletRequest request) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found"));
        requireParticipant(chat, accessControl.currentUserId(request));
        return ResponseEntity.ok(chatMessageRepository.findByChatId(chatId));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@RequestParam(required = false) Long userId,
                                                            HttpServletRequest request) {
        Long currentUserId = accessControl.currentUserId(request);
        if (userId != null) {
            accessControl.requireSelf(request, userId);
        }
        return ResponseEntity.ok(Map.of("count", chatMessageRepository.countUnreadForUser(currentUserId)));
    }

    @GetMapping("/unread-by-sender")
    public ResponseEntity<Map<Long, Long>> getUnreadBySender(@RequestParam(required = false) Long userId,
                                                             HttpServletRequest request) {
        Long currentUserId = accessControl.currentUserId(request);
        if (userId != null) {
            accessControl.requireSelf(request, userId);
        }
        Map<Long, Long> counts = new HashMap<>();
        for (Object[] row : chatMessageRepository.countUnreadBySenderForUser(currentUserId)) {
            counts.put((Long) row[0], (Long) row[1]);
        }
        return ResponseEntity.ok(counts);
    }

    @PutMapping("/{chatId}/read")
    public ResponseEntity<Map<String, Integer>> markChatAsRead(@PathVariable Long chatId,
                                                               @RequestParam(required = false) Long userId,
                                                               HttpServletRequest request) {
        Long currentUserId = accessControl.currentUserId(request);
        if (userId != null) {
            accessControl.requireSelf(request, userId);
        }
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found"));
        requireParticipant(chat, currentUserId);
        int updated = chatMessageRepository.markChatAsRead(chatId, currentUserId);
        return ResponseEntity.ok(Map.of("updated", updated));
    }

    private void requireParticipant(Chat chat, Long userId) {
        boolean isParticipant = chat.getParticipant1().getId().equals(userId)
                || chat.getParticipant2().getId().equals(userId);
        if (!isParticipant) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a chat participant");
        }
    }

    @Data
    public static class MessageRequest {
        private Long chatId;
        private Long senderId;
        private String content;
    }
}