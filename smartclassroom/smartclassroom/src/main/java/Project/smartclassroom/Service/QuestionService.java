package Project.smartclassroom.Service;

import Project.smartclassroom.DTO.QuestionRequest;
import Project.smartclassroom.DTO.QuestionResponse;
import Project.smartclassroom.Entity.Question;
import Project.smartclassroom.Entity.Quiz;
import Project.smartclassroom.Repository.QuestionRepository;
import Project.smartclassroom.Repository.QuizRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final QuizRepository quizRepository;

    public QuestionService(
            QuestionRepository questionRepository,
            QuizRepository quizRepository) {

        this.questionRepository = questionRepository;
        this.quizRepository = quizRepository;
    }

    public QuestionResponse createQuestion(
            Long quizId,
            QuestionRequest request) {

        Quiz quiz = quizRepository
                .findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        Question question = new Question();

        question.setQuestionText(request.getQuestionText());
        question.setOptionA(request.getOptionA());
        question.setOptionB(request.getOptionB());
        question.setOptionC(request.getOptionC());
        question.setOptionD(request.getOptionD());
        question.setCorrectAnswer(request.getCorrectAnswer());
        question.setQuiz(quiz);

        Question savedQuestion = questionRepository.save(question);

        QuestionResponse response = new QuestionResponse();

        response.setId(savedQuestion.getId());
        response.setQuestionText(savedQuestion.getQuestionText());
        response.setOptionA(savedQuestion.getOptionA());
        response.setOptionB(savedQuestion.getOptionB());
        response.setOptionC(savedQuestion.getOptionC());
        response.setOptionD(savedQuestion.getOptionD());
        response.setQuizId(savedQuestion.getQuiz().getId());

        return response;
    }

    public List<QuestionResponse> getQuestionsByQuiz(Long quizId) {

        Quiz quiz = quizRepository
                .findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        return questionRepository.findByQuizId(quizId)
                .stream()
                .map(question -> {

                    QuestionResponse response = new QuestionResponse();

                    response.setId(question.getId());
                    response.setQuestionText(question.getQuestionText());
                    response.setOptionA(question.getOptionA());
                    response.setOptionB(question.getOptionB());
                    response.setOptionC(question.getOptionC());
                    response.setOptionD(question.getOptionD());
                    response.setQuizId(question.getQuiz().getId());

                    return response;
                })
                .toList();
    }
}