const API_BASE_URL = "http://localhost:8080/api";

export async function getStudyMaterialsByCourse(courseId) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/courses/${courseId}/materials`,
    {
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
      throw new Error("Invalid response while loading study materials.");
    }
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        `Failed to load study materials (HTTP ${response.status}).`
    );
  }

  return data;
}


export async function uploadStudyMaterial(courseId, materialData) {
  const token = localStorage.getItem("token");
  const formData = new FormData();

  formData.append("title", materialData.title);
  formData.append("description", materialData.description);
  formData.append("file", materialData.file);

  const response = await fetch(
    `${API_BASE_URL}/courses/${courseId}/materials/upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  const responseText = await response.text();
  let data = {};

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error("Invalid response while uploading study material.");
    }
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        `Upload failed (HTTP ${response.status}).`
    );
  }

  return data;
}

export async function deleteStudyMaterial(courseId, materialId) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/courses/${courseId}/materials/${materialId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const responseText = await response.text();
    let data = {};

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      // Keep the fallback HTTP error message.
    }

    throw new Error(
      data.message ||
        data.error ||
        `Delete failed (HTTP ${response.status}).`
    );
  }
}
