package Project.smartclassroom.Controller;

import Project.smartclassroom.DTO.CourseResponse;
import Project.smartclassroom.DTO.DepartmentResponse;
import Project.smartclassroom.DTO.StudentResponse;
import Project.smartclassroom.DTO.TeacherResponse;
import Project.smartclassroom.Service.AdminService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/teachers")
    public List<TeacherResponse> getAllTeachers() {
        return adminService.getAllTeachers();
    }

    @PutMapping("/teachers/{teacherId}/approve")
    public String approveTeacher(
            @PathVariable Long teacherId) {

        adminService.approveTeacher(teacherId);

        return "Teacher approved successfully";
    }

    @GetMapping("/students")
    public List<StudentResponse> getAllStudents() {
        return adminService.getAllStudents();
    }

    @GetMapping("/courses")
    public List<CourseResponse> getAllCourses() {
        return adminService.getAllCourses();
    }

    @GetMapping("/departments")
    public List<DepartmentResponse> getAllDepartments() {
        return adminService.getAllDepartments();
    }

    @PutMapping("/teachers/{teacherId}/reject")
    public String rejectTeacher(@PathVariable Long teacherId) {
        adminService.rejectTeacher(teacherId);
        return "Teacher rejected successfully";
    }

    @DeleteMapping("/students/{studentId}")
    public String removeStudent(@PathVariable Long studentId) {
        adminService.removeStudent(studentId);
        return "Student removed successfully";
    }
}

