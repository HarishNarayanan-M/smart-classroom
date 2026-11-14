package Project.smartclassroom.DTO;

public class AssignmentSubmissionRequest {

    private Long studentId;
    private String submissionUrl;

    public AssignmentSubmissionRequest() {
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getSubmissionUrl() {
        return submissionUrl;
    }

    public void setSubmissionUrl(String submissionUrl) {
        this.submissionUrl = submissionUrl;
    }
}