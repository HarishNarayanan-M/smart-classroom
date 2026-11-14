package Project.smartclassroom.Repository;

import Project.smartclassroom.Entity.AssignmentSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssignmentSubmissionRepository
        extends JpaRepository<AssignmentSubmission, Long> {

    boolean existsByAssignmentIdAndStudentId(
            Long assignmentId,
            Long studentId
    );

    List<AssignmentSubmission> findByAssignmentId(Long assignmentId);

    Optional<AssignmentSubmission> findByAssignmentIdAndStudentId(
            Long assignmentId,
            Long studentId
    );
    void deleteByStudent_Id(Long studentId);
}
