package Project.smartclassroom.Controller;

import Project.smartclassroom.DTO.CourseResponse;
import Project.smartclassroom.Service.CourseTeacherService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/courses")
public class CourseTeacherController {

    private final CourseTeacherService courseTeacherService;

    public CourseTeacherController(CourseTeacherService courseTeacherService) {
        this.courseTeacherService = courseTeacherService;
    }

    @PostMapping("/{courseId}/teachers/{teacherId}")
    public String assignTeacherToCourse(
            @PathVariable Long courseId,
            @PathVariable Long teacherId) {

        courseTeacherService.assignTeacher(courseId, teacherId);

        return "Teacher assigned to course successfully";
    }

    @GetMapping("/teacher/{teacherId}/courses")
    public List<CourseResponse> getTeacherCourses(
            @PathVariable Long teacherId) {

        return courseTeacherService.getTeacherCourses(teacherId);
    }

    @DeleteMapping("/{courseId}/teachers/{teacherId}")
    public String unassignTeacherFromCourse(
            @PathVariable Long courseId,
            @PathVariable Long teacherId) {

        courseTeacherService.unassignTeacher(courseId, teacherId);

        return "Teacher unassigned from course successfully";
    }
}