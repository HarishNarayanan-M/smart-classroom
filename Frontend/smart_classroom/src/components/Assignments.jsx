
import { useEffect, useState } from "react";
import { getAssignmentsByCourse } from "../services/assignmentService";
import {
  submitAssignmentFile,
  getStudentSubmission,
  unsubmitAssignment,
} from "../services/assignmentSubmissionService";

function Assignments({ courseId, studentId }) {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState({});
  const [submittingId, setSubmittingId] = useState(null);
  const [messages, setMessages] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadAssignments() {
      setLoading(true);
      setError("");

      try {
        const data = await getAssignmentsByCourse(courseId);
        const assignmentList = Array.isArray(data) ? data : [];

        if (cancelled) return;

        setAssignments(assignmentList);

        if (studentId) {
          const results = await Promise.all(
            assignmentList.map(async (assignment) => {
              try {
                const submission = await getStudentSubmission(
                  assignment.id,
                  studentId
                );
                return [assignment.id, submission, null];
              } catch (err) {
                return [
                  assignment.id,
                  null,
                  err.message || "Unable to load submission status.",
                ];
              }
            })
          );

          if (cancelled) return;

          const nextSubmissions = {};
          const nextMessages = {};

          results.forEach(([id, submission, message]) => {
            nextSubmissions[id] = submission;
            if (message) nextMessages[id] = message;
          });

          setSubmissions(nextSubmissions);
          setMessages((previous) => ({
            ...previous,
            ...nextMessages,
          }));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load assignments.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAssignments();

    return () => {
      cancelled = true;
    };
  }, [courseId, studentId, refreshKey]);

  function handleFileChange(assignmentId, file) {
    setSelectedFiles((previous) => ({
      ...previous,
      [assignmentId]: file,
    }));

    setMessages((previous) => ({
      ...previous,
      [assignmentId]: "",
    }));
  }

  async function handleSubmit(assignmentId) {
    const file = selectedFiles[assignmentId];

    if (!studentId) {
      setMessages((previous) => ({
        ...previous,
        [assignmentId]: "Student ID is missing. Please log in again.",
      }));
      return;
    }

    if (!file) {
      setMessages((previous) => ({
        ...previous,
        [assignmentId]: "Please choose a file before submitting.",
      }));
      return;
    }

    setSubmittingId(assignmentId);
    setMessages((previous) => ({
      ...previous,
      [assignmentId]: "",
    }));

    try {
      await submitAssignmentFile(assignmentId, studentId, file);

      setMessages((previous) => ({
        ...previous,
        [assignmentId]: "Assignment submitted successfully!",
      }));

      setSelectedFiles((previous) => ({
        ...previous,
        [assignmentId]: null,
      }));

      // Reload submission status, grade, and feedback.
      setRefreshKey((previous) => previous + 1);
    } catch (err) {
      setMessages((previous) => ({
        ...previous,
        [assignmentId]: err.message || "Submission failed.",
      }));
    } finally {
      setSubmittingId(null);
    }
  }

  
async function handleUnsubmit(assignmentId) {
  const submission = submissions[assignmentId];

  if (!submission) return;

  if (submission.grade !== null && submission.grade !== undefined) {
    setMessages((previous) => ({
      ...previous,
      [assignmentId]: "A graded assignment cannot be unsubmitted.",
    }));
    return;
  }

  const confirmed = window.confirm(
    "Are you sure you want to withdraw this submission?"
  );

  if (!confirmed) return;

  setSubmittingId(assignmentId);
  setMessages((previous) => ({
    ...previous,
    [assignmentId]: "",
  }));

  try {
    await unsubmitAssignment(assignmentId, studentId);

    setSubmissions((previous) => ({
      ...previous,
      [assignmentId]: null,
    }));

    setSelectedFiles((previous) => ({
      ...previous,
      [assignmentId]: null,
    }));

    setMessages((previous) => ({
      ...previous,
      [assignmentId]: "Assignment unsubmitted successfully.",
    }));

    setRefreshKey((previous) => previous + 1);
  } catch (err) {
    setMessages((previous) => ({
      ...previous,
      [assignmentId]: err.message || "Failed to unsubmit assignment.",
    }));
  } finally {
    setSubmittingId(null);
  }
}


  if (loading) return <p>Loading assignments...</p>;

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (assignments.length === 0) {
    return (
      <div className="assignment-empty">
        <h3>No assignments yet</h3>
        <p>Your teacher has not published any assignments for this course.</p>
      </div>
    );
  }

  return (
    <div className="assignment-list">
      {assignments.map((assignment) => {
        const submission = submissions[assignment.id];
        const statusMessage = messages[assignment.id];

        const isGraded =
          submission?.grade !== null &&
          submission?.grade !== undefined;

        const isSubmitted = Boolean(submission);

        return (
          <article className="assignment-card" key={assignment.id}>
            <div className="assignment-info">
              <h3>{assignment.title}</h3>

              <p>
                {assignment.description || "No description available."}
              </p>

              <p className="assignment-due-date">
                <strong>Due date:</strong>{" "}
                {assignment.dueDate
                  ? new Date(assignment.dueDate).toLocaleString()
                  : "Not specified"}
              </p>

              {isSubmitted ? (
                <div className="submission-details">
                  <p>
                    <strong>Submitted:</strong>{" "}
                    {submission.submittedAt
                      ? new Date(submission.submittedAt).toLocaleString()
                      : "Yes"}
                  </p>

                  {submission.submissionUrl && (
                    <p>
                      <a
                        href={`http://localhost:8080${submission.submissionUrl}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View submitted file
                      </a>
                    </p>
                  )}


              {isGraded ? (
                <div className="assignment-grade">
                  <p>
                    <strong>Grade:</strong> {submission.grade}
                  </p>
                  <p>
                    <strong>Teacher feedback:</strong>{" "}
                    {submission.feedback || "No feedback provided."}
                  </p>
                </div>
              ) : (
                <>
                  <p>Your submission is awaiting grading.</p>

                  <button
                    type="button"
                    onClick={() => handleUnsubmit(assignment.id)}
                    disabled={submittingId === assignment.id}
                  >
                    {submittingId === assignment.id
                      ? "Withdrawing..."
                      : "Unsubmit Assignment"}
                  </button>
                </>
              )}

                </div>
              ) : (
                <>
                  <div className="assignment-submit-form">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.zip"
                      onChange={(event) =>
                        handleFileChange(
                          assignment.id,
                          event.target.files?.[0] || null
                        )
                      }
                      disabled={submittingId === assignment.id}
                    />

                    <button
                      type="button"
                      onClick={() => handleSubmit(assignment.id)}
                      disabled={submittingId === assignment.id}
                    >
                      {submittingId === assignment.id
                        ? "Submitting..."
                        : "Submit Assignment"}
                    </button>
                  </div>

                  {!studentId && (
                    <p className="assignment-submit-message">
                      Student ID is missing. Please log in again.
                    </p>
                  )}
                </>
              )}

              {statusMessage && (
                <p role="status" className="assignment-submit-message">
                  {statusMessage}
                </p>
              )}
            </div>

            <span
              className={`assignment-status ${
                isGraded
                  ? "graded"
                  : isSubmitted
                    ? "submitted"
                    : "not-submitted"
              }`}
            >
              {isGraded
                ? "Graded"
                : isSubmitted
                  ? "Submitted"
                  : "Not submitted"}
            </span>
          </article>
        );
      })}
    </div>
  );
}

export default Assignments;
