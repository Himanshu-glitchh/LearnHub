package com.learnhub.classroom.service;

import com.learnhub.auth.entity.User;
import com.learnhub.auth.repository.UserRepository;
import com.learnhub.classroom.entity.*;
import com.learnhub.classroom.repository.*;
import com.learnhub.common.exception.BadRequestException;
import com.learnhub.common.exception.ResourceNotFoundException;
import com.learnhub.notification.entity.Notification;
import com.learnhub.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ClassroomService {

    private final ClassroomRepository classroomRepo;
    private final AssignmentRepository assignmentRepo;
    private final SubmissionRepository submissionRepo;
    private final UserRepository userRepo;
    private final NotificationService notificationService;

    /* ── CLASSROOMS ──────────────────────────────── */

    @Transactional
    public Classroom create(Long instructorId, String name, String description) {
        User instructor = userRepo.findById(instructorId).orElseThrow();
        return classroomRepo.save(Classroom.builder()
                .instructor(instructor).name(name).description(description).build());
    }

    public List<Classroom> myClassrooms(Long userId) {
        List<Classroom> owned = classroomRepo.findByInstructorId(userId);
        List<Classroom> enrolled = classroomRepo.findByStudentId(userId);
        owned.addAll(enrolled);
        return owned;
    }

    public List<Classroom> instructorClassrooms(Long instructorId) {
        return classroomRepo.findByInstructorId(instructorId);
    }

    public Classroom get(Long id) {
        return classroomRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Classroom", id));
    }

    @Transactional
    public Classroom joinByCode(Long studentId, String joinCode) {
        Classroom classroom = classroomRepo.findByJoinCode(joinCode)
                .orElseThrow(() -> new BadRequestException("Invalid join code: " + joinCode));
        User student = userRepo.findById(studentId).orElseThrow();
        classroom.getStudents().add(student);
        notificationService.create(classroom.getInstructor().getId(),
                "🎓 " + student.getFullName() + " joined your classroom: \"" + classroom.getName() + "\"",
                "/instructor", Notification.NotificationType.ENROLLMENT);
        return classroomRepo.save(classroom);
    }

    @Transactional
    public void addStudent(Long classroomId, Long studentId) {
        Classroom classroom = get(classroomId);
        User student = userRepo.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("User", studentId));
        classroom.getStudents().add(student);
        classroomRepo.save(classroom);
        notificationService.create(studentId,
                "📚 You've been added to classroom: \"" + classroom.getName() + "\"",
                "/classrooms", Notification.NotificationType.ENROLLMENT);
    }

    @Transactional
    public void removeStudent(Long classroomId, Long studentId) {
        Classroom classroom = get(classroomId);
        classroom.getStudents().removeIf(s -> s.getId().equals(studentId));
        classroomRepo.save(classroom);
    }

    /* ── ASSIGNMENTS ─────────────────────────────── */

    @Transactional
    public Assignment createAssignment(Long classroomId, Long instructorId, Map<String, Object> body) {
        Classroom classroom = get(classroomId);
        if (!classroom.getInstructor().getId().equals(instructorId))
            throw new BadRequestException("Not your classroom");

        Assignment assignment = assignmentRepo.save(Assignment.builder()
                .classroom(classroom)
                .title((String) body.get("title"))
                .description((String) body.get("description"))
                .dueDate(body.containsKey("dueDate") && body.get("dueDate") != null
                        ? LocalDateTime.parse((String) body.get("dueDate")) : null)
                .maxMarks(body.containsKey("maxMarks")
                        ? Integer.valueOf(body.get("maxMarks").toString()) : 100)
                .build());

        // Notify all students
        classroom.getStudents().forEach(student ->
            notificationService.create(student.getId(),
                    "📝 New assignment in \"" + classroom.getName() + "\": " + assignment.getTitle(),
                    "/classrooms/" + classroomId, Notification.NotificationType.ASSIGNMENT)
        );
        return assignment;
    }

    public List<Assignment> getAssignments(Long classroomId) {
        return assignmentRepo.findByClassroomId(classroomId);
    }

    @Transactional
    public void deleteAssignment(Long assignmentId, Long instructorId) {
        Assignment a = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment", assignmentId));
        if (!a.getClassroom().getInstructor().getId().equals(instructorId))
            throw new BadRequestException("Not your assignment");
        assignmentRepo.delete(a);
    }

    /* ── SUBMISSIONS ─────────────────────────────── */

    @Transactional
    public Submission submit(Long assignmentId, Long studentId, String content, String fileUrl) {
        Assignment assignment = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment", assignmentId));
        User student = userRepo.findById(studentId).orElseThrow();
        boolean late = assignment.getDueDate() != null && LocalDateTime.now().isAfter(assignment.getDueDate());

        Submission existing = submissionRepo.findByAssignmentIdAndStudentId(assignmentId, studentId).orElse(null);
        if (existing != null) {
            existing.setContent(content);
            existing.setFileUrl(fileUrl);
            existing.setStatus(late ? Submission.SubmissionStatus.LATE : Submission.SubmissionStatus.SUBMITTED);
            return submissionRepo.save(existing);
        }

        Submission sub = submissionRepo.save(Submission.builder()
                .assignment(assignment).student(student)
                .content(content).fileUrl(fileUrl)
                .status(late ? Submission.SubmissionStatus.LATE : Submission.SubmissionStatus.SUBMITTED)
                .build());

        // Notify instructor
        notificationService.create(assignment.getClassroom().getInstructor().getId(),
                "📤 " + student.getFullName() + " submitted \"" + assignment.getTitle() + "\"",
                "/classrooms/" + assignment.getClassroom().getId(),
                Notification.NotificationType.ASSIGNMENT);
        return sub;
    }

    public List<Submission> getSubmissions(Long assignmentId) {
        return submissionRepo.findByAssignmentId(assignmentId);
    }

    public List<Submission> mySubmissions(Long studentId) {
        return submissionRepo.findByStudentId(studentId);
    }

    @Transactional
    public Submission grade(Long submissionId, Long instructorId, Integer marks, String feedback) {
        Submission sub = submissionRepo.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission", submissionId));
        if (!sub.getAssignment().getClassroom().getInstructor().getId().equals(instructorId))
            throw new BadRequestException("Not your classroom");
        sub.setMarksObtained(marks);
        sub.setFeedback(feedback);
        sub.setStatus(Submission.SubmissionStatus.GRADED);
        Submission saved = submissionRepo.save(sub);

        // Notify student
        notificationService.create(sub.getStudent().getId(),
                "✅ Your submission for \"" + sub.getAssignment().getTitle() + "\" was graded: " + marks + " marks",
                "/classrooms", Notification.NotificationType.ASSIGNMENT);
        return saved;
    }
}
