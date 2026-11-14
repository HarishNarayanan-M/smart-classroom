package Project.smartclassroom.Repository;

import Project.smartclassroom.Entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course ,Long> {
    boolean existsByCodeIgnoreCase(String code);
    boolean existsByDepartmentId(Long departmentId);
}
