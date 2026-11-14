package Project.smartclassroom.DTO;

public class EnrolledStudentResponse {

    private Long id;
    private String name;
    private String registerNumber;

    public EnrolledStudentResponse() {
    }

    public EnrolledStudentResponse(
            Long id,
            String name,
            String registerNumber) {
        this.id = id;
        this.name = name;
        this.registerNumber = registerNumber;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRegisterNumber() {
        return registerNumber;
    }

    public void setRegisterNumber(String registerNumber) {
        this.registerNumber = registerNumber;
    }
}