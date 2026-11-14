package Project.smartclassroom.Repository;

import Project.smartclassroom.Entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceRepository
        extends JpaRepository<Attendance, Long> {

    List<Attendance> findByCourseIdAndDate(
            Long courseId,
            LocalDate date
    );

    List<Attendance> findByStudentId(Long studentId);

    boolean existsByStudentIdAndCourseIdAndDate(
            Long studentId,
            Long courseId,
            LocalDate date
    );

    long countByStudentIdAndCourseIdAndStatus(
            Long studentId,
            Long courseId,
            String status
    );
    void deleteByStudent_Id(Long studentId);
}
