package com.learnhub.batch.repository;

import com.learnhub.batch.entity.BatchQuizAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BatchQuizAssignmentRepository extends JpaRepository<BatchQuizAssignment, Long> {
    @Query("SELECT a FROM BatchQuizAssignment a WHERE (a.student.id = :studentId OR a.batch.id IN (SELECT b.id FROM Batch b JOIN b.students s WHERE s.id = :studentId))")
    List<BatchQuizAssignment> findForStudent(Long studentId);

    List<BatchQuizAssignment> findByBatchId(Long batchId);
}
