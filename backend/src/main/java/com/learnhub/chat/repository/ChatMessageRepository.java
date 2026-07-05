package com.learnhub.chat.repository;

import com.learnhub.chat.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    @org.springframework.data.jpa.repository.Query("SELECT m FROM ChatMessage m WHERE m.room.id = :roomId ORDER BY m.sentAt ASC")
    List<ChatMessage> findByRoomIdOrderBySentAtAsc(Long roomId);
}
