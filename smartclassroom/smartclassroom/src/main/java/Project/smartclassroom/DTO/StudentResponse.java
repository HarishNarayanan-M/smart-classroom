
package Project.smartclassroom.DTO;

public class StudentResponse {

    private Long id;
    private String name;
    private String email;
    private String registerNumber;
    private Long departmentId;
    private String departmentName;
    private Integer year;
    private String section;
    private String status;

    public StudentResponse(
            Long id,
            String name,
            String email,
            String registerNumber,
            Long departmentId,
            String departmentName,
            Integer year,
            String section,
            String status) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.registerNumber = registerNumber;
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.year = year;
        this.section = section;
        this.status = status;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getRegisterNumber() { return registerNumber; }
    public Long getDepartmentId() { return departmentId; }
    public String getDepartmentName() { return departmentName; }
    public Integer getYear() { return year; }
    public String getSection() { return section; }
    public String getStatus() { return status; }
}
