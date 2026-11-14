package Project.smartclassroom.Service;

import Project.smartclassroom.DTO.QuizAnswerRequest;
import Project.smartclassroom.DTO.QuizAttemptRequest;
import Project.smartclassroom.DTO.QuizAttemptResponse;
import Project.smartclassroom.Entity.*;
import Project.smartclassroom.Repository.QuestionRepository;
import Project.smartclassroom.Repository.QuizAnswerRepository;
import Project.smartclassroom.Repository.QuizAttemptRepository;
import Project.smartclassroom.Repository.QuizRepository;
import Project.smartclassroom.Repository.StudentRepository;
import org.springframework.stereotype.Service;
import Project.smartclassroom.Repository.EnrollmentRepository;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class QuizAttemptService {

    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizRepository quizRepository;
    private final StudentRepository studentRepository;
    private final QuizAnswerRepository quizAnswerRepository;
    private final QuestionRepository questionRepository;
    private final EnrollmentRepository enrollmentRepository;

    public QuizAttemptService(
            QuizAttemptRepository quizAttemptRepository,
            QuizRepository quizRepository,
            StudentRepository studentRepository,
            QuizAnswerRepository quizAnswerRepository,
            QuestionRepository questionRepository,
            EnrollmentRepository enrollmentRepository) {

        this.quizAttemptRepository = quizAttemptRepository;
        this.quizRepository = quizRepository;
        this.studentRepository = studentRepository;
        this.quizAnswerRepository = quizAnswerRepository;
        this.questionRepository = questionRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    public QuizAttemptResponse startAttempt(
            Long quizId,
            QuizAttemptRequest request) {

        Quiz quiz = quizRepository
                .findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        Student student = studentRepository
                .findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (!enrollmentRepository.existsByStudentIdAndCourseId(
                student.getId(),
                quiz.getCourse().getId())) {

            throw new RuntimeException(
                    "Student is not enrolled in this course"
            );
        }

        QuizAttempt attempt = new QuizAttempt();

        attempt.setQuiz(quiz);
        attempt.setStudent(student);
        attempt.setScore(0);
        attempt.setStartedAt(LocalDateTime.now());

        QuizAttempt savedAttempt =
                quizAttemptRepository.save(attempt);

        QuizAttemptResponse response = new QuizAttemptResponse();

        response.setId(savedAttempt.getId());
        response.setQuizId(savedAttempt.getQuiz().getId());
        response.setStudentId(savedAttempt.getStudent().getId());
        response.setScore(savedAttempt.getScore());
        response.setStartedAt(savedAttempt.getStartedAt());
        response.setSubmittedAt(savedAttempt.getSubmittedAt());

        return response;
    }
    public void submitAnswer(
            Long attemptId,
            QuizAnswerRequest request) {

        QuizAttempt attempt = quizAttemptRepository
                .findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Quiz attempt not found"));

        if (attempt.getSubmittedAt() != null) {
            throw new RuntimeException(
                    "Quiz attempt already submitted"
            );
        }

        Question question = questionRepository
                .findById(request.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        if (!question.getQuiz().getId().equals(attempt.getQuiz().getId())) {
            throw new RuntimeException(
                    "Question does not belong to this quiz"
            );
        }
        if (quizAnswerRepository.existsByAttemptIdAndQuestionId(
                attemptId,
                request.getQuestionId())) {

            throw new RuntimeException(
                    "Question already answered"
            );
        }

        QuizAnswer answer = new QuizAnswer();

        answer.setAttempt(attempt);
        answer.setQuestion(question);
        answer.setSelectedAnswer(request.getSelectedAnswer());

        quizAnswerRepository.save(answer);
    }
    public QuizAttemptResponse submitQuiz(Long attemptId) {

        QuizAttempt attempt = quizAttemptRepository
                .findById(attemptId)
                .orElseThrow(() ->
                        new RuntimeException("Quiz attempt not found"));

        if (attempt.getSubmittedAt() != null) {
            throw new RuntimeException(
                    "Quiz attempt already submitted"
            );
        }

        List<QuizAnswer> answers =
                quizAnswerRepository.findByAttemptId(attemptId);

        int score = 0;

        for (QuizAnswer answer : answers) {

            if (answer.getSelectedAnswer()
                    .equalsIgnoreCase(answer.getQuestion().getCorrectAnswer())) {

                score++;
            }
        }

        attempt.setScore(score);
        attempt.setSubmittedAt(LocalDateTime.now());

        QuizAttempt savedAttempt =
                quizAttemptRepository.save(attempt);

        QuizAttemptResponse response = new QuizAttemptResponse();

        response.setId(savedAttempt.getId());
        response.setQuizId(savedAttempt.getQuiz().getId());
        response.setStudentId(savedAttempt.getStudent().getId());
        response.setScore(savedAttempt.getScore());
        response.setStartedAt(savedAttempt.getStartedAt());
        response.setSubmittedAt(savedAttempt.getSubmittedAt());

        return response;
    }

    public QuizAttemptResponse getAttempt(Long attemptId) {

        QuizAttempt attempt = quizAttemptRepository
                .findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Quiz attempt not found"));

        QuizAttemptResponse response = new QuizAttemptResponse();

        response.setId(attempt.getId());
        response.setQuizId(attempt.getQuiz().getId());
        response.setStudentId(attempt.getStudent().getId());
        response.setScore(attempt.getScore());
        response.setStartedAt(attempt.getStartedAt());
        response.setSubmittedAt(attempt.getSubmittedAt());

        return response;
    }
}