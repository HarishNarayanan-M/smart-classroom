import { useEffect, useState } from "react";
import {
  getQuizzesByCourse,
  createQuiz,
  deleteQuiz,
} from "../services/quizService";
import {
  getQuestionsByQuiz,
  createQuestion,
} from "../services/questionService";
import { getTeacherCourses } from "../services/teacherService";
import "./TeacherQuizzes.css";

export default function TeacherQuizzes() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [quizzes, setQuizzes] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(15);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("A");

  const [questionSaving, setQuestionSaving] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadQuizzes(selectedCourseId);
    } else {
      setQuizzes([]);
    }
  }, [selectedCourseId]);

  async function loadCourses() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const data = await getTeacherCourses(token);
      setCourses(data);

      if (data.length > 0) {
        setSelectedCourseId(String(data[0].id));
      }
    } catch (err) {
      setError(err.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }

  async function loadQuizzes(courseId) {
    try {
      setLoading(true);
      setError("");

      const data = await getQuizzesByCourse(courseId);
      setQuizzes(data);
    } catch (err) {
      setError(err.message || "Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateQuiz(event) {
    event.preventDefault();

    if (!selectedCourseId) {
      setError("Please select a course.");
      return;
    }

    if (!title.trim()) {
      setError("Quiz title is required.");
      return;
    }

    if (!Number.isInteger(Number(durationMinutes)) || Number(durationMinutes) <= 0) {
      setError("Duration must be a positive whole number.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      await createQuiz(selectedCourseId, {
        title: title.trim(),
        description: description.trim(),
        durationMinutes: Number(durationMinutes),
      });

      setTitle("");
      setDescription("");
      setDurationMinutes(15);
      setMessage("Quiz created successfully.");

      await loadQuizzes(selectedCourseId);
    } catch (err) {
      setError(err.message || "Failed to create quiz");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteQuiz(quizId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this quiz?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await deleteQuiz(selectedCourseId, quizId);

      setQuizzes((current) =>
        current.filter((quiz) => quiz.id !== quizId)
      );

      setMessage("Quiz deleted successfully.");
    } catch (err) {
      setError(
        err.message ||
          "Could not delete this quiz. Students may have attempted it."
      );
    }
  }

  async function handleManageQuestions(quizId) {
  try {
    setError("");
    setMessage("");
    setSelectedQuizId(quizId);
    setQuestions([]);

    const data = await getQuestionsByQuiz(quizId);
    setQuestions(data);
  } catch (err) {
    setError(err.message || "Failed to load questions");
  }
}

    async function handleCreateQuestion(event) {
    event.preventDefault();

    if (!questionText.trim() ||
        !optionA.trim() ||
        !optionB.trim() ||
        !optionC.trim() ||
        !optionD.trim()) {
        setError("Please fill in the question and all four options.");
        return;
    }

    try {
        setQuestionSaving(true);
        setError("");
        setMessage("");

        await createQuestion(selectedQuizId, {
        questionText: questionText.trim(),
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        optionC: optionC.trim(),
        optionD: optionD.trim(),
        correctAnswer,
        });

        setQuestionText("");
        setOptionA("");
        setOptionB("");
        setOptionC("");
        setOptionD("");
        setCorrectAnswer("A");

        const data = await getQuestionsByQuiz(selectedQuizId);
        setQuestions(data);

        setMessage("Question added successfully.");
    } catch (err) {
        setError(err.message || "Failed to add question");
    } finally {
        setQuestionSaving(false);
    }
    }

  return (
    <div className="teacher-quizzes">
      <div className="quiz-page-header">
        <div>
          <h1>Quizzes & Assessments</h1>
          <p>Create and manage quizzes for your courses.</p>
        </div>
      </div>

      {error && <div className="quiz-alert quiz-error">{error}</div>}
      {message && <div className="quiz-alert quiz-success">{message}</div>}

      <section className="quiz-panel">
        <h2>Select Course</h2>

        {courses.length === 0 ? (
          <p>No courses are assigned to you yet.</p>
        ) : (
          <select
            value={selectedCourseId}
            onChange={(event) => setSelectedCourseId(event.target.value)}
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        )}
      </section>

      <section className="quiz-panel">
        <h2>Create a Quiz</h2>

        <form onSubmit={handleCreateQuiz} className="quiz-form">
          <label>
            Quiz Title
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Java Basics Test"
              required
            />
          </label>

          <label>
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Enter quiz instructions or description"
              rows="3"
            />
          </label>

          <label>
            Duration (minutes)
            <input
              type="number"
              min="1"
              step="1"
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(event.target.value)}
              required
            />
          </label>

          <button
            type="submit"
            disabled={saving || !selectedCourseId}
          >
            {saving ? "Creating..." : "Create Quiz"}
          </button>
        </form>
      </section>

      <section className="quiz-panel">
        <div className="quiz-list-header">
          <h2>Existing Quizzes</h2>
          <button
            type="button"
            className="quiz-refresh-button"
            onClick={() => selectedCourseId && loadQuizzes(selectedCourseId)}
            disabled={loading || !selectedCourseId}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : quizzes.length === 0 ? (
          <p>No quizzes found for this course.</p>
        ) : (
          <div className="quiz-list">
            {quizzes.map((quiz) => (
              <article className="quiz-card" key={quiz.id}>
                <div className="quiz-card-content">
                  <h3>{quiz.title}</h3>
                  <p>{quiz.description || "No description provided."}</p>
                  <span>{quiz.durationMinutes} minutes</span>
                </div>
                <button
                type="button"
                onClick={() => handleManageQuestions(quiz.id)}
                >
                Manage Questions
                </button>
                <button
                  type="button"
                  className="quiz-delete-button"
                  onClick={() => handleDeleteQuiz(quiz.id)}
                >
                  Delete
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
      {selectedQuizId !== null && (
  <section className="quiz-panel">
    <div className="quiz-list-header">
      <h2>Manage Questions</h2>

      <button
        type="button"
        onClick={() => {
          setSelectedQuizId(null);
          setQuestions([]);
          setError("");
          setMessage("");
        }}
      >
        Close
      </button>
    </div>

    <form
      onSubmit={handleCreateQuestion}
      className="quiz-form"
    >
      <label>
        Question
        <textarea
          value={questionText}
          onChange={(event) => setQuestionText(event.target.value)}
          placeholder="Enter your question"
          rows="3"
          required
        />
      </label>

      <label>
        Option A
        <input
          value={optionA}
          onChange={(event) => setOptionA(event.target.value)}
          required
        />
      </label>

      <label>
        Option B
        <input
          value={optionB}
          onChange={(event) => setOptionB(event.target.value)}
          required
        />
      </label>

      <label>
        Option C
        <input
          value={optionC}
          onChange={(event) => setOptionC(event.target.value)}
          required
        />
      </label>

      <label>
        Option D
        <input
          value={optionD}
          onChange={(event) => setOptionD(event.target.value)}
          required
        />
      </label>

      <label>
        Correct Answer
        <select
          value={correctAnswer}
          onChange={(event) => setCorrectAnswer(event.target.value)}
        >
          <option value="A">Option A</option>
          <option value="B">Option B</option>
          <option value="C">Option C</option>
          <option value="D">Option D</option>
        </select>
      </label>

      <button type="submit" disabled={questionSaving}>
        {questionSaving ? "Saving..." : "Add Question"}
      </button>
    </form>

    <h3>Saved Questions ({questions.length})</h3>

    {questions.length === 0 ? (
      <p>No questions added yet.</p>
    ) : (
      <div className="quiz-list">
        {questions.map((question, index) => (
          <article className="quiz-card" key={question.id}>
            <div className="quiz-card-content">
              <h4>
                {index + 1}. {question.questionText}
              </h4>
              <p>A. {question.optionA}</p>
              <p>B. {question.optionB}</p>
              <p>C. {question.optionC}</p>
              <p>D. {question.optionD}</p>
            </div>
          </article>
        ))}
      </div>
    )}
  </section>
)}
    </div>
  );
}

