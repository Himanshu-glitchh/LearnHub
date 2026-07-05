package com.learnhub.course.controller;

import com.learnhub.auth.repository.UserRepository;
import com.learnhub.course.entity.*;
import com.learnhub.course.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final UserRepository userRepo;

    private Long userId(UserDetails ud) {
        return userRepo.findByEmail(ud.getUsername()).orElseThrow().getId();
    }

    @GetMapping
    public ResponseEntity<Page<Course>> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(courseService.search(category, level, search, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> get(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.get(id));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<List<Course>> myCourses(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(courseService.myCreated(userId(ud)));
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Course> create(@AuthenticationPrincipal UserDetails ud,
                                          @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(courseService.create(userId(ud), body));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Course> update(@PathVariable Long id,
                                          @AuthenticationPrincipal UserDetails ud,
                                          @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(courseService.update(id, userId(ud), body));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                        @AuthenticationPrincipal UserDetails ud) {
        courseService.delete(id, userId(ud));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/sections")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Section> addSection(@PathVariable Long id,
                                               @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(courseService.addSection(id,
                (String) body.get("title"),
                body.containsKey("orderIndex") ? Integer.parseInt(body.get("orderIndex").toString()) : 0));
    }

    @PostMapping("/sections/{sectionId}/lessons")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Lesson> addLesson(@PathVariable Long sectionId,
                                             @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(courseService.addLesson(sectionId, body));
    }

    @PostMapping("/{id}/enroll")
    public ResponseEntity<Enrollment> enroll(@PathVariable Long id,
                                              @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(courseService.enroll(userId(ud), id));
    }

    @GetMapping("/enrollments/my")
    public ResponseEntity<List<Enrollment>> myEnrollments(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(courseService.myEnrollments(userId(ud)));
    }

    @GetMapping("/enrollments/instructor")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<List<Enrollment>> instructorEnrollments(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(courseService.enrollmentsForInstructor(userId(ud)));
    }

    @PostMapping("/{id}/reviews")
    public ResponseEntity<Review> addReview(@PathVariable Long id,
                                             @AuthenticationPrincipal UserDetails ud,
                                             @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(courseService.addReview(userId(ud), id,
                Integer.parseInt(body.get("rating").toString()),
                (String) body.get("comment")));
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<List<Review>> reviews(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getReviews(id));
    }
}
