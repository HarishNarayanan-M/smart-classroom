package Project.smartclassroom.Controller;

import Project.smartclassroom.DTO.LoginRequest;
import Project.smartclassroom.DTO.LoginResponse;
import Project.smartclassroom.DTO.StudentRegistrationRequest;
import Project.smartclassroom.DTO.TeacherRegistrationRequest;
import Project.smartclassroom.Service.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    @PostMapping("/register")
    public String register(@RequestBody StudentRegistrationRequest request) {
        authService.registerStudent(request);
        return "Student registered successfully";
    }
    @PostMapping("/register/teacher")
    public String registerTeacher(@RequestBody TeacherRegistrationRequest request) {
        authService.registerTeacher(request);
        return "Teacher registration successful. Waiting for admin approval.";
    }
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
}