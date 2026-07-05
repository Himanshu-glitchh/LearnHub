package com.learnhub.course.repository;

import com.learnhub.course.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByInstructorId(Long instructorId);

    @Query("SELECT c FROM Course c WHERE c.status = 'PUBLISHED' AND " +
           "(:category = '' OR c.category = :category) AND " +
           "(:level = '' OR c.level = :level) AND " +
           "(:search = '' OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Course> search(String category, String level, String search, Pageable pageable);
}
