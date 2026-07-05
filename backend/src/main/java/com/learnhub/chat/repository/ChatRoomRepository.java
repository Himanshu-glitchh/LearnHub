package com.learnhub.chat.repository;

import com.learnhub.chat.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    Optional<ChatRoom> findByStudentIdAndTutorId(Long studentId, Long tutorId);

    @Query("SELECT r FROM ChatRoom r WHERE r.student.id = :userId OR r.tutor.id = :userId")
    List<ChatRoom> findByUserId(Long userId);
}
