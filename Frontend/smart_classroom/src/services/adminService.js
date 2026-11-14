
const API_BASE_URL = "http://localhost:8080/api/admin";

export async function getAllTeachers() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/teachers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load teachers (${response.status})`);
  }

  return response.json();
}

export async function approveTeacher(teacherId) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/teachers/${teacherId}/approve`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to approve teacher (${response.status})`);
  }

  return response.text();
}

export async function rejectTeacher(teacherId) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/teachers/${teacherId}/reject`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || `Failed to reject teacher (${response.status})`
    );
  }

  return response.text();
}

export async function getAllStudents() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/students`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load students (${response.status})`);
  }

  return response.json();
}


export async function getAllCourses() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/courses`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load courses (${response.status})`);
  }

  return response.json();
}


export async function getAllDepartments() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/departments`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to load departments (${response.status})`
    );
  }

  return response.json();
}

export async function assignTeacherToCourse(courseId, teacherId) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/courses/${courseId}/teachers/${teacherId}`,
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
      message || `Failed to assign teacher (${response.status})`
    );
  }

  return response.text();
}


export async function createCourse(courseData) {
  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:8080/api/courses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(courseData),
  });

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message || `Failed to create course (${response.status})`
    );
  }

  return response.json();
}

export async function unassignTeacherFromCourse(courseId, teacherId) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/courses/${courseId}/teachers/${teacherId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || `Failed to unassign teacher (${response.status})`
    );
  }

  return response.text();
}

export async function createDepartment(departmentData) {
  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:8080/api/departments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(departmentData),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Failed to create department (${response.status})`);
  }

  return response.json();
}

export async function deleteDepartment(departmentId) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `http://localhost:8080/api/departments/${departmentId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Failed to delete department (${response.status})`);
  }

  return response.text();
}


export async function deleteStudent(studentId) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `http://localhost:8080/api/admin/students/${studentId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || `Failed to remove student (${response.status})`
    );
  }

  return response.text();
}
