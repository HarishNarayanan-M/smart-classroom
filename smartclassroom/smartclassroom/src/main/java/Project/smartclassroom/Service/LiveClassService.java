package Project.smartclassroom.Service;

import Project.smartclassroom.DTO.LiveClassRequest;
import Project.smartclassroom.DTO.LiveClassResponse;
import Project.smartclassroom.Entity.Course;
import Project.smartclassroom.Entity.LiveClass;
import Project.smartclassroom.Entity.Teacher;
import Project.smartclassroom.Repository.CourseRepository;
import Project.smartclassroom.Repository.CourseTeacherRepository;
import Project.smartclassroom.Repository.LiveClassRepository;
import Project.smartclassroom.Repository.TeacherRepository;
import Project.smartclassroom.Entity.Student;
import Project.smartclassroom.Repository.StudentRepository;
import Project.smartclassroom.Repository.EnrollmentRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class LiveClassService {

    private final LiveClassRepository liveClassRepository;
    private final CourseRepository courseRepository;
    private final TeacherRepository teacherRepository;
    private final CourseTeacherRepository courseTeacherRepository;
    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;

    public LiveClassService(
            LiveClassRepository liveClassRepository,
            CourseRepository courseRepository,
            TeacherRepository teacherRepository,
            CourseTeacherRepository courseTeacherRepository,
            StudentRepository studentRepository,
            EnrollmentRepository enrollmentRepository) {

        this.liveClassRepository = liveClassRepository;
        this.courseRepository = courseRepository;
        this.teacherRepository = teacherRepository;
        this.courseTeacherRepository = courseTeacherRepository;
        this.studentRepository = studentRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @Transactional
    public LiveClassResponse scheduleClass(LiveClassRequest request) {

        if (request.getTitle() == null
                || request.getTitle().isBlank()) {
            throw new IllegalArgumentException(
                    "Class title is required");
        }

        if (request.getCourseId() == null
                || request.getStartTime() == null
                || request.getEndTime() == null) {
            throw new IllegalArgumentException(
                    "Course ID, start time and end time are required");
        }

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException(
                    "End time must be after start time");
        }

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getPrincipal().equals("anonymousUser")) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Please log in first");
        }
        boolean isTeacher = authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_TEACHER"));

        if (!isTeacher) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Only teachers can schedule live classes");
        }

        String email = authentication.getName();

        Teacher teacher = teacherRepository.findByUser_Email(email)
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException(
                        "Authenticated teacher profile not found"));

        Long courseId = request.getCourseId();

        if (!courseTeacherRepository
                .existsByCourseIdAndTeacherId(courseId, teacher.getId())) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You are not assigned to this course");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Course not found"));

        LiveClass liveClass = new LiveClass();
        liveClass.setTitle(request.getTitle().trim());
        liveClass.setDescription(request.getDescription());
        liveClass.setCourse(course);
        liveClass.setTeacher(teacher);
        liveClass.setRoomName(
                "smartclassroom-" + UUID.randomUUID());
        liveClass.setStartTime(request.getStartTime());
        liveClass.setEndTime(request.getEndTime());
        liveClass.setStatus("SCHEDULED");

        return toResponse(liveClassRepository.save(liveClass));
    }

    @Transactional(readOnly = true)
    public List<LiveClassResponse> getClassesByCourse(Long courseId) {

        if (!courseRepository.existsById(courseId)) {
            throw new IllegalArgumentException("Course not found");
        }

        validateCourseAccess(courseId);

        return liveClassRepository.findByCourseId(courseId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private void validateCourseAccess(Long courseId) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getPrincipal().equals("anonymousUser")) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Please log in first");
        }

        boolean isAdmin = authentication.getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) {
            return;
        }

        boolean isTeacher = authentication.getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_TEACHER"));

        if (isTeacher) {
            Teacher teacher = teacherRepository
                    .findByUser_Email(authentication.getName())
                    .orElseThrow(() ->
                            new org.springframework.security.access.AccessDeniedException(
                                    "Teacher profile not found"));

            if (!courseTeacherRepository
                    .existsByCourseIdAndTeacherId(courseId, teacher.getId())) {
                throw new org.springframework.security.access.AccessDeniedException(
                        "You are not assigned to this course");
            }

            return;
        }

        boolean isStudent = authentication.getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"));

        if (isStudent) {
            Student student = studentRepository
                    .findByUser_Email(authentication.getName())
                    .orElseThrow(() ->
                            new org.springframework.security.access.AccessDeniedException(
                                    "Student profile not found"));

            if (!enrollmentRepository
                    .existsByStudentIdAndCourseId(student.getId(), courseId)) {
                throw new org.springframework.security.access.AccessDeniedException(
                        "You are not enrolled in this course");
            }

            return;
        }

        throw new org.springframework.security.access.AccessDeniedException(
                "You are not authorized to view this course");
    }

    private LiveClassResponse toResponse(LiveClass liveClass) {

        LiveClassResponse response = new LiveClassResponse();

        response.setId(liveClass.getId());
        response.setTitle(liveClass.getTitle());
        response.setDescription(liveClass.getDescription());
        response.setCourseId(liveClass.getCourse().getId());
        response.setCourseName(liveClass.getCourse().getName());
        response.setTeacherId(liveClass.getTeacher().getId());
        response.setTeacherName(
                liveClass.getTeacher().getUser().getName());
        response.setRoomName(liveClass.getRoomName());
        response.setStartTime(liveClass.getStartTime());
        response.setEndTime(liveClass.getEndTime());
        response.setStatus(liveClass.getStatus());

        return response;
    }
}
