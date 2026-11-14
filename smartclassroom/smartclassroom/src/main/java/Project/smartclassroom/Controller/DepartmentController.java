
package Project.smartclassroom.Controller;

import Project.smartclassroom.DTO.DepartmentResponse;
import Project.smartclassroom.Entity.Department;
import Project.smartclassroom.Repository.DepartmentRepository;
import Project.smartclassroom.Repository.StudentRepository;
import Project.smartclassroom.Repository.TeacherRepository;
import Project.smartclassroom.Repository.CourseRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentRepository departmentRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final CourseRepository courseRepository;

    public DepartmentController(
            DepartmentRepository departmentRepository,
            StudentRepository studentRepository,
            TeacherRepository teacherRepository,
            CourseRepository courseRepository) {

        this.departmentRepository = departmentRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.courseRepository = courseRepository;
    }

    @PostMapping
    public DepartmentResponse createDepartment(
            @RequestBody Department department) {

        Department saved = departmentRepository.save(department);

        return new DepartmentResponse(
                saved.getId(),
                saved.getName(),
                saved.getCode()
        );
    }

    @GetMapping
    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll()
                .stream()
                .map(department -> new DepartmentResponse(
                        department.getId(),
                        department.getName(),
                        department.getCode()
                ))
                .toList();
    }

    @GetMapping("/{id}")
    public DepartmentResponse getDepartmentById(@PathVariable Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Department not found: " + id));

        return new DepartmentResponse(
                department.getId(),
                department.getName(),
                department.getCode()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDepartment(@PathVariable Long id) {

        Department department = departmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Department not found: " + id));

        boolean hasStudents =
                studentRepository.existsByDepartmentId(id);

        boolean hasTeachers =
                teacherRepository.existsByDepartmentId(id);

        boolean hasCourses =
                courseRepository.existsByDepartmentId(id);

        if (hasStudents || hasTeachers || hasCourses) {
            return ResponseEntity.badRequest().body(
                    "Cannot delete this department because students, teachers, " +
                            "or courses are still associated with it."
            );
        }

        departmentRepository.delete(department);

        return ResponseEntity.ok("Department deleted successfully");
    }
}
