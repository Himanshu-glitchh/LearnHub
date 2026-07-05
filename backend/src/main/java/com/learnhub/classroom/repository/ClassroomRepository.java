package com.learnhub.classroom.repository;

import com.learnhub.classroom.entity.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ClassroomRepository extends JpaRepository<Classroom, Long> {
    List<Classroom> findByInstructorId(Long instructorId);
    Optional<Classroom> findByJoinCode(String joinCode);

    @Query("SELECT c FROM Classroom c JOIN c.students s WHERE s.id = :studentId")
    List<Classroom> findByStudentId(Long studentId);
}
