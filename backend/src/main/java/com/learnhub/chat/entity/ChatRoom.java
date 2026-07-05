package com.learnhub.chat.entity;

import com.learnhub.auth.entity.User;
import com.learnhub.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chat_rooms", uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "tutor_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatRoom extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutor_id", nullable = false)
    private User tutor;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL)
    @Builder.Default
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<ChatMessage> messages = new ArrayList<>();
}
