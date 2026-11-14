const API_URL = "http://localhost:8080/api";

const getToken = () => localStorage.getItem("token");

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

export const getQuizzesByCourse = async (courseId) => {
  const response = await fetch(
    `${API_URL}/courses/${courseId}/quizzes`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch quizzes");
  }

  return response.json();
};

export const createQuiz = async (courseId, quizData) => {
  const response = await fetch(
    `${API_URL}/courses/${courseId}/quizzes`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(quizData),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create quiz");
  }

  return response.json();
};

export const deleteQuiz = async (courseId, quizId) => {
  const response = await fetch(
    `${API_URL}/courses/${courseId}/quizzes/${quizId}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete quiz");
  }
};


export const startQuizAttempt = async (quizId, studentId) => {
  const response = await fetch(
    `${API_URL}/quizzes/${quizId}/attempts`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ studentId }),
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to start quiz.");
  }

  return response.json();
};

export const submitQuizAnswer = async (
  attemptId,
  questionId,
  selectedAnswer
) => {
  const response = await fetch(
    `${API_URL}/quizzes/attempts/${attemptId}/answers`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ questionId, selectedAnswer }),
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to submit answer.");
  }
};

export const submitQuiz = async (attemptId) => {
  const response = await fetch(
    `${API_URL}/quizzes/attempts/${attemptId}/submit`,
    {
      method: "POST",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to submit quiz.");
  }

  return response.json();
};

export const getQuizAttempt = async (attemptId) => {
  const response = await fetch(
    `${API_URL}/quizzes/attempts/${attemptId}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to fetch quiz result.");
  }

  return response.json();
};


export const getQuestionsByQuiz = async (quizId) => {
  const response = await fetch(
    `${API_URL}/quizzes/${quizId}/questions`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to fetch quiz questions.");
  }

  return response.json();
};
