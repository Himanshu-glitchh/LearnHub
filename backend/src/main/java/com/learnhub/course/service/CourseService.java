package com.learnhub.course.service;

import com.learnhub.auth.entity.User;
import com.learnhub.auth.repository.UserRepository;
import com.learnhub.common.exception.BadRequestException;
import com.learnhub.common.exception.ResourceNotFoundException;
import com.learnhub.course.entity.*;
import com.learnhub.notification.entity.Notification;
import com.learnhub.notification.service.NotificationService;
import com.learnhub.course.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepo;
    private final SectionRepository sectionRepo;
    private final LessonRepository lessonRepo;
    private final EnrollmentRepository enrollmentRepo;
    private final ReviewRepository reviewRepo;
    private final UserRepository userRepo;
    private final NotificationService notificationService;

    public Page<Course> search(String category, String level, String search, int page, int size) {
        return courseRepo.search(
                category != null ? category : "",
                level != null ? level : "",
                search != null ? search : "",
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
    }

    public Course get(Long id) {
        return courseRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Course", id));
    }

    public List<Course> myCreated(Long instructorId) {
        return courseRepo.findByInstructorId(instructorId);
    }

    @Transactional
    public Course create(Long instructorId, Map<String, Object> body) {
        User instructor = userRepo.findById(instructorId).orElseThrow();
        Course course = Course.builder()
                .instructor(instructor)
                .title((String) body.get("title"))
                .description((String) body.get("description"))
                .category((String) body.get("category"))
                .level((String) body.get("level"))
                .price(java.math.BigDecimal.ZERO)
                .thumbnailUrl((String) body.get("thumbnailUrl"))
                .courseType(body.containsKey("courseType") ? (String) body.get("courseType") : "RECORDED")
                .externalUrl((String) body.get("externalUrl"))
                .status(Course.CourseStatus.PUBLISHED)
                .build();
        return courseRepo.save(course);
    }

    @Transactional
    public Course update(Long courseId, Long instructorId, Map<String, Object> body) {
        Course course = get(courseId);
        if (!course.getInstructor().getId().equals(instructorId))
            throw new BadRequestException("Not your course");
        if (body.containsKey("title")) course.setTitle((String) body.get("title"));
        if (body.containsKey("description")) course.setDescription((String) body.get("description"));
        if (body.containsKey("category")) course.setCategory((String) body.get("category"));
        if (body.containsKey("level")) course.setLevel((String) body.get("level"));
        if (body.containsKey("price")) course.setPrice(new java.math.BigDecimal(body.get("price").toString()));
        if (body.containsKey("status")) course.setStatus(Course.CourseStatus.valueOf((String) body.get("status")));
        return courseRepo.save(course);
    }

    @Transactional
    public void delete(Long courseId, Long instructorId) {
        Course course = get(courseId);
        if (!course.getInstructor().getId().equals(instructorId))
            throw new BadRequestException("Not your course");
        courseRepo.delete(course);
    }

    @Transactional
    public Section addSection(Long courseId, String title, int orderIndex) {
        Course course = get(courseId);
        Section s = sectionRepo.save(Section.builder().course(course).title(title).orderIndex(orderIndex).build());
        course.getSections().add(s);
        return s;
    }

    @Transactional
    public Lesson addLesson(Long sectionId, Map<String, Object> body) {
        Section section = sectionRepo.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Section", sectionId));
        return lessonRepo.save(Lesson.builder()
                .section(section)
                .title((String) body.get("title"))
                .contentType(Lesson.ContentType.valueOf((String) body.getOrDefault("contentType", "TEXT")))
                .contentUrl((String) body.get("contentUrl"))
                .description((String) body.get("description"))
                .durationSeconds(body.containsKey("durationSeconds") ? Integer.valueOf(body.get("durationSeconds").toString()) : null)
                .orderIndex(body.containsKey("orderIndex") ? Integer.valueOf(body.get("orderIndex").toString()) : 0)
                .isFreePreview(Boolean.TRUE.equals(body.get("isFreePreview")))
                .build());
    }

    @Transactional
    public Enrollment enroll(Long studentId, Long courseId) {
        Course course = get(courseId);
        if (course.getInstructor().getId().equals(studentId))
            throw new BadRequestException("You cannot enroll in your own course");
        if (enrollmentRepo.existsByStudentIdAndCourseId(studentId, courseId))
            throw new BadRequestException("Already enrolled");
        User student = userRepo.findById(studentId).orElseThrow();
        Enrollment e = enrollmentRepo.save(Enrollment.builder().student(student).course(course).build());
        course.setTotalEnrollments(course.getTotalEnrollments() + 1);
        courseRepo.save(course);
        // Notify instructor
        notificationService.create(
            course.getInstructor().getId(),
            "📚 " + student.getFullName() + " enrolled in your course: \"" + course.getTitle() + "\"",
            "/instructor",
            Notification.NotificationType.ENROLLMENT
        );
        return e;
    }

    public List<Enrollment> enrollmentsForInstructor(Long instructorId) {
        return enrollmentRepo.findByCourseInstructorId(instructorId);
    }

    public List<Enrollment> myEnrollments(Long studentId) {
        return enrollmentRepo.findByStudentId(studentId);
    }

    @Transactional
    public Review addReview(Long studentId, Long courseId, int rating, String comment) {
        if (!enrollmentRepo.existsByStudentIdAndCourseId(studentId, courseId))
            throw new BadRequestException("Must be enrolled to review");
        if (reviewRepo.findByStudentIdAndCourseId(studentId, courseId).isPresent())
            throw new BadRequestException("Already reviewed");
        User student = userRepo.findById(studentId).orElseThrow();
        Course course = get(courseId);
        Review review = reviewRepo.save(Review.builder().student(student).course(course)
                .rating(rating).comment(comment).build());
        Double avg = reviewRepo.avgRatingByCourseId(courseId);
        course.setAverageRating(avg != null ? avg : 0.0);
        course.setTotalReviews(course.getTotalReviews() + 1);
        courseRepo.save(course);
        return review;
    }

    public List<Review> getReviews(Long courseId) {
        return reviewRepo.findByCourseId(courseId);
    }
}
