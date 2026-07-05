package com.learnhub.course.entity;

import com.learnhub.auth.entity.User;
import com.learnhub.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id", nullable = false)
    private User instructor;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String thumbnailUrl;
    private String category;
    private String level; // BEGINNER, INTERMEDIATE, ADVANCED

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal price = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CourseStatus status = CourseStatus.DRAFT;

    // RECORDED = sections/lessons built here | EXTERNAL = links to outside course
    @Builder.Default
    private String courseType = "RECORDED";

    private String externalUrl; // YouTube playlist, Coursera, etc.

    @Builder.Default
    private Double averageRating = 0.0;

    @Builder.Default
    private Integer totalEnrollments = 0;

    @Builder.Default
    private Integer totalReviews = 0;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<Section> sections = new ArrayList<>();

    public enum CourseStatus {
        DRAFT, PUBLISHED, ARCHIVED
    }
}
