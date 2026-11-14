package Project.smartclassroom.Service;

import Project.smartclassroom.DTO.CourseResponse;
import Project.smartclassroom.Entity.Course;
import Project.smartclassroom.Entity.CourseTeacher;
import Project.smartclassroom.Entity.Teacher;
import Project.smartclassroom.Repository.CourseRepository;
import Project.smartclassroom.Repository.CourseTeacherRepository;
import Project.smartclassroom.Repository.TeacherRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseTeacherService {

    private final CourseTeacherRepository courseTeacherRepository;
    private final CourseRepository courseRepository;
    private final TeacherRepository teacherRepository;

    public CourseTeacherService(
            CourseTeacherRepository courseTeacherRepository,
            CourseRepository courseRepository,
            TeacherRepository teacherRepository) {

        this.courseTeacherRepository = courseTeacherRepository;
        this.courseRepository = courseRepository;
        this.teacherRepository = teacherRepository;
    }
    public void assignTeacher(Long courseId, Long teacherId) {

        if (courseTeacherRepository.existsByCourseIdAndTeacherId(courseId, teacherId)) {
            throw new RuntimeException("Teacher is already assigned to this course");
        }

        Course course = courseRepository
                .findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Step 1: Find the teacher
        Teacher teacher = teacherRepository
                .findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        // Step 2: Check whether the teacher is active
        if (!"ACTIVE".equalsIgnoreCase(teacher.getUser().getStatus())) {
            throw new RuntimeException(
                    "Cannot assign a course to an inactive teacher"
            );
        }

        // Step 3: Create and save the assignment
        CourseTeacher courseTeacher = new CourseTeacher();

        courseTeacher.setCourse(course);
        courseTeacher.setTeacher(teacher);

        courseTeacherRepository.save(courseTeacher);
    }

    public void unassignTeacher(Long courseId, Long teacherId) {

        CourseTeacher assignment = courseTeacherRepository
                .findByCourseIdAndTeacherId(courseId, teacherId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "This teacher is not assigned to this course"
                        ));

        courseTeacherRepository.delete(assignment);
    }

    public List<CourseResponse> getTeacherCourses(Long teacherId) {

        List<CourseTeacher> assignments =
                courseTeacherRepository.findByTeacherId(teacherId);

        return assignments.stream()
                .map(assignment -> {
                    Course course = assignment.getCourse();

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

    public List<CourseResponse> getCoursesForLoggedInTeacher(String email) {

        Teacher teacher = teacherRepository.findByUser_Email(email)
                .orElseThrow(() ->
                        new RuntimeException("Teacher profile not found"));

        return getTeacherCourses(teacher.getId());
    }

}