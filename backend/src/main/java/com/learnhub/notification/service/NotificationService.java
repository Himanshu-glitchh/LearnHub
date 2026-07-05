package com.learnhub.notification.service;

import com.learnhub.auth.entity.User;
import com.learnhub.auth.repository.UserRepository;
import com.learnhub.notification.entity.Notification;
import com.learnhub.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repo;
    private final UserRepository userRepo;

    public List<Notification> getAll(Long userId) {
        return repo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long unreadCount(Long userId) {
        return repo.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markRead(Long notifId) {
        repo.findById(notifId).ifPresent(n -> { n.setRead(true); repo.save(n); });
    }

    @Transactional
    public void markAllRead(Long userId) {
        repo.markAllRead(userId);
    }

    @Transactional
    public Notification create(Long userId, String message, String link, Notification.NotificationType type) {
        User user = userRepo.findById(userId).orElseThrow();
        return repo.save(Notification.builder().user(user).message(message).link(link).type(type).build());
    }
}
