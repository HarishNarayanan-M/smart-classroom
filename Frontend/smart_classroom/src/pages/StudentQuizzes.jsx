
import { useEffect, useState } from "react";
import {
  getQuizzesByCourse,
  getQuestionsByQuiz,
  startQuizAttempt,
  submitQuizAnswer,
  submitQuiz,
} from "../services/quizService";
import "./StudentQuizzes.css";

function StudentQuizzes({ courseId, studentId }) {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [attemptId, setAttemptId] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadQuizzes() {
      setLoading(true);
      setError("");

      try {
        const data = await getQuizzesByCourse(courseId);

        if (!cancelled) {
          setQuizzes(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load quizzes.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (courseId) {
      loadQuizzes();
    } else {
      setQuizzes([]);
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  async function handleStartQuiz(quiz) {
    if (!studentId) {
      setError("Student ID is missing. Please log in again.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setAnswers({});
    setAttemptId(null);

    try {
      const [questionData, attempt] = await Promise.all([
        getQuestionsByQuiz(quiz.id),
        startQuizAttempt(quiz.id, studentId),
      ]);

      setSelectedQuiz(quiz);
      setQuestions(Array.isArray(questionData) ? questionData : []);
      setAttemptId(attempt.id);
    } catch (err) {
      setError(err.message || "Unable to start this quiz.");
    } finally {
      setLoading(false);
    }
  }

  function handleAnswerChange(questionId, selectedAnswer) {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: selectedAnswer,
    }));
  }

  async function handleSubmitQuiz() {
    if (!attemptId || submitting) {
      return;
    }

    if (questions.length === 0) {
      setError("This quiz has no questions.");
      return;
    }

    if (Object.keys(answers).length !== questions.length) {
      setError("Please answer every question before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      for (const question of questions) {
        await submitQuizAnswer(
          attemptId,
          question.id,
          answers[question.id]
        );
      }

      const submittedResult = await submitQuiz(attemptId);
      setResult(submittedResult);
    } catch (err) {
      setError(err.message || "Unable to submit the quiz.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleBackToQuizzes() {
    setSelectedQuiz(null);
    setQuestions([]);
    setAnswers({});
    setAttemptId(null);
    setResult(null);
    setError("");
  }

  if (loading) {
    return <p>Loading quizzes...</p>;
  }

  return (
    <section className="student-quizzes">
      <div className="student-quizzes-header">
        <h2>Quizzes & Assessments</h2>
        <p>Test your understanding of this course.</p>
      </div>

      {error && (
        <p className="student-quiz-error" role="alert">
          {error}
        </p>
      )}

      {!selectedQuiz && (
        <div className="student-quiz-list">
          {quizzes.length === 0 ? (
            <div className="student-quiz-empty">
              <h3>No quizzes available</h3>
              <p>Your teacher has not created any quizzes for this course yet.</p>
            </div>
          ) : (
            quizzes.map((quiz) => (
              <article className="student-quiz-card" key={quiz.id}>
                <h3>{quiz.title}</h3>

                <p>
                  {quiz.description || "No description available."}
                </p>

                <p>
                  <strong>Duration:</strong>{" "}
                  {quiz.durationMinutes ?? "Not specified"} minutes
                </p>

                <button
                  type="button"
                  onClick={() => handleStartQuiz(quiz)}
                >
                  Start Quiz
                </button>
              </article>
            ))
          )}
        </div>
      )}

      {selectedQuiz && !result && (
        <div className="student-quiz-taking">
          <button
            type="button"
            className="student-quiz-back"
            onClick={handleBackToQuizzes}
            disabled={submitting}
          >
            Back to quizzes
          </button>

          <h3>{selectedQuiz.title}</h3>

          <p>
            Question {Object.keys(answers).length} of {questions.length} answered
          </p>

          {questions.length === 0 ? (
            <p>This quiz has no questions yet.</p>
          ) : (
            questions.map((question, index) => {
              const options = [
                ["A", question.optionA],
                ["B", question.optionB],
                ["C", question.optionC],
                ["D", question.optionD],
              ].filter(([, optionText]) => optionText);

              return (
                <article
                  className="student-question-card"
                  key={question.id}
                >
                  <h4>
                    {index + 1}. {question.questionText}
                  </h4>

                  <div className="student-question-options">
                    {options.map(([label, optionText]) => (
                      <label key={label}>
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={label}
                          checked={answers[question.id] === label}
                          onChange={() =>
                            handleAnswerChange(question.id, label)
                          }
                          disabled={submitting}
                        />

                        <span>
                          <strong>{label}.</strong> {optionText}
                        </span>
                      </label>
                    ))}
                  </div>
                </article>
              );
            })
          )}

          {questions.length > 0 && (
            <button
              type="button"
              className="student-quiz-submit"
              onClick={handleSubmitQuiz}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
          )}
        </div>
      )}

      {result && (
        <div className="student-quiz-result">
          <h3>Quiz submitted successfully!</h3>

          <p>
            <strong>Quiz:</strong> {selectedQuiz.title}
          </p>

          <p>
            <strong>Score:</strong> {result.score}
          </p>

          <p>Your answers have been evaluated.</p>

          <button type="button" onClick={handleBackToQuizzes}>
            Back to quizzes
          </button>
        </div>
      )}
    </section>
  );
}

export default StudentQuizzes;
