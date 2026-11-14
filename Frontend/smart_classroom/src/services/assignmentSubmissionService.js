const API_BASE_URL = "http://localhost:8080/api";

export async function submitAssignmentFile(assignmentId, studentId, file) {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/assignments/${assignmentId}/submit-file?studentId=${studentId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || `Failed to submit assignment (HTTP ${response.status}).`
    );
  }

  return true;
}


export async function getStudentSubmission(assignmentId, studentId) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/assignments/${assignmentId}/student-submission?studentId=${studentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  // 204 means the student has not submitted this assignment.
  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Failed to load submission (HTTP ${response.status}).`
    );
  }

  return response.json();
}


export async function unsubmitAssignment(assignmentId, studentId) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `http://localhost:8080/api/assignments/${assignmentId}/unsubmit?studentId=${studentId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || `Failed to unsubmit assignment (HTTP ${response.status}).`
    );
  }
}
