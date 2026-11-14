const API_BASE_URL = "http://localhost:8080/api";

export async function getStudentCourses(studentId) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/enrollments/student/${studentId}/courses`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const responseText = await response.text();
  let data = [];

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error("The server returned an invalid response.");
    }
  }

  if (!response.ok) {
    throw new Error(`Unable to fetch courses (HTTP ${response.status}).`);
  }

  return data;
}


/* Get all available courses */
export async function getAllCourses() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/courses`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      responseText || `Unable to fetch available courses (HTTP ${response.status}).`
    );
  }

  return responseText ? JSON.parse(responseText) : [];
}

/* Enroll the logged-in student in a course */
export async function enrollInCourse(studentId, courseId) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/enrollments/${studentId}/courses/${courseId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || `Unable to enroll (HTTP ${response.status}).`
    );
  }

  return response.text();
}

export async function unenrollFromCourse(studentId, courseId) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/enrollments/${studentId}/courses/${courseId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(await response.text() || "Unable to unenroll.");
  }

  return response.text();
}