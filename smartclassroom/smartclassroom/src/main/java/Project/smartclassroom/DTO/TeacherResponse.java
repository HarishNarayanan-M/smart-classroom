package Project.smartclassroom.DTO;

public class TeacherResponse {

    private Long id;
    private String name;
    private String email;
    private String employeeId;
    private String status;
    private Long departmentId;
    private String departmentName;

    public TeacherResponse(
            Long id,
            String name,
            String email,
            String employeeId,
            String status,
            Long departmentId,
            String departmentName) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.employeeId = employeeId;
        this.status = status;
        this.departmentId = departmentId;
        this.departmentName = departmentName;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getEmployeeId() { return employeeId; }
    public String getStatus() { return status; }
    public Long getDepartmentId() { return departmentId; }
    public String getDepartmentName() { return departmentName; }
}