package com.learnhub.coding.entity;

import com.learnhub.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "problems")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Problem extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(columnDefinition = "TEXT")
    private String exampleInput;

    @Column(columnDefinition = "TEXT")
    private String exampleOutput;

    @Column(columnDefinition = "TEXT")
    private String constraints;

    private String topic; // Arrays, Trees, DP, etc.

    @Enumerated(EnumType.STRING)
    private Difficulty difficulty;

    @ElementCollection
    @CollectionTable(name = "problem_company_tags", joinColumns = @JoinColumn(name = "problem_id"))
    @Column(name = "company")
    @Builder.Default
    private List<String> companyTags = new ArrayList<>();

    @Builder.Default
    private Integer acceptanceRate = 0;

    public enum Difficulty { EASY, MEDIUM, HARD }
}
