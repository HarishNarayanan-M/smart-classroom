package Project.smartclassroom.Controller;

import Project.smartclassroom.DTO.AssignmentGradeRequest;
import Project.smartclassroom.DTO.AssignmentSubmissionResponse;
import Project.smartclassroom.Service.AssignmentSubmissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
public class AssignmentSubmissionController {

    private final AssignmentSubmissionService submissionService;

    public AssignmentSubmissionController(
            AssignmentSubmissionService submissionService) {

        this.submissionService = submissionService;
    }

    @PostMapping("/api/assignments/{assignmentId}/submit-file")
    public void submitAssignmentFile(
            @PathVariable Long assignmentId,
            @RequestParam Long studentId,
            @RequestParam MultipartFile file) {

        submissionService.submitAssignmentFile(
                assignmentId,
                studentId,
                file
        );
    }

    @GetMapping("/api/assignments/{assignmentId}/submissions")
    public List<AssignmentSubmissionResponse> getSubmissions(
            @PathVariable Long assignmentId) {

        return submissionService.getSubmissionsByAssignment(assignmentId);
    }

    @PutMapping("/api/assignments/submissions/{submissionId}/grade")
    public void gradeSubmission(
            @PathVariable Long submissionId,
            @RequestBody AssignmentGradeRequest request) {

        submissionService.gradeSubmission(
                submissionId,
                request
        );
    }


    @GetMapping("/api/assignments/{assignmentId}/student-submission")
    public ResponseEntity<AssignmentSubmissionResponse> getStudentSubmission(
            @PathVariable Long assignmentId,
            @RequestParam Long studentId) {
        System.out.println(">>> STUDENT SUBMISSION ENDPOINT REACHED");
        AssignmentSubmissionResponse response =
                submissionService.getStudentSubmission(
                        assignmentId, studentId);

        if (response == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(response);
    }
    @DeleteMapping("/api/assignments/{assignmentId}/unsubmit")
    public ResponseEntity<String> unsubmitAssignment(
            @PathVariable Long assignmentId,
            @RequestParam Long studentId) {

        submissionService.unsubmitAssignment(assignmentId, studentId);

        return ResponseEntity.ok("Assignment unsubmitted successfully.");
    }
}