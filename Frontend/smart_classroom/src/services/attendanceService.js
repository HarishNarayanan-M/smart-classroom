const API_URL = "http://localhost:8080/api";

function getHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

// Get students enrolled in a course
export async function getEnrolledStudents(courseId) {
  const response = await fetch(
    `${API_URL}/enrollments/course/${courseId}/students`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(await response.text() || "Failed to load students");
  }

  return response.json();
}

// Get attendance for a course on a particular date
export async function getAttendanceByCourseAndDate(courseId, date) {
  const response = await fetch(
    `${API_URL}/courses/${courseId}/attendance?date=${encodeURIComponent(date)}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(await response.text() || "Failed to load attendance");
  }

  return response.json();
}

// Mark attendance for one student
export async function markAttendance(courseId, attendanceData) {
  const response = await fetch(
    `${API_URL}/courses/${courseId}/attendance`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(attendanceData),
    }
  );

  if (!response.ok) {
    throw new Error(await response.text() || "Failed to mark attendance");
  }

  return response.json();
}


/* Get all attendance records for a student */
export async function getStudentAttendance(studentId) {
  const response = await fetch(
    `${API_URL}/students/${studentId}/attendance`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      (await response.text()) || "Failed to load student attendance"
    );
  }

  return response.json();
}

/* Get attendance summary for a student in a course */
export async function getAttendanceSummary(studentId, courseId) {
  const response = await fetch(
    `${API_URL}/students/${studentId}/courses/${courseId}/attendance/summary`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      (await response.text()) || "Failed to load attendance summary"
    );
  }

  return response.json();
}
