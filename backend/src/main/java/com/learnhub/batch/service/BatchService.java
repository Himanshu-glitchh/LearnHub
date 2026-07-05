package com.learnhub.batch.service;

import com.learnhub.auth.entity.User;
import com.learnhub.auth.repository.UserRepository;
import com.learnhub.batch.entity.Batch;
import com.learnhub.batch.entity.BatchCourseAssignment;
import com.learnhub.batch.entity.BatchQuizAssignment;
import com.learnhub.batch.repository.BatchCourseAssignmentRepository;
import com.learnhub.batch.repository.BatchQuizAssignmentRepository;
import com.learnhub.batch.repository.BatchRepository;
import com.learnhub.common.exception.BadRequestException;
import com.learnhub.common.exception.ResourceNotFoundException;
import com.learnhub.course.entity.Course;
import com.learnhub.course.repository.CourseRepository;
import com.learnhub.quiz.entity.Quiz;
import com.learnhub.quiz.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BatchService {

    private final BatchRepository batchRepo;
    private final UserRepository userRepo;
    private final CourseRepository courseRepo;
    private final QuizRepository quizRepo;
    private final BatchCourseAssignmentRepository courseAssignRepo;
    private final BatchQuizAssignmentRepository quizAssignRepo;

    @Transactional
    public Batch createBatch(Long instructorId, String name, String description) {
        User instructor = userRepo.findById(instructorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", instructorId));
        return batchRepo.save(Batch.builder()
                .instructor(instructor).name(name).description(description).build());
    }

    public List<Batch> getMyBatches(Long instructorId) {
        return batchRepo.findByInstructorId(instructorId);
    }

    public List<Batch> getStudentBatches(Long studentId) {
        return batchRepo.findByStudentId(studentId);
    }

    public Batch getBatch(Long batchId) {
        return batchRepo.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch", batchId));
    }

    @Transactional
    public void addStudent(Long batchId, Long studentId) {
        Batch batch = getBatch(batchId);
        User student = userRepo.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("User", studentId));
        batch.getStudents().add(student);
        batchRepo.save(batch);
    }

    @Transactional
    public void removeStudent(Long batchId, Long studentId) {
        Batch batch = getBatch(batchId);
        batch.getStudents().removeIf(s -> s.getId().equals(studentId));
        batchRepo.save(batch);
    }

    @Transactional
    public void assignCourseToBatch(Long batchId, Long courseId) {
        Batch batch = getBatch(batchId);
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", courseId));
        batch.getStudents().forEach(student ->
            courseAssignRepo.save(BatchCourseAssignment.builder()
                    .batch(batch).student(student).course(course).build())
        );
    }

    @Transactional
    public void assignCourseToStudent(Long studentId, Long courseId, Long batchId) {
        User student = userRepo.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("User", studentId));
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", courseId));
        Batch batch = batchId != null ? getBatch(batchId) : null;
        courseAssignRepo.save(BatchCourseAssignment.builder()
                .batch(batch).student(student).course(course).build());
    }

    @Transactional
    public void assignQuizToBatch(Long batchId, Long quizId, Integer maxAttempts) {
        Batch batch = getBatch(batchId);
        Quiz quiz = quizRepo.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", quizId));
        batch.getStudents().forEach(student ->
            quizAssignRepo.save(BatchQuizAssignment.builder()
                    .batch(batch).student(student).quiz(quiz)
                    .maxAttempts(maxAttempts != null ? maxAttempts : 3).build())
        );
    }

    @Transactional
    public void assignQuizToStudent(Long studentId, Long quizId, Long batchId, Integer maxAttempts) {
        User student = userRepo.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("User", studentId));
        Quiz quiz = quizRepo.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", quizId));
        Batch batch = batchId != null ? getBatch(batchId) : null;
        quizAssignRepo.save(BatchQuizAssignment.builder()
                .batch(batch).student(student).quiz(quiz)
                .maxAttempts(maxAttempts != null ? maxAttempts : 3).build());
    }

    public List<BatchCourseAssignment> getAssignedCourses(Long studentId) {
        return courseAssignRepo.findForStudent(studentId);
    }

    public List<BatchQuizAssignment> getAssignedQuizzes(Long studentId) {
        return quizAssignRepo.findForStudent(studentId);
    }
}
