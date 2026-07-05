package com.learnhub.coding.entity;

import com.learnhub.auth.entity.User;
import com.learnhub.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "problem_attempts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProblemAttempt extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AttemptStatus status = AttemptStatus.ATTEMPTED;

    @Column(columnDefinition = "TEXT")
    private String solutionCode;

    private String language; // Java, Python, JS

    public enum AttemptStatus { ATTEMPTED, SOLVED, BOOKMARKED }
}
