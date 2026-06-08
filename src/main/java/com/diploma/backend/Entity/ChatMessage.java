package com.diploma.backend.Entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // К какому чату относится сообщение
    @ManyToOne
    @JoinColumn(name = "chat_id")
    private Chat chat;

    // Кто отправил (User ID)
    @Column(name = "sender_id")
    private Long senderId;

    // Текст сообщения
    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime timestamp;

    @Column(name = "read_by_recipient")
    private Boolean readByRecipient = false;
}
