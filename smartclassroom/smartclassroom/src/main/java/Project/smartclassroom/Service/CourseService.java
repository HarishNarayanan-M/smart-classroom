package Project.smartclassroom.Service;

import Project.smartclassroom.DTO.CourseRequest;
import Project.smartclassroom.DTO.CourseResponse;
import Project.smartclassroom.Entity.Course;
import Project.smartclassroom.Entity.Department;
import Project.smartclassroom.Repository.CourseRepository;
import Project.smartclassroom.Repository.DepartmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {
    private final CourseRepository courseRepository;
    private final DepartmentRepository departmentRepository;

    public CourseService(CourseRepository courseRepository,
                         DepartmentRepository departmentRepository) {
        this.courseRepository = courseRepository;
        this.departmentRepository = departmentRepository;
    }

    public CourseResponse createCourse(CourseRequest request) {
            if (courseRepository.existsByCodeIgnoreCase(request.getCode().trim())) {
                throw new RuntimeException(
                        "A course with this code already exists"
                );
            }


        Department department = departmentRepository
                .findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        Course course = new Course();

        course.setName(request.getName());
        course.setCode(request.getCode());
        course.setDepartment(department);

        Course savedCourse = courseRepository.save(course);

        CourseResponse response = new CourseResponse();

        response.setId(savedCourse.getId());
        response.setName(savedCourse.getName());
        response.setCode(savedCourse.getCode());
        response.setDepartmentId(savedCourse.getDepartment().getId());
        response.setDepartmentName(savedCourse.getDepartment().getName());

        return response;
    }

    public List<CourseResponse> getAllCourses() {

        List<Course> courses = courseRepository.findAll();

        return courses.stream()
                .map(course -> {
                    CourseResponse response = new CourseResponse();

                    response.setId(course.getId());
                    response.setName(course.getName());
                    response.setCode(course.getCode());
                    response.setDepartmentId(course.getDepartment().getId());
                    response.setDepartmentName(course.getDepartment().getName());

                    return response;
                })
                .toList();
    }
}
