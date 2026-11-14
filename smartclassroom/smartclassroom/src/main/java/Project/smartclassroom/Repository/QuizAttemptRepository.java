package Project.smartclassroom.Repository;

import Project.smartclassroom.Entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    List<QuizAttempt> findByStudentId(Long studentId);
    void deleteByStudent_Id(Long studentId);
    boolean existsByQuizId(Long quizId);
    List<QuizAttempt> findByQuizId(Long quizId);
}