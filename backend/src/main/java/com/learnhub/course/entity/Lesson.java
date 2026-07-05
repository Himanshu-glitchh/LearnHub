package com.learnhub.course.entity;

import com.learnhub.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lessons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lesson extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Section section;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    private ContentType contentType; // VIDEO, PDF, TEXT, QUIZ_LINK

    private String contentUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Integer durationSeconds;
    private Integer orderIndex;

    @Builder.Default
    private boolean isFreePreview = false;

    public enum ContentType {
        VIDEO, PDF, TEXT, QUIZ_LINK
    }
}
