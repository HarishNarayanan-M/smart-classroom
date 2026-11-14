package Project.smartclassroom.Repository;

import Project.smartclassroom.Entity.LiveClass;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LiveClassRepository
        extends JpaRepository<LiveClass, Long> {

    List<LiveClass> findByCourseId(Long courseId);

    List<LiveClass> findByTeacherId(Long teacherId);

    List<LiveClass> findByCourseIdAndStatus(
            Long courseId, String status);

    List<LiveClass> findByTeacherIdAndStatus(
            Long teacherId, String status);
}
