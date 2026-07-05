package com.learnhub.quiz.repository;

import com.learnhub.quiz.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByStudentId(Long studentId);
    List<QuizAttempt> findByQuizId(Long quizId);
    List<QuizAttempt> findByQuizIdAndStudentId(Long quizId, Long studentId);
    long countByQuizIdAndStudentId(Long quizId, Long studentId);
    Optional<QuizAttempt> findTopByQuizIdAndStudentIdOrderByCreatedAtDesc(Long quizId, Long studentId);
}
