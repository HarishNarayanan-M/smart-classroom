package Project.smartclassroom.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/api/test/protected")
    public String protectedEndpoint() {
        return "JWT authentication is working";
    }
    @GetMapping("/api/test/teacher")
    public String teacherEndpoint() {
        return "Teacher access granted";
    }
}