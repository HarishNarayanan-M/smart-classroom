package Project.smartclassroom.Repository;

import Project.smartclassroom.Entity.CourseTeacher;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseTeacherRepository extends JpaRepository<CourseTeacher, Long> {
    boolean existsByCourseIdAndTeacherId(Long courseId, Long teacherId);
    List<CourseTeacher> findByTeacherId(Long teacherId);
    List<CourseTeacher> findByCourseId(Long courseId);
    Optional<CourseTeacher> findByCourseIdAndTeacherId(
            Long courseId,
            Long teacherId
    );
}