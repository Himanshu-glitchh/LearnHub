package com.learnhub.quiz.entity;

import com.learnhub.auth.entity.User;
import com.learnhub.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_attempts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAttempt extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    private Integer score;
    private Integer totalMarks;
    private Integer percentage;
    private boolean passed;

    @Column(columnDefinition = "text")
    private String answersJson; // {"questionId": "answer"} map

    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
}
