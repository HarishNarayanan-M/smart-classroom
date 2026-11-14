package Project.smartclassroom.Service;

import Project.smartclassroom.DTO.QuizRequest;
import Project.smartclassroom.DTO.QuizResponse;
import Project.smartclassroom.Entity.Course;
import Project.smartclassroom.Entity.Quiz;
import Project.smartclassroom.Repository.CourseRepository;
import Project.smartclassroom.Repository.QuizAttemptRepository;
import Project.smartclassroom.Repository.QuizRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final CourseRepository courseRepository;
    private final QuizAttemptRepository quizAttemptRepository;

    public QuizService(
            QuizRepository quizRepository,
            CourseRepository courseRepository,
            QuizAttemptRepository quizAttemptRepository) {

        this.quizRepository = quizRepository;
        this.courseRepository = courseRepository;
        this.quizAttemptRepository = quizAttemptRepository;
    }

    public QuizResponse createQuiz(Long courseId, QuizRequest request) {

        Course course = courseRepository
                .findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Quiz quiz = new Quiz();

        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quiz.setDurationMinutes(request.getDurationMinutes());
        quiz.setCourse(course);

        Quiz savedQuiz = quizRepository.save(quiz);

        QuizResponse response = new QuizResponse();

        response.setId(savedQuiz.getId());
        response.setTitle(savedQuiz.getTitle());
        response.setDescription(savedQuiz.getDescription());
        response.setDurationMinutes(savedQuiz.getDurationMinutes());
        response.setCourseId(savedQuiz.getCourse().getId());
        response.setCourseName(savedQuiz.getCourse().getName());

        return response;
    }

    public List<QuizResponse> getQuizzesByCourse(Long courseId) {

        Course course = courseRepository
                .findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        return quizRepository.findByCourseId(courseId)
                .stream()
                .map(quiz -> {

                    QuizResponse response = new QuizResponse();

                    response.setId(quiz.getId());
                    response.setTitle(quiz.getTitle());
                    response.setDescription(quiz.getDescription());
                    response.setDurationMinutes(quiz.getDurationMinutes());
                    response.setCourseId(quiz.getCourse().getId());
                    response.setCourseName(quiz.getCourse().getName());

                    return response;
                })
                .toList();
    }

    public void deleteQuiz(Long courseId, Long quizId) {

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() ->
                        new RuntimeException("Quiz not found"));

        if (!quiz.getCourse().getId().equals(courseId)) {
            throw new RuntimeException(
                    "Quiz does not belong to this course");
        }

        if (quizAttemptRepository.existsByQuizId(quizId)) {
            throw new RuntimeException(
                    "Cannot delete this quiz because students have attempted it");
        }

        quizRepository.delete(quiz);
    }
}