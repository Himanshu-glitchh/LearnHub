package com.learnhub.batch.entity;

import com.learnhub.auth.entity.User;
import com.learnhub.common.entity.BaseEntity;
import com.learnhub.course.entity.Course;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "batch_course_assignments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BatchCourseAssignment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id")
    private Batch batch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    private LocalDateTime dueDate;
}
