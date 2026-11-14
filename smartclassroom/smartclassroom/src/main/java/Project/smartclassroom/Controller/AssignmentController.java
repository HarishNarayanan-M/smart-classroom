package Project.smartclassroom.Controller;

import Project.smartclassroom.DTO.AssignmentRequest;
import Project.smartclassroom.DTO.AssignmentResponse;
import Project.smartclassroom.Service.AssignmentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @PostMapping("/{courseId}/assignments")
    public AssignmentResponse createAssignment(
            @PathVariable Long courseId,
            @RequestBody AssignmentRequest request) {

        return assignmentService.createAssignment(courseId, request);
    }

    @GetMapping("/{courseId}/assignments")
    public List<AssignmentResponse> getAssignments(
            @PathVariable Long courseId) {

        return assignmentService.getAssignmentsByCourse(courseId);
    }


    @DeleteMapping("/{courseId}/assignments/{assignmentId}")
    public void deleteAssignment(
            @PathVariable Long courseId,
            @PathVariable Long assignmentId) {

        assignmentService.deleteAssignment(courseId, assignmentId);
    }

}