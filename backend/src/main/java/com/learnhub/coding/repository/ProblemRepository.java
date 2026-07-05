package com.learnhub.coding.repository;

import com.learnhub.coding.entity.Problem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProblemRepository extends JpaRepository<Problem, Long> {
    @Query("SELECT p FROM Problem p WHERE " +
           "(:topic = '' OR p.topic = :topic) AND " +
           "(:difficulty = '' OR CAST(p.difficulty AS string) = :difficulty) AND " +
           "(:search = '' OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Problem> search(String topic, String difficulty, String search, Pageable pageable);
}
