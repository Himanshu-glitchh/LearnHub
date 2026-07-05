package com.learnhub.quiz.entity;

import com.learnhub.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Quiz quiz;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String questionText;

    @Enumerated(EnumType.STRING)
    private QuestionType type; // MCQ, TRUE_FALSE, SHORT_ANSWER

    @Column(columnDefinition = "text")
    private String optionsJson; // ["A","B","C","D"] for MCQ

    private String correctAnswer;

    @Enumerated(EnumType.STRING)
    private Difficulty difficulty;

    private String explanation;
    private Integer marks;

    public enum QuestionType { MCQ, TRUE_FALSE, SHORT_ANSWER }
    public enum Difficulty { EASY, MEDIUM, HARD }
}
