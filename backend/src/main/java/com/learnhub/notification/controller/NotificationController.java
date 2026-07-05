package com.learnhub.notification.controller;

import com.learnhub.auth.repository.UserRepository;
import com.learnhub.notification.entity.Notification;
import com.learnhub.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepo;

    private Long userId(UserDetails ud) {
        return userRepo.findByEmail(ud.getUsername()).orElseThrow().getId();
    }

    @GetMapping
    public ResponseEntity<List<Notification>> list(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(notificationService.getAll(userId(ud)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(Map.of("count", notificationService.unreadCount(userId(ud))));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        notificationService.markRead(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllRead(@AuthenticationPrincipal UserDetails ud) {
        notificationService.markAllRead(userId(ud));
        return ResponseEntity.ok().build();
    }
}
