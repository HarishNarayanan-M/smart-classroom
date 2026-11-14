package Project.smartclassroom.Controller;

import Project.smartclassroom.DTO.CourseResponse;
import Project.smartclassroom.DTO.EnrolledStudentResponse;
import Project.smartclassroom.Entity.Student;
import Project.smartclassroom.Service.EnrollmentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @PostMapping("/{studentId}/courses/{courseId}")
    public String enrollStudent(
            @PathVariable Long studentId,
            @PathVariable Long courseId) {

        enrollmentService.enrollStudent(studentId, courseId);

        return "Student enrolled in course successfully";
    }

    @GetMapping("/student/{studentId}/courses")
    public List<CourseResponse> getStudentCourses(
            @PathVariable Long studentId) {

        return enrollmentService.getStudentCourses(studentId);
    }

    @GetMapping("/course/{courseId}/students")
    public List<EnrolledStudentResponse> getStudentsByCourse(
            @PathVariable Long courseId) {

        return enrollmentService.getStudentsByCourse(courseId);
    }
    @DeleteMapping("/{studentId}/courses/{courseId}")
    public String unenrollStudent(
            @PathVariable Long studentId,
            @PathVariable Long courseId) {

        enrollmentService.unenrollStudent(studentId, courseId);

        return "Student unenrolled from course successfully";
    }
}