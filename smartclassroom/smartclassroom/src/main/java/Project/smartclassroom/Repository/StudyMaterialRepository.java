package Project.smartclassroom.Repository;

import Project.smartclassroom.Entity.StudyMaterial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudyMaterialRepository extends JpaRepository<StudyMaterial, Long> {

    List<StudyMaterial> findByCourseId(Long courseId);
}