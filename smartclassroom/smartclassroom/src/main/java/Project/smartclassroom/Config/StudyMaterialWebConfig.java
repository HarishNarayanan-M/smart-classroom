
package Project.smartclassroom.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class StudyMaterialWebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        // Serve study material files
        Path materialsPath = Paths.get("uploads/materials")
                .toAbsolutePath()
                .normalize();

        String materialsLocation = materialsPath.toUri().toString();

        if (!materialsLocation.endsWith("/")) {
            materialsLocation += "/";
        }

        registry.addResourceHandler("/uploads/materials/**")
                .addResourceLocations(materialsLocation);

        // Serve assignment submission files
        Path submissionsPath = Paths.get("uploads/submissions")
                .toAbsolutePath()
                .normalize();

        String submissionsLocation = submissionsPath.toUri().toString();

        if (!submissionsLocation.endsWith("/")) {
            submissionsLocation += "/";
        }

        registry.addResourceHandler("/uploads/submissions/**")
                .addResourceLocations(submissionsLocation);
    }
}
