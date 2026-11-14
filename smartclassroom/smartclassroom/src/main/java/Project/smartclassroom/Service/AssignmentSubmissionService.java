package Project.smartclassroom.Service;

import Project.smartclassroom.DTO.AssignmentGradeRequest;
import Project.smartclassroom.DTO.AssignmentSubmissionResponse;
import Project.smartclassroom.Entity.Assignment;
import Project.smartclassroom.Entity.AssignmentSubmission;
import Project.smartclassroom.Entity.Student;
import Project.smartclassroom.Repository.AssignmentRepository;
import Project.smartclassroom.Repository.AssignmentSubmissionRepository;
import Project.smartclassroom.Repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AssignmentSubmissionService {

    private final AssignmentSubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final StudentRepository studentRepository;

    public AssignmentSubmissionService(
            AssignmentSubmissionRepository submissionRepository,
            AssignmentRepository assignmentRepository,
            StudentRepository studentRepository) {

        this.submissionRepository = submissionRepository;
        this.assignmentRepository = assignmentRepository;
        this.studentRepository = studentRepository;
    }

    public void submitAssignment(
            Long assignmentId,
            Long studentId,
            String submissionUrl) {
        Assignment assignment = assignmentRepository
                .findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        Student student = studentRepository
                .findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        if (assignment.getDueDate() != null
                && LocalDateTime.now().isAfter(assignment.getDueDate())) {
            throw new RuntimeException(
                    "The assignment deadline has passed. Submissions are closed."
            );
        }
        if (submissionRepository.existsByAssignmentIdAndStudentId(
                assignmentId, studentId)) {

            throw new RuntimeException("Assignment already submitted");
        }

        AssignmentSubmission submission = new AssignmentSubmission();

        submission.setAssignment(assignment);
        submission.setStudent(student);
        submission.setSubmissionUrl(submissionUrl);
        submission.setSubmittedAt(LocalDateTime.now());

        submissionRepository.save(submission);
    }
    public void submitAssignmentFile(
            Long assignmentId,
            Long studentId,
            MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }
        Assignment assignment = assignmentRepository
                .findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        if (assignment.getDueDate() != null
                && LocalDateTime.now().isAfter(assignment.getDueDate())) {

            throw new RuntimeException(
                    "The assignment deadline has passed. Submissions are closed."
            );
        }
        Student student = studentRepository
                .findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        if (submissionRepository.existsByAssignmentIdAndStudentId(
                assignmentId, studentId)) {

            throw new RuntimeException("Assignment already submitted");
        }
        try {
            java.nio.file.Path uploadPath =
                    java.nio.file.Paths.get("uploads/submissions");

            java.nio.file.Files.createDirectories(uploadPath);

            String fileName = java.util.UUID.randomUUID() + "_" +
                    file.getOriginalFilename();

            java.nio.file.Path filePath =
                    uploadPath.resolve(fileName);

            file.transferTo(filePath);
            AssignmentSubmission submission = new AssignmentSubmission();

            submission.setAssignment(assignment);
            submission.setStudent(student);
            submission.setSubmissionUrl("/uploads/submissions/" + fileName);
            submission.setSubmittedAt(LocalDateTime.now());
            submissionRepository.save(submission);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save submission file", e);
        }
    }

    public List<AssignmentSubmissionResponse> getSubmissionsByAssignment(
            Long assignmentId) {

        Assignment assignment = assignmentRepository
                .findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));


        List<AssignmentSubmission> submissions =
                submissionRepository.findByAssignmentId(assignmentId);

        List<AssignmentSubmissionResponse> responses =
                submissions.stream()
                        .map(submission -> {
                            AssignmentSubmissionResponse response =
                                    new AssignmentSubmissionResponse();

                            response.setId(submission.getId());
                            response.setAssignmentId(
                                    submission.getAssignment().getId()
                            );
                            response.setStudentId(
                                    submission.getStudent().getId()
                            );
                            response.setStudentName(
                                    submission.getStudent().getUser().getName()
                            );
                            response.setSubmissionUrl(
                                    submission.getSubmissionUrl()
                            );
                            response.setSubmittedAt(
                                    submission.getSubmittedAt()
                            );
                            response.setGrade(
                                    submission.getGrade()
                            );
                            response.setFeedback(
                                    submission.getFeedback()
                            );

                            return response;
                        })
                        .toList();

        return responses;
    }

    public void gradeSubmission(
            Long submissionId,
            AssignmentGradeRequest request) {
        AssignmentSubmission submission = submissionRepository
                .findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
        submission.setGrade(request.getGrade());
        submission.setFeedback(request.getFeedback());

        submissionRepository.save(submission);
    }


    public AssignmentSubmissionResponse getStudentSubmission(
            Long assignmentId,
            Long studentId) {

        return submissionRepository
                .findByAssignmentIdAndStudentId(assignmentId, studentId)
                .map(submission -> {
                    AssignmentSubmissionResponse response =
                            new AssignmentSubmissionResponse();

                    response.setId(submission.getId());
                    response.setAssignmentId(
                            submission.getAssignment().getId());
                    response.setStudentId(
                            submission.getStudent().getId());
                    response.setStudentName(
                            submission.getStudent().getUser().getName());
                    response.setSubmissionUrl(
                            submission.getSubmissionUrl());
                    response.setSubmittedAt(
                            submission.getSubmittedAt());
                    response.setGrade(submission.getGrade());
                    response.setFeedback(submission.getFeedback());

                    return response;
                })
                .orElse(null);
    }
    public void unsubmitAssignment(Long assignmentId, Long studentId) {

        AssignmentSubmission submission = submissionRepository
                .findByAssignmentIdAndStudentId(assignmentId, studentId)
                .orElseThrow(() ->
                        new RuntimeException("No submission found for this assignment.")
                );

        if (submission.getGrade() != null) {
            throw new RuntimeException(
                    "You cannot unsubmit an assignment that has already been graded."
            );
        }

        submissionRepository.delete(submission);
    }
}