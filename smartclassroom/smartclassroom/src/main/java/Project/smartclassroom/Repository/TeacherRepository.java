package Project.smartclassroom.Repository;

import Project.smartclassroom.Entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {

    boolean existsByEmployeeId(String employeeId);
    boolean existsByDepartmentId(Long departmentId);
    Optional<Teacher> findByUser_Email(String email);
}