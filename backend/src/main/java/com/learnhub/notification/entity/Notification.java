package com.learnhub.notification.entity;

import com.learnhub.auth.entity.User;
import com.learnhub.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String message;

    private String link;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    @Column(name = "is_read")
    @Builder.Default
    private boolean read = false;

    public enum NotificationType {
        ENROLLMENT, ASSIGNMENT, QUIZ, BOOKING, REVIEW, SYSTEM
    }
}
