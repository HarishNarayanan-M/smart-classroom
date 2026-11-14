
package Project.smartclassroom.Controller;

import Project.smartclassroom.DTO.CourseResponse;
import Project.smartclassroom.Service.CourseTeacherService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher")
public class TeacherCourseController {

    private final CourseTeacherService courseTeacherService;

    public TeacherCourseController(
            CourseTeacherService courseTeacherService) {
        this.courseTeacherService = courseTeacherService;
    }

    @GetMapping("/courses")
    public List<CourseResponse> getMyCourses(
            Authentication authentication) {

        return courseTeacherService.getCoursesForLoggedInTeacher(
                authentication.getName());
    }
}
