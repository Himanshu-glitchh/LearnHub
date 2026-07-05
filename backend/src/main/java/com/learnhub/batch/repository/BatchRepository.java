package com.learnhub.batch.repository;

import com.learnhub.batch.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BatchRepository extends JpaRepository<Batch, Long> {
    List<Batch> findByInstructorId(Long instructorId);

    @Query("SELECT b FROM Batch b JOIN b.students s WHERE s.id = :studentId")
    List<Batch> findByStudentId(Long studentId);
}
