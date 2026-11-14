package Project.smartclassroom.Service;

import Project.smartclassroom.DTO.CourseResponse;
import Project.smartclassroom.DTO.DepartmentResponse;
import Project.smartclassroom.DTO.StudentResponse;
import Project.smartclassroom.DTO.TeacherResponse;
import Project.smartclassroom.Entity.CourseTeacher;
import Project.smartclassroom.Entity.Teacher;
import Project.smartclassroom.Entity.User;
import Project.smartclassroom.Repository.*;
import org.springframework.stereotype.Service;
import Project.smartclassroom.Entity.Student;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final DepartmentRepository departmentRepository;
    private final CourseTeacherRepository courseTeacherRepository;
    private final AttendanceRepository attendanceRepository;
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final EnrollmentRepository enrollmentRepository;

    public AdminService(
            TeacherRepository teacherRepository,
            UserRepository userRepository,
            StudentRepository studentRepository,
            CourseRepository courseRepository,
            DepartmentRepository departmentRepository,
            CourseTeacherRepository courseTeacherRepository,
            AttendanceRepository attendanceRepository,
            AssignmentSubmissionRepository assignmentSubmissionRepository,
            QuizAttemptRepository quizAttemptRepository,
            EnrollmentRepository enrollmentRepository) {

        this.teacherRepository = teacherRepository;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
        this.departmentRepository = departmentRepository;
        this.courseTeacherRepository = courseTeacherRepository;
        this.attendanceRepository = attendanceRepository;
        this.assignmentSubmissionRepository = assignmentSubmissionRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.enrollmentRepository = enrollmentRepository;
    }


    public void approveTeacher(Long teacherId) {
        Teacher teacher = teacherRepository
                .findById(teacherId)
                .orElseThrow(() ->
                        new RuntimeException("Teacher not found"));

        User user = teacher.getUser();
        user.setStatus("ACTIVE");

        userRepository.save(user);
    }

    public void rejectTeacher(Long teacherId) {
        Teacher teacher = teacherRepository
                .findById(teacherId)
                .orElseThrow(() ->
                        new RuntimeException("Teacher not found"));

        User user = teacher.getUser();
        user.setStatus("REJECTED");

        userRepository.save(user);
    }

    public List<TeacherResponse> getAllTeachers() {
        return teacherRepository.findAll()
                .stream()
                .map(teacher -> {
                    User user = teacher.getUser();

                    return new TeacherResponse(
                            teacher.getId(),
                            user.getName(),
                            user.getEmail(),
                            teacher.getEmployeeId(),
                            user.getStatus(),
                            teacher.getDepartment().getId(),
                            teacher.getDepartment().getName()
                    );
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void removeStudent(Long studentId) {

        // Find the student
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() ->
                        new RuntimeException("Student not found"));

        // Get the associated user account
        User user = student.getUser();

        // Delete records associated with the student first
        attendanceRepository.deleteByStudent_Id(studentId);

        assignmentSubmissionRepository.deleteByStudent_Id(studentId);

        quizAttemptRepository.deleteByStudent_Id(studentId);

        enrollmentRepository.deleteByStudent_Id(studentId);

        // Delete the student profile
        studentRepository.delete(student);

        // Delete the associated user account
        userRepository.delete(user);
    }

    public List<StudentResponse> getAllStudents() {
        return studentRepository.findAll()
                .stream()
                .map(student -> {
                    User user = student.getUser();

                    return new StudentResponse(
                            student.getId(),
                            user.getName(),
                            user.getEmail(),
                            student.getRegisterNumber(),
                            student.getDepartment().getId(),
                            student.getDepartment().getName(),
                            student.getYear(),
                            student.getSection(),
                            user.getStatus()
                    );
                })
                .collect(Collectors.toList());
    }


    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll()
                .stream()
                .map(course -> {
                    CourseResponse response = new CourseResponse();

                    response.setId(course.getId());
                    response.setName(course.getName());
                    response.setCode(course.getCode());
                    response.setDepartmentId(
                            course.getDepartment().getId()
                    );
                    response.setDepartmentName(
                            course.getDepartment().getName()
                    );

// Get teachers assigned to this course
                    List<CourseTeacher> assignments =
                            courseTeacherRepository.findByCourseId(course.getId());

                    if (!assignments.isEmpty()) {
                        Teacher teacher = assignments.get(0).getTeacher();

                        response.setTeacherId(teacher.getId());
                        response.setTeacherName(teacher.getUser().getName());
                    }

                    return response;
                })
                .collect(Collectors.toList());
    }

    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll()
                .stream()
                .map(department -> new DepartmentResponse(
                        department.getId(),
                        department.getName(),
                        department.getCode()
                ))
                .collect(Collectors.toList());
    }
}
