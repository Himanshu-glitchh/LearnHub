package com.learnhub.coding.repository;

import com.learnhub.coding.entity.ProblemAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProblemAttemptRepository extends JpaRepository<ProblemAttempt, Long> {
    List<ProblemAttempt> findByStudentId(Long studentId);
    Optional<ProblemAttempt> findByProblemIdAndStudentId(Long problemId, Long studentId);
}
