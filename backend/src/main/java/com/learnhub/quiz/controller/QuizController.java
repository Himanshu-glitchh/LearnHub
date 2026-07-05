package com.learnhub.quiz.controller;

import com.learnhub.auth.repository.UserRepository;
import com.learnhub.quiz.entity.*;
import com.learnhub.quiz.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;
    private final UserRepository userRepo;

    private Long userId(UserDetails ud) {
        return userRepo.findByEmail(ud.getUsername()).orElseThrow().getId();
    }

    @GetMapping
    public ResponseEntity<List<Quiz>> list() {
        return ResponseEntity.ok(quizService.list());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Quiz> get(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.get(id));
    }

    @GetMapping("/{id}/questions")
    public ResponseEntity<List<Question>> questions(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuestions(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Quiz> create(@RequestBody Map<String, Object> body,
                                        @RequestParam(required = false) Long courseId) {
        return ResponseEntity.ok(quizService.create(body, courseId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Quiz> update(@PathVariable Long id,
                                        @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(quizService.update(id, body));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        quizService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{quizId}/questions/{questionId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long quizId,
                                                @PathVariable Long questionId) {
        quizService.deleteQuestion(questionId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/questions")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Question> addQuestion(@PathVariable Long id,
                                                 @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(quizService.addQuestion(id, body));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<QuizAttempt> submit(@PathVariable Long id,
                                               @AuthenticationPrincipal UserDetails ud,
                                               @RequestBody Map<String, String> answers) {
        return ResponseEntity.ok(quizService.submit(id, userId(ud), answers));
    }

    @GetMapping("/attempts/my")
    public ResponseEntity<List<QuizAttempt>> myAttempts(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(quizService.myAttempts(userId(ud)));
    }

    @GetMapping("/attempts/instructor")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<List<QuizAttempt>> instructorAttempts(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(quizService.attemptsForInstructor(userId(ud)));
    }

    @GetMapping("/{id}/leaderboard")
    public ResponseEntity<List<QuizAttempt>> leaderboard(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.leaderboard(id));
    }

    @GetMapping("/{id}/can-reattempt")
    public ResponseEntity<Map<String, Boolean>> canReattempt(@PathVariable Long id,
                                                              @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(Map.of("canReattempt", quizService.canReattempt(id, userId(ud))));
    }
}
