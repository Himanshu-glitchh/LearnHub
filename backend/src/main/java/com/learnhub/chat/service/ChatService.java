package com.learnhub.chat.service;

import com.learnhub.auth.entity.User;
import com.learnhub.auth.repository.UserRepository;
import com.learnhub.chat.entity.ChatMessage;
import com.learnhub.chat.entity.ChatRoom;
import com.learnhub.chat.repository.ChatMessageRepository;
import com.learnhub.chat.repository.ChatRoomRepository;
import com.learnhub.common.exception.ResourceNotFoundException;
import com.learnhub.notification.entity.Notification;
import com.learnhub.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRoomRepository roomRepo;
    private final ChatMessageRepository messageRepo;
    private final UserRepository userRepo;
    private final NotificationService notificationService;

    @Transactional
    public ChatRoom getOrCreateRoom(Long studentId, Long tutorId) {
        return roomRepo.findByStudentIdAndTutorId(studentId, tutorId).orElseGet(() -> {
            User student = userRepo.findById(studentId).orElseThrow(() -> new ResourceNotFoundException("User", studentId));
            User tutor = userRepo.findById(tutorId).orElseThrow(() -> new ResourceNotFoundException("User", tutorId));
            return roomRepo.save(ChatRoom.builder().student(student).tutor(tutor).build());
        });
    }

    public List<ChatRoom> myRooms(Long userId) {
        return roomRepo.findByUserId(userId);
    }

    public List<ChatMessage> getMessages(Long roomId) {
        return messageRepo.findByRoomIdOrderBySentAtAsc(roomId).stream()
                .peek(m -> {
                    if (m.getSender() != null) m.setSenderName(m.getSender().getFullName());
                    m.setRoomId(roomId);
                }).toList();
    }

    @Transactional
    public ChatMessage sendMessage(Long roomId, Long senderId, String content) {
        ChatRoom room = roomRepo.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("ChatRoom", roomId));
        User sender = userRepo.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("User", senderId));
        ChatMessage msg = messageRepo.save(ChatMessage.builder()
                .room(room).sender(sender).content(content).build());
        msg.setSenderName(sender.getFullName());
        msg.setRoomId(roomId);

        // Notify the other person in the room
        Long recipientId = room.getStudent().getId().equals(senderId)
                ? room.getTutor().getId()
                : room.getStudent().getId();

        String preview = content.length() > 50 ? content.substring(0, 50) + "..." : content;
        notificationService.create(
                recipientId,
                "💬 " + sender.getFullName() + ": \"" + preview + "\"",
                "/chat",
                Notification.NotificationType.SYSTEM
        );

        return msg;
    }
}
