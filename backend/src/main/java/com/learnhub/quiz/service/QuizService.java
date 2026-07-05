package com.learnhub.quiz.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.learnhub.auth.entity.User;
import com.learnhub.auth.repository.UserRepository;
import com.learnhub.batch.repository.BatchQuizAssignmentRepository;
import com.learnhub.common.exception.BadRequestException;
import com.learnhub.notification.entity.Notification;
import com.learnhub.notification.service.NotificationService;
import com.learnhub.common.exception.ResourceNotFoundException;
import com.learnhub.course.repository.CourseRepository;
import com.learnhub.quiz.entity.*;
import com.learnhub.quiz.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepo;
    private final QuestionRepository questionRepo;
    private final QuizAttemptRepository attemptRepo;
    private final BatchQuizAssignmentRepository batchQuizAssignRepo;
    private final UserRepository userRepo;
    private final CourseRepository courseRepo;
    private final ObjectMapper objectMapper;
    private final NotificationService notificationService;

    public List<Quiz> list() {
        return quizRepo.findAll();
    }

    public Quiz get(Long id) {
        return quizRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Quiz", id));
    }

    public List<Question> getQuestions(Long quizId) {
        return questionRepo.findByQuizId(quizId);
    }

    @Transactional
    public Quiz create(Map<String, Object> body, Long courseId) {
        Quiz quiz = Quiz.builder()
                .title((String) body.get("title"))
                .topic((String) body.get("topic"))
                .description((String) body.get("description"))
                .durationMinutes(body.containsKey("durationMinutes") ? Integer.valueOf(body.get("durationMinutes").toString()) : null)
                .passingScore(body.containsKey("passingScore") ? Integer.valueOf(body.get("passingScore").toString()) : 60)
                .randomizeQuestions(Boolean.TRUE.equals(body.get("randomizeQuestions")))
                .course(courseId != null ? courseRepo.findById(courseId).orElse(null) : null)
                .build();
        return quizRepo.save(quiz);
    }

    @Transactional
    public Quiz update(Long quizId, Map<String, Object> body) {
        Quiz quiz = get(quizId);
        if (body.containsKey("title")) quiz.setTitle((String) body.get("title"));
        if (body.containsKey("topic")) quiz.setTopic((String) body.get("topic"));
        if (body.containsKey("durationMinutes")) quiz.setDurationMinutes(Integer.valueOf(body.get("durationMinutes").toString()));
        if (body.containsKey("passingScore")) quiz.setPassingScore(Integer.valueOf(body.get("passingScore").toString()));
        if (body.containsKey("description")) quiz.setDescription((String) body.get("description"));
        return quizRepo.save(quiz);
    }

    @Transactional
    public void delete(Long quizId) {
        quizRepo.deleteById(quizId);
    }

    @Transactional
    public void deleteQuestion(Long questionId) {
        questionRepo.deleteById(questionId);
    }

    @Transactional
    public Question addQuestion(Long quizId, Map<String, Object> body) {
        Quiz quiz = get(quizId);
        List<String> options = (List<String>) body.get("options");
        String optionsJson = null;
        if (options != null) {
            try { optionsJson = objectMapper.writeValueAsString(options); } catch (JsonProcessingException ignored) {}
        }
        return questionRepo.save(Question.builder()
                .quiz(quiz)
                .questionText((String) body.get("questionText"))
                .type(Question.QuestionType.valueOf((String) body.getOrDefault("type", "MCQ")))
                .optionsJson(optionsJson)
                .correctAnswer((String) body.get("correctAnswer"))
                .difficulty(Question.Difficulty.valueOf((String) body.getOrDefault("difficulty", "MEDIUM")))
                .explanation((String) body.get("explanation"))
                .marks(body.containsKey("marks") ? Integer.valueOf(body.get("marks").toString()) : 1)
                .build());
    }

    public List<QuizAttempt> attemptsForInstructor(Long instructorId) {
        return attemptRepo.findAll().stream()
                .filter(a -> a.getQuiz().getCourse() != null
                        && a.getQuiz().getCourse().getInstructor().getId().equals(instructorId))
                .toList();
    }

    @Transactional
    public QuizAttempt submit(Long quizId, Long studentId, Map<String, String> answers) {
        Quiz quiz = get(quizId);
        // Block instructor from submitting their own quiz
        if (quiz.getCourse() != null && quiz.getCourse().getInstructor().getId().equals(studentId))
            throw new BadRequestException("You cannot submit your own quiz");
        User student = userRepo.findById(studentId).orElseThrow();

        // Check max attempts from batch assignment
        var assignment = batchQuizAssignRepo.findForStudent(studentId).stream()
                .filter(a -> a.getQuiz().getId().equals(quizId)).findFirst();

        int maxAttempts = assignment.map(a -> a.getMaxAttempts() != null ? a.getMaxAttempts() : 3).orElse(Integer.MAX_VALUE);
        long existingAttempts = attemptRepo.countByQuizIdAndStudentId(quizId, studentId);

        // Only block if assigned with a limit AND student passed already
        var lastAttempt = attemptRepo.findTopByQuizIdAndStudentIdOrderByCreatedAtDesc(quizId, studentId);
        if (lastAttempt.isPresent() && lastAttempt.get().isPassed() && existingAttempts >= maxAttempts) {
            throw new BadRequestException("Max attempts reached and quiz already passed");
        }
        if (!lastAttempt.map(a -> !a.isPassed()).orElse(true) && existingAttempts >= maxAttempts) {
            throw new BadRequestException("Max attempts reached. Contact your instructor.");
        }

        List<Question> questions = questionRepo.findByQuizId(quizId);
        int totalMarks = questions.stream().mapToInt(q -> q.getMarks() != null ? q.getMarks() : 1).sum();
        int score = 0;
        for (Question q : questions) {
            String submitted = answers.get(String.valueOf(q.getId()));
            if (submitted != null && submitted.equalsIgnoreCase(q.getCorrectAnswer())) {
                score += q.getMarks() != null ? q.getMarks() : 1;
            }
        }
        int percentage = totalMarks > 0 ? (score * 100 / totalMarks) : 0;
        boolean passed = percentage >= (quiz.getPassingScore() != null ? quiz.getPassingScore() : 60);

        String answersJson = null;
        try { answersJson = objectMapper.writeValueAsString(answers); } catch (JsonProcessingException ignored) {}

        QuizAttempt attempt = attemptRepo.save(QuizAttempt.builder()
                .quiz(quiz).student(student)
                .score(score).totalMarks(totalMarks).percentage(percentage).passed(passed)
                .answersJson(answersJson)
                .startedAt(LocalDateTime.now().minusMinutes(quiz.getDurationMinutes() != null ? quiz.getDurationMinutes() : 0))
                .completedAt(LocalDateTime.now())
                .build());

        // Notify instructor if quiz is linked to their course
        if (quiz.getCourse() != null) {
            String status = passed ? "✅ passed" : "❌ failed";
            notificationService.create(
                quiz.getCourse().getInstructor().getId(),
                "🎯 " + student.getFullName() + " " + status + " your quiz \"" + quiz.getTitle()
                    + "\" with " + percentage + "%",
                "/instructor",
                Notification.NotificationType.QUIZ
            );
        }
        return attempt;
    }

    public List<QuizAttempt> myAttempts(Long studentId) {
        return attemptRepo.findByStudentId(studentId);
    }

    public List<QuizAttempt> leaderboard(Long quizId) {
        return attemptRepo.findByQuizId(quizId).stream()
                .sorted((a, b) -> Integer.compare(b.getScore(), a.getScore()))
                .limit(20).toList();
    }

    public boolean canReattempt(Long quizId, Long studentId) {
        var assignment = batchQuizAssignRepo.findForStudent(studentId).stream()
                .filter(a -> a.getQuiz().getId().equals(quizId)).findFirst();
        int maxAttempts = assignment.map(a -> a.getMaxAttempts() != null ? a.getMaxAttempts() : 3).orElse(Integer.MAX_VALUE);
        long count = attemptRepo.countByQuizIdAndStudentId(quizId, studentId);
        var last = attemptRepo.findTopByQuizIdAndStudentIdOrderByCreatedAtDesc(quizId, studentId);
        if (last.isEmpty()) return true;
        if (last.get().isPassed()) return false; // passed, no need to reattempt
        return count < maxAttempts;
    }
}
