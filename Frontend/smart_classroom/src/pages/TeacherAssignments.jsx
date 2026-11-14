
import { useEffect, useState } from "react";
import "./TeacherAssignments.css";

import { getTeacherCourses } from "../services/teacherService";

import {
  getAssignmentsByCourse,
  createAssignment,
  deleteAssignment,
  getSubmissionsByAssignment,
  gradeSubmission,
} from "../services/assignmentService";

function TeacherAssignments() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [assignments, setAssignments] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradingId, setGradingId] = useState(null);
  const [gradeInputs, setGradeInputs] = useState({});

  useEffect(() => {
    async function loadCourses() {
      try {
        setError("");
        const token = localStorage.getItem("token");
        const data = await getTeacherCourses(token);

        setCourses(data);

        if (data.length > 0) {
          setSelectedCourseId(String(data[0].id));
        }
      } catch (err) {
        setError(err.message || "Failed to load courses.");
      } finally {
        setLoadingCourses(false);
      }
    }

    loadCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) {
      setAssignments([]);
      return;
    }

    async function loadAssignments() {
      try {
        setLoadingAssignments(true);
        setError("");
        setAssignments([]);

        const data = await getAssignmentsByCourse(selectedCourseId);
        setAssignments(data);
      } catch (err) {
        setError(err.message || "Failed to load assignments.");
      } finally {
        setLoadingAssignments(false);
      }
    }

    loadAssignments();
  }, [selectedCourseId]);

  async function handleCreateAssignment(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!selectedCourseId) {
      setError("Please select a course.");
      return;
    }

    if (!title.trim() || !dueDate) {
      setError("Please enter an assignment title and due date.");
      return;
    }

    try {
      setSaving(true);

      await createAssignment(selectedCourseId, {
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate.length === 16 ? `${dueDate}:00` : dueDate,
      });

      setTitle("");
      setDescription("");
      setDueDate("");

      const updatedAssignments =
        await getAssignmentsByCourse(selectedCourseId);

      setAssignments(updatedAssignments);
      setMessage("Assignment created successfully.");
    } catch (err) {
      setError(err.message || "Failed to create assignment.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAssignment(assignmentId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this assignment?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      setDeletingId(assignmentId);

      await deleteAssignment(selectedCourseId, assignmentId);

      setAssignments((previous) =>
        previous.filter((assignment) => assignment.id !== assignmentId)
      );

      setMessage("Assignment deleted successfully.");
    } catch (err) {
      setError(err.message || "Failed to delete assignment.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleViewSubmissions(assignmentId) {
  setError("");
  setMessage("");
  setSelectedAssignmentId(assignmentId);
  setSubmissions([]);
  setGradeInputs({});

  try {
    setLoadingSubmissions(true);

    const data = await getSubmissionsByAssignment(assignmentId);
    setSubmissions(data);

    const inputs = {};

    data.forEach((submission) => {
      inputs[submission.id] = {
        grade: submission.grade ?? "",
        feedback: submission.feedback ?? "",
      };
    });

    setGradeInputs(inputs);
  } catch (err) {
    setError(err.message || "Failed to load submissions.");
  } finally {
    setLoadingSubmissions(false);
  }
}

async function handleSaveGrade(submissionId) {
  const values = gradeInputs[submissionId];

  if (
    !values ||
    values.grade === "" ||
    Number(values.grade) < 0 ||
    Number(values.grade) > 100
  ) {
    setError("Enter a grade between 0 and 100.");
    return;
  }

  setError("");
  setMessage("");

  try {
    setGradingId(submissionId);

    await gradeSubmission(
      submissionId,
      values.grade,
      values.feedback
    );

    setSubmissions((previous) =>
      previous.map((submission) =>
        submission.id === submissionId
          ? {
              ...submission,
              grade: Number(values.grade),
              feedback: values.feedback,
            }
          : submission
      )
    );

    setMessage("Grade and feedback saved successfully.");
  } catch (err) {
    setError(err.message || "Failed to save grade.");
  } finally {
    setGradingId(null);
  }
}

  function formatDueDate(value) {
    if (!value) return "No due date";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function isPastDue(value) {
    return value && new Date(value).getTime() < Date.now();
  }

  if (loadingCourses) {
    return (
      <main className="assignments-page">
        <p>Loading courses...</p>
      </main>
    );
  }

  return (
    <main className="assignments-page">
      <header className="assignments-header">
        <div>
          <p className="assignments-eyebrow">TEACHER WORKSPACE</p>
          <h1>Assignments</h1>
          <p>Create assignments and manage course deadlines.</p>
        </div>

        <div className="assignments-count">
          <span>{assignments.length}</span>
          <small>Assignments</small>
        </div>
      </header>

      {error && <div className="assignments-alert error">{error}</div>}
      {message && (
        <div className="assignments-alert success">{message}</div>
      )}

      <section className="assignments-course-section">
        <label htmlFor="assignment-course">Select course</label>

        {courses.length === 0 ? (
          <p>No courses have been assigned to you yet.</p>
        ) : (
          <select
            id="assignment-course"
            value={selectedCourseId}
            onChange={(event) => {
              setSelectedCourseId(event.target.value);
              setMessage("");
            }}
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name} {course.code ? `(${course.code})` : ""}
              </option>
            ))}
          </select>
        )}
      </section>

      <div className="assignments-layout">
        <section className="assignments-card">
          <div className="assignments-section-heading">
            <span className="assignments-icon">＋</span>
            <div>
              <h2>Create assignment</h2>
              <p>Set a task and deadline for your students.</p>
            </div>
          </div>

          <form onSubmit={handleCreateAssignment}>
            <label htmlFor="assignment-title">Assignment title</label>
            <input
              id="assignment-title"
              type="text"
              placeholder="e.g. Java OOP Assignment"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={150}
              required
            />

            <label htmlFor="assignment-description">Description</label>
            <textarea
              id="assignment-description"
              placeholder="Describe the task and requirements..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
            />

            <label htmlFor="assignment-due-date">Due date and time</label>
            <input
              id="assignment-due-date"
              type="datetime-local"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              required
            />

            <button
              className="assignments-primary-button"
              type="submit"
              disabled={saving || !selectedCourseId}
            >
              {saving ? "Creating..." : "Create assignment"}
            </button>
          </form>
        </section>

        <section className="assignments-card">
          <div className="assignments-section-heading">
            <span className="assignments-icon">▤</span>
            <div>
              <h2>Course assignments</h2>
              <p>Review and manage assignments for this course.</p>
            </div>
          </div>

          {loadingAssignments ? (
            <p className="assignments-empty">Loading assignments...</p>
          ) : assignments.length === 0 ? (
            <div className="assignments-empty">
              <span className="assignments-empty-icon">▧</span>
              <h3>No assignments yet</h3>
              <p>Create your first assignment using the form.</p>
            </div>
          ) : (
            <div className="assignments-list">
              {assignments.map((assignment) => {
                const overdue = isPastDue(assignment.dueDate);

                return (
                  <article
                    className="assignment-item"
                    key={assignment.id}
                  >
                    <div className="assignment-item-top">
                      <div className="assignment-icon">A</div>

                      <span
                        className={`assignment-status ${
                          overdue ? "overdue" : "upcoming"
                        }`}
                      >
                        {overdue ? "Past deadline" : "Upcoming"}
                      </span>
                    </div>

                    <h3>{assignment.title}</h3>

                    <p className="assignment-description">
                      {assignment.description ||
                        "No description provided."}
                    </p>

                    <div className="assignment-deadline">
                      <span>Due date</span>
                      <strong>
                        {formatDueDate(assignment.dueDate)}
                      </strong>
                    </div>

                    <button
                      className="assignments-primary-button"
                      type="button"
                      onClick={() => handleViewSubmissions(assignment.id)}
                    >
                      View Submissions
                    </button>

                    <button
                      className="assignments-delete-button"
                      type="button"
                      onClick={() =>
                        handleDeleteAssignment(assignment.id)
                      }
                      disabled={deletingId === assignment.id}
                    >
                      {deletingId === assignment.id
                        ? "Deleting..."
                        : "Delete assignment"}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
      {selectedAssignmentId !== null && (
  <section className="assignments-card grading-section">
    <h2>Student Submissions</h2>

    {loadingSubmissions ? (
      <p>Loading submissions...</p>
    ) : submissions.length === 0 ? (
      <p>No submissions found for this assignment.</p>
    ) : (
      submissions.map((submission) => (
        <article
          className="submission-card"
          key={submission.id}
        >
          <h3>{submission.studentName}</h3>

          <p>
            Submitted:{" "}
            {submission.submittedAt
              ? formatDueDate(submission.submittedAt)
              : "Not available"}
          </p>

          <a
            href={`http://localhost:8080${submission.submissionUrl}`}
            target="_blank"
            rel="noreferrer"
          >
            View submitted file
          </a>

          <label htmlFor={`grade-${submission.id}`}>
            Grade (out of 100)
          </label>

          <input
            id={`grade-${submission.id}`}
            type="number"
            min="0"
            max="100"
            value={gradeInputs[submission.id]?.grade ?? ""}
            onChange={(event) =>
              setGradeInputs((previous) => ({
                ...previous,
                [submission.id]: {
                  ...previous[submission.id],
                  grade: event.target.value,
                },
              }))
            }
          />

          <label htmlFor={`feedback-${submission.id}`}>
            Feedback
          </label>

          <textarea
            id={`feedback-${submission.id}`}
            rows={3}
            value={gradeInputs[submission.id]?.feedback ?? ""}
            onChange={(event) =>
              setGradeInputs((previous) => ({
                ...previous,
                [submission.id]: {
                  ...previous[submission.id],
                  feedback: event.target.value,
                },
              }))
            }
          />

          <button
            className="assignments-primary-button"
            type="button"
            disabled={gradingId === submission.id}
            onClick={() => handleSaveGrade(submission.id)}
          >
            {gradingId === submission.id
              ? "Saving..."
              : "Save Grade"}
          </button>
        </article>
      ))
    )}
  </section>
)}
    </main>
  );
}

export default TeacherAssignments;
