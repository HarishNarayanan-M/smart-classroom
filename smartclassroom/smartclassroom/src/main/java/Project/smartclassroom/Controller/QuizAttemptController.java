package Project.smartclassroom.Controller;

import Project.smartclassroom.DTO.QuizAnswerRequest;
import Project.smartclassroom.DTO.QuizAttemptRequest;
import Project.smartclassroom.DTO.QuizAttemptResponse;
import Project.smartclassroom.Service.QuizAttemptService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quizzes")
public class QuizAttemptController {

    private final QuizAttemptService quizAttemptService;

    public QuizAttemptController(QuizAttemptService quizAttemptService) {
        this.quizAttemptService = quizAttemptService;
    }

    @PostMapping("/{quizId}/attempts")
    public QuizAttemptResponse startAttempt(
            @PathVariable Long quizId,
            @RequestBody QuizAttemptRequest request) {

        return quizAttemptService.startAttempt(quizId, request);
    }

    @PostMapping("/attempts/{attemptId}/answers")
    public void submitAnswer(
            @PathVariable Long attemptId,
            @RequestBody QuizAnswerRequest request) {

        quizAttemptService.submitAnswer(
                attemptId,
                request
        );
    }

    @PostMapping("/attempts/{attemptId}/submit")
    public QuizAttemptResponse submitQuiz(
            @PathVariable Long attemptId) {

        return quizAttemptService.submitQuiz(attemptId);
    }

    @GetMapping("/attempts/{attemptId}")
    public QuizAttemptResponse getAttempt(
            @PathVariable Long attemptId) {

        return quizAttemptService.getAttempt(attemptId);
    }
}