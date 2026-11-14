package Project.smartclassroom.Service;

import Project.smartclassroom.DTO.LoginRequest;
import Project.smartclassroom.DTO.LoginResponse;
import Project.smartclassroom.Entity.Teacher;
import Project.smartclassroom.Repository.DepartmentRepository;
import Project.smartclassroom.Repository.StudentRepository;
import Project.smartclassroom.Repository.TeacherRepository;
import Project.smartclassroom.Repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import Project.smartclassroom.DTO.StudentRegistrationRequest;
import Project.smartclassroom.Entity.Department;
import Project.smartclassroom.Entity.Student;
import Project.smartclassroom.Entity.User;
import org.springframework.transaction.annotation.Transactional;
import Project.smartclassroom.DTO.TeacherRegistrationRequest;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       StudentRepository studentRepository,
                       TeacherRepository teacherRepository,
                       DepartmentRepository departmentRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {

        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }
    @Transactional
    public void registerStudent(StudentRegistrationRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        if (studentRepository.existsByRegisterNumber(request.getRegisterNumber())) {
            throw new RuntimeException("Register number already registered");
        }
        Department department = departmentRepository
                .findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("STUDENT");
        user.setStatus("ACTIVE");

        userRepository.save(user);

        Student student = new Student();

        student.setUser(user);
        student.setRegisterNumber(request.getRegisterNumber());
        student.setDepartment(department);
        student.setYear(request.getYear());
        student.setSection(request.getSection());

        studentRepository.save(student);
    }

    @Transactional
    public void registerTeacher(TeacherRegistrationRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        if (teacherRepository.existsByEmployeeId(request.getEmployeeId())) {
            throw new RuntimeException("Employee ID already registered");
        }
        Department department = departmentRepository
                .findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("TEACHER");
        user.setStatus("PENDING");

        userRepository.save(user);

        Teacher teacher = new Teacher();

        teacher.setUser(user);
        teacher.setEmployeeId(request.getEmployeeId());
        teacher.setDepartment(department);

        teacherRepository.save(teacher);
    }

    public LoginResponse login(LoginRequest request) {

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (!"ACTIVE".equals(user.getStatus())) {
            throw new RuntimeException("Account is not active");
        }

        String token = jwtService.generateToken(user);

        LoginResponse response = new LoginResponse();

        response.setUserId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setToken(token);

        if ("STUDENT".equals(user.getRole())
                && user.getStudent() != null) {
            response.setStudentId(user.getStudent().getId());
        }

        return response;
    }
}
