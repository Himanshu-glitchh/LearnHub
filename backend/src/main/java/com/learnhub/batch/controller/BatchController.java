package com.learnhub.batch.controller;

import com.learnhub.auth.repository.UserRepository;
import com.learnhub.batch.entity.Batch;
import com.learnhub.batch.service.BatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/batches")
@RequiredArgsConstructor
public class BatchController {

    private final BatchService batchService;
    private final UserRepository userRepo;

    private Long userId(UserDetails ud) {
        return userRepo.findByEmail(ud.getUsername()).orElseThrow().getId();
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Batch> create(@AuthenticationPrincipal UserDetails ud,
                                        @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(batchService.createBatch(userId(ud),
                body.get("name"), body.get("description")));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<List<Batch>> myBatches(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(batchService.getMyBatches(userId(ud)));
    }

    @GetMapping("/enrolled")
    public ResponseEntity<List<Batch>> enrolledBatches(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(batchService.getStudentBatches(userId(ud)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Batch> getBatch(@PathVariable Long id) {
        return ResponseEntity.ok(batchService.getBatch(id));
    }

    @PostMapping("/{id}/students")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Void> addStudent(@PathVariable Long id,
                                           @RequestBody Map<String, Long> body) {
        batchService.addStudent(id, body.get("studentId"));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/students/{studentId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Void> removeStudent(@PathVariable Long id, @PathVariable Long studentId) {
        batchService.removeStudent(id, studentId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/assign-course")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Void> assignCourse(@PathVariable Long id,
                                              @RequestBody Map<String, Long> body) {
        batchService.assignCourseToBatch(id, body.get("courseId"));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/assign-quiz")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Void> assignQuiz(@PathVariable Long id,
                                            @RequestBody Map<String, Object> body) {
        Long quizId = Long.valueOf(body.get("quizId").toString());
        Integer maxAttempts = body.containsKey("maxAttempts")
                ? Integer.valueOf(body.get("maxAttempts").toString()) : 3;
        batchService.assignQuizToBatch(id, quizId, maxAttempts);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/assign-course-to-student")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Void> assignCourseToStudent(@RequestBody Map<String, Object> body) {
        batchService.assignCourseToStudent(
                Long.valueOf(body.get("studentId").toString()),
                Long.valueOf(body.get("courseId").toString()),
                body.containsKey("batchId") ? Long.valueOf(body.get("batchId").toString()) : null);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/assign-quiz-to-student")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Void> assignQuizToStudent(@RequestBody Map<String, Object> body) {
        batchService.assignQuizToStudent(
                Long.valueOf(body.get("studentId").toString()),
                Long.valueOf(body.get("quizId").toString()),
                body.containsKey("batchId") ? Long.valueOf(body.get("batchId").toString()) : null,
                body.containsKey("maxAttempts") ? Integer.valueOf(body.get("maxAttempts").toString()) : 3);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/assigned-courses")
    public ResponseEntity<?> myAssignedCourses(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(batchService.getAssignedCourses(userId(ud)));
    }

    @GetMapping("/assigned-quizzes")
    public ResponseEntity<?> myAssignedQuizzes(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(batchService.getAssignedQuizzes(userId(ud)));
    }
}
