package com.diploma.backend.repository;

import com.diploma.backend.Entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByChatId(Long chatId);

    @Query("""
            SELECT COUNT(m) FROM ChatMessage m
            WHERE (m.chat.participant1.id = :userId OR m.chat.participant2.id = :userId)
              AND m.senderId <> :userId
              AND m.readByRecipient = false
            """)
    long countUnreadForUser(@Param("userId") Long userId);

    @Query("""
            SELECT m.senderId, COUNT(m) FROM ChatMessage m
            WHERE (m.chat.participant1.id = :userId OR m.chat.participant2.id = :userId)
              AND m.senderId <> :userId
              AND m.readByRecipient = false
            GROUP BY m.senderId
            """)
    List<Object[]> countUnreadBySenderForUser(@Param("userId") Long userId);

    @Transactional
    @Modifying
    @Query("""
            UPDATE ChatMessage m
            SET m.readByRecipient = true
            WHERE m.chat.id = :chatId
              AND m.senderId <> :userId
              AND m.readByRecipient = false
            """)
    int markChatAsRead(@Param("chatId") Long chatId, @Param("userId") Long userId);
}
