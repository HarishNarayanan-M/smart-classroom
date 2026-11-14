package Project.smartclassroom.DTO;

public class AssignmentGradeRequest {

    private Double grade;
    private String feedback;

    public AssignmentGradeRequest() {
    }

    public Double getGrade() {
        return grade;
    }

    public void setGrade(Double grade) {
        this.grade = grade;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
}