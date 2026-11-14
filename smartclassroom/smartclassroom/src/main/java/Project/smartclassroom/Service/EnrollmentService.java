package Project.smartclassroom.Service;

import Project.smartclassroom.DTO.CourseResponse;
import Project.smartclassroom.DTO.EnrolledStudentResponse;
import Project.smartclassroom.Entity.Course;
import Project.smartclassroom.Entity.Enrollment;
import Project.smartclassroom.Entity.Student;
import Project.smartclassroom.Repository.CourseRepository;
import Project.smartclassroom.Repository.EnrollmentRepository;
import Project.smartclassroom.Repository.StudentRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;

    public EnrollmentService(
            EnrollmentRepository enrollmentRepository,
            StudentRepository studentRepository,
            CourseRepository courseRepository) {

        this.enrollmentRepository = enrollmentRepository;
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
    }

    public void enrollStudent(Long studentId, Long courseId) {

        Student student = studentRepository
                .findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Course course = courseRepository
                .findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw new RuntimeException("Student is already enrolled in this course");
        }

        Enrollment enrollment = new Enrollment();

        enrollment.setStudent(student);
        enrollment.setCourse(course);

        enrollmentRepository.save(enrollment);
    }

    public List<CourseResponse> getStudentCourses(Long studentId) {

        List<Enrollment> enrollments =
                enrollmentRepository.findByStudentId(studentId);

        return enrollments.stream()
                .map(enrollment -> {
                    Course course = enrollment.getCourse();

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

    public List<EnrolledStudentResponse> getStudentsByCourse(Long courseId) {

        courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        return enrollmentRepository.findByCourseId(courseId)
                .stream()
                .map(enrollment -> {
                    Student student = enrollment.getStudent();

                    return new EnrolledStudentResponse(
                            student.getId(),
                            student.getUser().getName(),
                            student.getRegisterNumber()
                    );
                })
                .toList();
    }

    @Transactional
    public void unenrollStudent(Long studentId, Long courseId) {
        Enrollment enrollment = enrollmentRepository
                .findByStudentIdAndCourseId(studentId, courseId)
                .orElseThrow(() ->
                        new RuntimeException("Enrollment not found"));

        enrollmentRepository.delete(enrollment);
    }
}