package Project.smartclassroom.Service;

import Project.smartclassroom.DTO.AttendanceRequest;
import Project.smartclassroom.DTO.AttendanceResponse;
import Project.smartclassroom.DTO.AttendanceSummaryResponse;
import Project.smartclassroom.Entity.Attendance;
import Project.smartclassroom.Entity.Course;
import Project.smartclassroom.Entity.Student;
import Project.smartclassroom.Entity.Teacher;
import Project.smartclassroom.Repository.AttendanceRepository;
import Project.smartclassroom.Repository.StudentRepository;
import Project.smartclassroom.Repository.CourseRepository;
import Project.smartclassroom.Repository.TeacherRepository;
import Project.smartclassroom.Repository.CourseTeacherRepository;
import Project.smartclassroom.Repository.EnrollmentRepository;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final TeacherRepository teacherRepository;
    private final CourseTeacherRepository courseTeacherRepository;
    private final EnrollmentRepository enrollmentRepository;

    public AttendanceService(
            AttendanceRepository attendanceRepository,
            StudentRepository studentRepository,
            CourseRepository courseRepository,
            TeacherRepository teacherRepository,
            CourseTeacherRepository courseTeacherRepository,
            EnrollmentRepository enrollmentRepository) {

        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
        this.teacherRepository = teacherRepository;
        this.courseTeacherRepository = courseTeacherRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    // 1. Mark attendance
    @Transactional
    public AttendanceResponse markAttendance(
            Long courseId,
            AttendanceRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Attendance request is required");
        }

        if (courseId == null) {
            throw new IllegalArgumentException(
                    "Course ID is required");
        }

        if (request.getStudentId() == null) {
            throw new IllegalArgumentException(
                    "Student ID is required");
        }

        if (request.getDate() == null) {
            throw new IllegalArgumentException(
                    "Attendance date is required");
        }

        if (request.getStatus() == null ||
                (!request.getStatus().equalsIgnoreCase("PRESENT") &&
                        !request.getStatus().equalsIgnoreCase("ABSENT"))) {

            throw new IllegalArgumentException(
                    "Status must be PRESENT or ABSENT");
        }

        // Only an assigned teacher can mark attendance.
        Teacher teacher = getAuthenticatedTeacher();

        validateTeacherCourseAccess(courseId, teacher);

        Student student = studentRepository
                .findById(request.getStudentId())
                .orElseThrow(() ->
                        new RuntimeException("Student not found"));

        Course course = courseRepository
                .findById(courseId)
                .orElseThrow(() ->
                        new RuntimeException("Course not found"));

        // Student must be enrolled in this course.
        if (!enrollmentRepository.existsByStudentIdAndCourseId(
                student.getId(), course.getId())) {

            throw new IllegalArgumentException(
                    "Student is not enrolled in this course");
        }

        if (attendanceRepository.existsByStudentIdAndCourseIdAndDate(
                student.getId(),
                course.getId(),
                request.getDate())) {

            throw new DuplicateAttendanceException(
                    "Attendance already marked for this student on this date");
        }

        Attendance attendance = new Attendance();
        attendance.setStudent(student);
        attendance.setCourse(course);
        attendance.setDate(request.getDate());
        attendance.setStatus(request.getStatus().toUpperCase());

        Attendance savedAttendance =
                attendanceRepository.save(attendance);

        return mapToResponse(savedAttendance);
    }

    // 2. Get attendance for a course on a particular date.
    // Assigned teachers and admins can access this endpoint.
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAttendanceByCourseAndDate(
            Long courseId,
            LocalDate date) {

        if (courseId == null || date == null) {
            throw new IllegalArgumentException(
                    "Course ID and attendance date are required");
        }

        courseRepository.findById(courseId)
                .orElseThrow(() ->
                        new RuntimeException("Course not found"));

        if (isAdmin()) {
            return attendanceRepository
                    .findByCourseIdAndDate(courseId, date)
                    .stream()
                    .map(this::mapToResponse)
                    .toList();
        }

        Teacher teacher = getAuthenticatedTeacher();
        validateTeacherCourseAccess(courseId, teacher);

        return attendanceRepository
                .findByCourseIdAndDate(courseId, date)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // 3. Get a student's attendance records.
    // Students can access only their own records.
    // Admins can access any student's records.
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAttendanceByStudent(
            Long studentId) {

        if (studentId == null) {
            throw new IllegalArgumentException(
                    "Student ID is required");
        }

        studentRepository.findById(studentId)
                .orElseThrow(() ->
                        new RuntimeException("Student not found"));

        if (!isAdmin()) {
            validateStudentOwnership(studentId);
        }

        return attendanceRepository
                .findByStudentId(studentId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // 4. Calculate attendance percentage.
    @Transactional(readOnly = true)
    public double calculateAttendancePercentage(
            Long studentId,
            Long courseId) {

        validateStudentAndCourse(studentId, courseId);
        validatePerformanceAccess(studentId, courseId);

        long presentCount =
                attendanceRepository
                        .countByStudentIdAndCourseIdAndStatus(
                                studentId, courseId, "PRESENT");

        long absentCount =
                attendanceRepository
                        .countByStudentIdAndCourseIdAndStatus(
                                studentId, courseId, "ABSENT");

        long totalClasses = presentCount + absentCount;

        if (totalClasses == 0) {
            return 0.0;
        }

        return Math.round(
                (presentCount * 10000.0) / totalClasses) / 100.0;
    }

    // 5. Get attendance summary.
    @Transactional(readOnly = true)
    public AttendanceSummaryResponse getAttendanceSummary(
            Long studentId,
            Long courseId) {

        validateStudentAndCourse(studentId, courseId);
        validatePerformanceAccess(studentId, courseId);

        long presentCount =
                attendanceRepository
                        .countByStudentIdAndCourseIdAndStatus(
                                studentId, courseId, "PRESENT");

        long absentCount =
                attendanceRepository
                        .countByStudentIdAndCourseIdAndStatus(
                                studentId, courseId, "ABSENT");

        long totalClasses = presentCount + absentCount;

        double percentage = totalClasses == 0
                ? 0.0
                : Math.round(
                (presentCount * 10000.0) / totalClasses
        ) / 100.0;

        AttendanceSummaryResponse response =
                new AttendanceSummaryResponse();

        response.setStudentId(studentId);
        response.setCourseId(courseId);
        response.setTotalClasses(totalClasses);
        response.setPresentCount(presentCount);
        response.setAbsentCount(absentCount);
        response.setAttendancePercentage(percentage);

        return response;
    }

    // Helper: map entity to response DTO.
    private AttendanceResponse mapToResponse(
            Attendance attendance) {

        AttendanceResponse response = new AttendanceResponse();

        response.setId(attendance.getId());
        response.setStudentId(attendance.getStudent().getId());
        response.setStudentName(
                attendance.getStudent().getUser().getName());
        response.setCourseId(attendance.getCourse().getId());
        response.setCourseName(attendance.getCourse().getName());
        response.setDate(attendance.getDate());
        response.setStatus(attendance.getStatus());

        return response;
    }

    // Helper: identify the logged-in teacher from JWT email.
    private Teacher getAuthenticatedTeacher() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication.getName() == null ||
                "anonymousUser".equals(authentication.getName())) {

            throw new AccessDeniedException(
                    "You must be logged in");
        }

        if (!authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_TEACHER"))) {

            throw new AccessDeniedException(
                    "Only teachers can perform this action");
        }

        String email = authentication.getName();

        return teacherRepository.findByUser_Email(email)
                .orElseThrow(() ->
                        new AccessDeniedException(
                                "Logged-in user is not a registered teacher"));
    }

    // Helper: verify that a teacher is assigned to the course.
    private void validateTeacherCourseAccess(
            Long courseId,
            Teacher teacher) {

        boolean assigned =
                courseTeacherRepository.existsByCourseIdAndTeacherId(
                        courseId, teacher.getId());

        if (!assigned) {
            throw new AccessDeniedException(
                    "You are not assigned to teach this course");
        }
    }

    // Helper: verify student ownership using authenticated email.
    private void validateStudentOwnership(Long studentId) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication.getName() == null ||
                "anonymousUser".equals(authentication.getName())) {

            throw new AccessDeniedException(
                    "You must be logged in");
        }

        if (!authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"))) {

            throw new AccessDeniedException(
                    "You cannot access this student's attendance");
        }

        Student loggedInStudent =
                studentRepository.findByUser_Email(authentication.getName())
                        .orElseThrow(() ->
                                new AccessDeniedException(
                                        "Student profile not found"));

        if (!loggedInStudent.getId().equals(studentId)) {
            throw new AccessDeniedException(
                    "You can only access your own attendance");
        }
    }

    // Helper: validate IDs and confirm records exist.
    private void validateStudentAndCourse(
            Long studentId,
            Long courseId) {

        if (studentId == null || courseId == null) {
            throw new IllegalArgumentException(
                    "Student ID and course ID are required");
        }

        studentRepository.findById(studentId)
                .orElseThrow(() ->
                        new RuntimeException("Student not found"));

        courseRepository.findById(courseId)
                .orElseThrow(() ->
                        new RuntimeException("Course not found"));
    }

    // Students can view their own summary.
    // Assigned teachers can view a student's summary for their course.
    // Admins can view any summary.
    private void validatePerformanceAccess(
            Long studentId,
            Long courseId) {

        if (isAdmin()) {
            return;
        }

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null &&
                authentication.isAuthenticated() &&
                authentication.getAuthorities().stream()
                        .anyMatch(a ->
                                a.getAuthority().equals("ROLE_STUDENT"))) {

            validateStudentOwnership(studentId);
            return;
        }

        Teacher teacher = getAuthenticatedTeacher();
        validateTeacherCourseAccess(courseId, teacher);
    }

    private boolean isAdmin() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        return authentication != null &&
                authentication.isAuthenticated() &&
                authentication.getAuthorities().stream()
                        .anyMatch(a ->
                                a.getAuthority().equals("ROLE_ADMIN"));
    }
}
