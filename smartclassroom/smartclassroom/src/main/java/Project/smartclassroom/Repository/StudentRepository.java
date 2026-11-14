package Project.smartclassroom.Repository;

import Project.smartclassroom.Entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student,Long> {
    boolean existsByRegisterNumber(String registerNumber);
    Optional<Student> findByUser_Email(String email);
    boolean existsByDepartmentId(Long departmentId);
}
