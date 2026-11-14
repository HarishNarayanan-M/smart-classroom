
const API_BASE_URL = "http://localhost:8080/api";

// Fetch lectures for a specific course
export async function getCourseLectures(courseId, token) {
  const response = await fetch(
    `${API_BASE_URL}/courses/${courseId}/lectures`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to load lectures");
  }

  return response.json();
}

// Create a lecture using a video URL
export async function createLecture(courseId, lectureData, token) {
  const response = await fetch(
    `${API_BASE_URL}/courses/${courseId}/lectures`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(lectureData),
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to create lecture");
  }

  return response.json();
}

// Upload a video file
export async function uploadLectureVideo(courseId, lectureData, token) {
  const formData = new FormData();

  formData.append("title", lectureData.title);
  formData.append("description", lectureData.description || "");
  formData.append("video", lectureData.video);

  const response = await fetch(
    `${API_BASE_URL}/courses/${courseId}/lectures/upload`,
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
    throw new Error(message || "Failed to upload lecture video");
  }

  return response.json();
}


/**
 * Permanently delete a lecture from the database.
 */
export async function deleteLecture(courseId, lectureId, token) {
  const response = await fetch(
    `${API_BASE_URL}/courses/${courseId}/lectures/${lectureId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to delete lecture");
  }
}
