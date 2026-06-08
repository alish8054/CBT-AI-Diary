package com.diploma.backend.repository;

import com.diploma.backend.Entity.AiChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AiChatMessageRepository extends JpaRepository<AiChatMessage, Long> {
    List<AiChatMessage> findAllByUser_IdOrderByCreatedAtAsc(Long userId);
}
