
package Project.smartclassroom.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        // Serve uploaded lecture videos
        String lectureUploadPath = Paths.get("uploads", "lectures")
                .toAbsolutePath()
                .normalize()
                .toUri()
                .toString();

        registry.addResourceHandler("/uploads/lectures/**")
                .addResourceLocations(lectureUploadPath);

        // Serve uploaded study materials
        String materialUploadPath = Paths.get("uploads", "materials")
                .toAbsolutePath()
                .normalize()
                .toUri()
                .toString();

        registry.addResourceHandler("/uploads/materials/**")
                .addResourceLocations(materialUploadPath);
    }
}
