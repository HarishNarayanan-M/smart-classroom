
const API_BASE_URL = "http://localhost:8080/api";

export async function getTeacherCourses(token) {
  const response = await fetch(`${API_BASE_URL}/teacher/courses`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || `Failed to load courses (${response.status})`
    );
  }

  return response.json();
}
