package com.learnhub.batch.repository;

import com.learnhub.batch.entity.BatchCourseAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BatchCourseAssignmentRepository extends JpaRepository<BatchCourseAssignment, Long> {
    @Query("SELECT a FROM BatchCourseAssignment a WHERE (a.student.id = :studentId OR a.batch.id IN (SELECT b.id FROM Batch b JOIN b.students s WHERE s.id = :studentId))")
    List<BatchCourseAssignment> findForStudent(Long studentId);

    List<BatchCourseAssignment> findByBatchId(Long batchId);
}
