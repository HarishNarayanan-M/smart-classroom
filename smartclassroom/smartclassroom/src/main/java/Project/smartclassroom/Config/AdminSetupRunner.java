
package Project.smartclassroom.Config;

import Project.smartclassroom.Entity.User;
import Project.smartclassroom.Repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminSetupRunner {

    @Bean
    CommandLineRunner createAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {
            String email = "admin-new@smartclassroom.local";

            if (userRepository.findByEmail(email).isPresent()) {
                System.out.println("Admin account already exists: " + email);
                return;
            }

            // Replace this placeholder with your own strong password.
            String password = "ScAdmin@7vN4!qR9#xL2";

            if (password.equals("REPLACE_WITH_YOUR_OWN_STRONG_PASSWORD")
                    || password.length() < 12) {
                System.out.println(
                        "Admin setup stopped. Set a strong password in AdminSetupRunner.java."
                );
                return;
            }

            User admin = new User();
            admin.setName("New Admin");
            admin.setEmail(email);
            admin.setPassword(passwordEncoder.encode(password));
            admin.setRole("ADMIN");
            admin.setStatus("ACTIVE");

            userRepository.save(admin);

            System.out.println("Admin account created: " + email);
        };
    }
}
