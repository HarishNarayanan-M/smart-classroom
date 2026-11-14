
package Project.smartclassroom.Controller;

import Project.smartclassroom.DTO.LiveClassRequest;
import Project.smartclassroom.DTO.LiveClassResponse;
import Project.smartclassroom.Service.LiveClassService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/live-classes")
public class LiveClassController {

    private final LiveClassService liveClassService;

    public LiveClassController(LiveClassService liveClassService) {
        this.liveClassService = liveClassService;
    }

    @PostMapping
    public LiveClassResponse scheduleClass(
            @RequestBody LiveClassRequest request) {
        return liveClassService.scheduleClass(request);
    }

    @GetMapping("/course/{courseId}")
    public List<LiveClassResponse> getClassesByCourse(
            @PathVariable Long courseId) {
        return liveClassService.getClassesByCourse(courseId);
    }
}
