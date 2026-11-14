
package Project.smartclassroom.Config;

import Project.smartclassroom.Entity.User;
import Project.smartclassroom.Repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrap implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminBootstrap(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String email = "admin@smartclassroom.local";

        if (userRepository.findByEmail(email).isEmpty()) {
            User admin = new User();
            admin.setName("Admin");
            admin.setEmail(email);
            admin.setPassword(
                    passwordEncoder.encode("Admin@12345")
            );
            admin.setRole("ADMIN");
            admin.setStatus("ACTIVE");

            userRepository.save(admin);

            System.out.println("Temporary admin account created.");
        }
    }
}
