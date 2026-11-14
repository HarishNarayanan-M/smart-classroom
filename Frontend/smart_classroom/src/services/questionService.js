const API_URL = "http://localhost:8080/api";

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getQuestionsByQuiz = async (quizId) => {
  const response = await fetch(
    `${API_URL}/quizzes/${quizId}/questions`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to load questions");
  }

  return response.json();
};

export const createQuestion = async (quizId, questionData) => {
  const response = await fetch(
    `${API_URL}/quizzes/${quizId}/questions`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(questionData),
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to create question");
  }

  return response.json();
};