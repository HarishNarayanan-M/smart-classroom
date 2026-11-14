package Project.smartclassroom.Controller;

import Project.smartclassroom.DTO.QuestionRequest;
import Project.smartclassroom.DTO.QuestionResponse;
import Project.smartclassroom.Service.QuestionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @PostMapping("/{quizId}/questions")
    public QuestionResponse createQuestion(
            @PathVariable Long quizId,
            @RequestBody QuestionRequest request) {

        return questionService.createQuestion(quizId, request);
    }

    @GetMapping("/{quizId}/questions")
    public List<QuestionResponse> getQuestions(
            @PathVariable Long quizId) {

        return questionService.getQuestionsByQuiz(quizId);
    }
}