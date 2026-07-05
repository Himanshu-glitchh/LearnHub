package com.learnhub.coding.controller;

import com.learnhub.auth.repository.UserRepository;
import com.learnhub.coding.entity.Problem;
import com.learnhub.coding.entity.ProblemAttempt;
import com.learnhub.coding.repository.ProblemAttemptRepository;
import com.learnhub.coding.repository.ProblemRepository;
import com.learnhub.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/problems")
@RequiredArgsConstructor
public class ProblemController {

    private final ProblemRepository problemRepo;
    private final ProblemAttemptRepository attemptRepo;
    private final UserRepository userRepo;

    private Long userId(UserDetails ud) {
        return userRepo.findByEmail(ud.getUsername()).orElseThrow().getId();
    }

    @GetMapping
    public ResponseEntity<Page<Problem>> list(
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(problemRepo.search(
                topic != null ? topic : "",
                difficulty != null ? difficulty : "",
                search != null ? search : "",
                PageRequest.of(page, size, Sort.by("title"))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Problem> get(@PathVariable Long id) {
        return ResponseEntity.ok(problemRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem", id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Problem> create(@RequestBody Problem problem) {
        return ResponseEntity.ok(problemRepo.save(problem));
    }

    @PostMapping("/{id}/attempt")
    public ResponseEntity<ProblemAttempt> attempt(@PathVariable Long id,
                                                    @AuthenticationPrincipal UserDetails ud,
                                                    @RequestBody Map<String, String> body) {
        Long studentId = userId(ud);
        var existing = attemptRepo.findByProblemIdAndStudentId(id, studentId);
        Problem problem = problemRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Problem", id));
        var student = userRepo.findById(studentId).orElseThrow();

        ProblemAttempt attempt = existing.orElseGet(() -> ProblemAttempt.builder()
                .problem(problem).student(student).build());

        String status = body.getOrDefault("status", "ATTEMPTED");
        attempt.setStatus(ProblemAttempt.AttemptStatus.valueOf(status));
        if (body.containsKey("solutionCode")) attempt.setSolutionCode(body.get("solutionCode"));
        if (body.containsKey("language")) attempt.setLanguage(body.get("language"));

        return ResponseEntity.ok(attemptRepo.save(attempt));
    }

    @GetMapping("/attempts/my")
    public ResponseEntity<List<ProblemAttempt>> myAttempts(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(attemptRepo.findByStudentId(userId(ud)));
    }
}
