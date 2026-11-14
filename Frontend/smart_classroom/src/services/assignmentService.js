
const API_BASE_URL = "http://localhost:8080/api";

export async function getAssignmentsByCourse(courseId) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/courses/${courseId}/assignments`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to load assignments (HTTP ${response.status}).`);
  }

  return response.json();
}

export async function createAssignment(courseId, assignmentData) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/courses/${courseId}/assignments`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(assignmentData),
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Failed to create assignment (HTTP ${response.status}).`);
  }

  return response.json();
}

export async function deleteAssignment(courseId, assignmentId) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/courses/${courseId}/assignments/${assignmentId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete assignment (HTTP ${response.status}).`);
  }
}


export async function getSubmissionsByAssignment(assignmentId) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/assignments/${assignmentId}/submissions`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to load submissions (HTTP ${response.status}).`
    );
  }

  return response.json();
}

export async function gradeSubmission(submissionId, grade, feedback) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/assignments/submissions/${submissionId}/grade`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grade: Number(grade),
        feedback,
      }),
    }
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message || `Failed to save grade (HTTP ${response.status}).`
    );
  }
}
