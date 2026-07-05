package com.learnhub.classroom.controller;

import com.learnhub.auth.repository.UserRepository;
import com.learnhub.classroom.entity.*;
import com.learnhub.classroom.service.ClassroomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/classrooms")
@RequiredArgsConstructor
public class ClassroomController {

    private final ClassroomService classroomService;
    private final UserRepository userRepo;

    private Long userId(UserDetails ud) {
        return userRepo.findByEmail(ud.getUsername()).orElseThrow().getId();
    }

    /* ── CLASSROOM CRUD ── */

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Classroom> create(@AuthenticationPrincipal UserDetails ud,
                                             @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(classroomService.create(userId(ud), body.get("name"), body.get("description")));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Classroom>> myClassrooms(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(classroomService.myClassrooms(userId(ud)));
    }

    @GetMapping("/instructor")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<List<Classroom>> instructorClassrooms(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(classroomService.instructorClassrooms(userId(ud)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Classroom> get(@PathVariable Long id) {
        return ResponseEntity.ok(classroomService.get(id));
    }

    @PostMapping("/join")
    public ResponseEntity<Classroom> join(@AuthenticationPrincipal UserDetails ud,
                                           @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(classroomService.joinByCode(userId(ud), body.get("joinCode")));
    }

    @PostMapping("/{id}/students")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Void> addStudent(@PathVariable Long id,
                                            @RequestBody Map<String, Long> body) {
        classroomService.addStudent(id, body.get("studentId"));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/students/{studentId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Void> removeStudent(@PathVariable Long id, @PathVariable Long studentId) {
        classroomService.removeStudent(id, studentId);
        return ResponseEntity.ok().build();
    }

    /* ── ASSIGNMENTS ── */

    @PostMapping("/{id}/assignments")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Assignment> createAssignment(@PathVariable Long id,
                                                        @AuthenticationPrincipal UserDetails ud,
                                                        @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(classroomService.createAssignment(id, userId(ud), body));
    }

    @GetMapping("/{id}/assignments")
    public ResponseEntity<List<Assignment>> getAssignments(@PathVariable Long id) {
        return ResponseEntity.ok(classroomService.getAssignments(id));
    }

    @DeleteMapping("/assignments/{assignmentId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long assignmentId,
                                                  @AuthenticationPrincipal UserDetails ud) {
        classroomService.deleteAssignment(assignmentId, userId(ud));
        return ResponseEntity.noContent().build();
    }

    /* ── SUBMISSIONS ── */

    @PostMapping("/assignments/{assignmentId}/submit")
    public ResponseEntity<Submission> submit(@PathVariable Long assignmentId,
                                              @AuthenticationPrincipal UserDetails ud,
                                              @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(classroomService.submit(
                assignmentId, userId(ud),
                body.get("content"), body.get("fileUrl")));
    }

    @GetMapping("/assignments/{assignmentId}/submissions")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<List<Submission>> submissions(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(classroomService.getSubmissions(assignmentId));
    }

    @GetMapping("/submissions/my")
    public ResponseEntity<List<Submission>> mySubmissions(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(classroomService.mySubmissions(userId(ud)));
    }

    @PatchMapping("/submissions/{submissionId}/grade")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Submission> grade(@PathVariable Long submissionId,
                                             @AuthenticationPrincipal UserDetails ud,
                                             @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(classroomService.grade(
                submissionId, userId(ud),
                Integer.valueOf(body.get("marks").toString()),
                (String) body.get("feedback")));
    }
}
