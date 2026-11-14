const API_BASE_URL = "http://localhost:8080/api";

export async function getLiveClassesByCourse(courseId) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/live-classes/course/${courseId}`,
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
    throw new Error(
      `Unable to load live classes (HTTP ${response.status}).`
    );
  }

  return data;
}
