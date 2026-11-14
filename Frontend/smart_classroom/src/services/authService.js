
const API_BASE_URL = "http://localhost:8080/api";

export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  // Read the response as text first to handle empty responses safely
  const responseText = await response.text();

  let data = {};

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(
        `Server returned an invalid response (HTTP ${response.status}).`
      );
    }
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
      data.error ||
      `Login failed (HTTP ${response.status}).`
    );
  }

  if (!data.token) {
    throw new Error("Login response does not contain a token.");
  }

  return data;
}
