package Project.smartclassroom.Controller;

import Project.smartclassroom.DTO.QuizRequest;
import Project.smartclassroom.DTO.QuizResponse;
import Project.smartclassroom.Service.QuizService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @PostMapping("/{courseId}/quizzes")
    public QuizResponse createQuiz(
            @PathVariable Long courseId,
            @RequestBody QuizRequest request) {

        return quizService.createQuiz(courseId, request);
    }

    @GetMapping("/{courseId}/quizzes")
    public List<QuizResponse> getQuizzes(
            @PathVariable Long courseId) {

        return quizService.getQuizzesByCourse(courseId);
    }

    @DeleteMapping("/{courseId}/quizzes/{quizId}")
    public void deleteQuiz(
            @PathVariable Long courseId,
            @PathVariable Long quizId) {

        quizService.deleteQuiz(courseId, quizId);
    }
}
