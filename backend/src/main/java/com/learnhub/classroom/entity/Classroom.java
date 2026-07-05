package com.learnhub.classroom.entity;

import com.learnhub.auth.entity.User;
import com.learnhub.common.entity.BaseEntity;
import com.learnhub.course.entity.Course;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "classrooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Classroom extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id", nullable = false)
    private User instructor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @Column(nullable = false)
    private String name;

    private String description;
    private LocalDate startDate;
    private LocalDate endDate;

    @Column(nullable = false)
    @Builder.Default
    private String joinCode = java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "classroom_students",
        joinColumns = @JoinColumn(name = "classroom_id"),
        inverseJoinColumns = @JoinColumn(name = "student_id"))
    @Builder.Default
    private Set<com.learnhub.auth.entity.User> students = new HashSet<>();

    @OneToMany(mappedBy = "classroom", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @Builder.Default
    private List<Assignment> assignments = new ArrayList<>();
}
