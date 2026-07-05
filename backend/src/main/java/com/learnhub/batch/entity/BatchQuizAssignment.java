package com.learnhub.batch.entity;

import com.learnhub.auth.entity.User;
import com.learnhub.common.entity.BaseEntity;
import com.learnhub.quiz.entity.Quiz;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "batch_quiz_assignments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BatchQuizAssignment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id")
    private Batch batch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    private LocalDateTime dueDate;

    @Builder.Default
    private Integer maxAttempts = 3;
}
