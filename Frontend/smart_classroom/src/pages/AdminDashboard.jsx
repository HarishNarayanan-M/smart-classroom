
import { useEffect, useState } from "react";
import "../App.css";
import {
  getAllTeachers,
  approveTeacher,
  rejectTeacher,
  getAllStudents,
  getAllCourses,
  getAllDepartments,
  assignTeacherToCourse,
  unassignTeacherFromCourse,
  createCourse,
  createDepartment,
  deleteDepartment,
  deleteStudent,
} from "../services/adminService";
function AdminDashboard({ user, onLogout }) {
  const [activeView, setActiveView] = useState("overview");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [assigningTeacher, setAssigningTeacher] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [teacherError, setTeacherError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentError, setStudentError] = useState("");
  const [courses, setCourses] = useState([]);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");
  const [newCourseDepartmentId, setNewCourseDepartmentId] = useState("");
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [createCourseMessage, setCreateCourseMessage] = useState("");
  const [createCourseError, setCreateCourseError] = useState("");
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [courseError, setCourseError] = useState("");
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [departmentError, setDepartmentError] = useState("");
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newDepartmentCode, setNewDepartmentCode] = useState("");
  const [creatingDepartment, setCreatingDepartment] = useState(false);
  const [departmentMessage, setDepartmentMessage] = useState("");
  const [deletingDepartmentId, setDeletingDepartmentId] = useState(null);

  async function loadCourses() {
    setLoadingCourses(true);
    setCourseError("");

    try {
        const data = await getAllCourses();
        setCourses(data);
    } catch (error) {
        setCourseError(error.message || "Unable to load courses.");
    } finally {
        setLoadingCourses(false);
    }
}

async function loadDepartments() {
  setLoadingDepartments(true);
  setDepartmentError("");

  try {
    const data = await getAllDepartments();
    setDepartments(data);
  } catch (error) {
    setDepartmentError(
      error.message || "Unable to load departments."
    );
  } finally {
    setLoadingDepartments(false);
  }
}

  async function loadTeachers() {
    setLoadingTeachers(true);
    setTeacherError("");

    try {
      const data = await getAllTeachers();
      setTeachers(data);
    } catch (error) {
      setTeacherError(error.message || "Unable to load teachers.");
    } finally {
      setLoadingTeachers(false);
    }
  } 
  
  async function loadStudents() {
    setLoadingStudents(true);
    setStudentError("");

    try {
        const data = await getAllStudents();
        setStudents(data);
    } catch (error) {
        setStudentError(error.message || "Unable to load students.");
    } finally {
        setLoadingStudents(false);
    }
   }

   async function handleDeleteStudent(studentId) {
    const confirmed = window.confirm(
      "Are you sure you want to remove this student? This action cannot be undone."
    );

    if (!confirmed) return;

    setLoadingStudents(true);
    setStudentError("");

    try {
      await deleteStudent(studentId);
      await loadStudents();
    } catch (error) {
      setStudentError(
        error.message || "Unable to remove student."
      );
    } finally {
      setLoadingStudents(false);
    }
  }

  
  useEffect(() => {
  if (activeView === "teachers") {
    loadTeachers();
  } else if (activeView === "students") {
    loadStudents();
  } else if (activeView === "courses") {
    loadCourses();
  } else if (activeView === "departments") {
    loadDepartments();
  }
}, [activeView]);


  useEffect(() => {
    async function loadDashboardStats() {
      try {
        const [teacherData, studentData, courseData, departmentData] =
          await Promise.all([
            getAllTeachers(),
            getAllStudents(),
            getAllCourses(),
            getAllDepartments(),
          ]);

        setTeachers(teacherData);
        setStudents(studentData);
        setCourses(courseData);
        setDepartments(departmentData);
      } catch (error) {
        console.error("Failed to load dashboard statistics:", error);
      }
    }

    loadDashboardStats();
  }, []);


  async function handleApprove(teacherId) {
    setActionMessage("");
    setTeacherError("");

    try {
      await approveTeacher(teacherId);
      setActionMessage("Teacher approved successfully.");
      await loadTeachers();
    } catch (error) {
      setTeacherError(error.message || "Unable to approve teacher.");
    }
  }

  async function handleReject(teacherId) {
  const confirmed = window.confirm(
    "Are you sure you want to reject this teacher?"
  );

  if (!confirmed) return;

  setActionMessage("");
  setTeacherError("");

  try {
    await rejectTeacher(teacherId);
    setActionMessage("Teacher rejected successfully.");
    await loadTeachers();
  } catch (error) {
    setTeacherError(error.message || "Unable to reject teacher.");
  }
}

  async function handleAssignTeacher(event) {
  event.preventDefault();

  if (!selectedCourseId || !selectedTeacherId) {
    setActionMessage("Please select both a course and a teacher.");
    return;
  }

  setAssigningTeacher(true);
  setActionMessage("");
  setTeacherError("");

  try {
    const message = await assignTeacherToCourse(
      selectedCourseId,
      selectedTeacherId
    );

    setActionMessage(message || "Teacher assigned successfully.");
    setSelectedCourseId("");
    setSelectedTeacherId("");
  } catch (error) {
    setTeacherError(error.message || "Unable to assign teacher.");
  } finally {
    setAssigningTeacher(false);
  }
}

async function handleUnassignTeacher(courseId, teacherId) {
  const confirmed = window.confirm(
    "Are you sure you want to unassign this teacher from this course?"
  );

  if (!confirmed) return;

  setActionMessage("");
  setTeacherError("");

  try {
    await unassignTeacherFromCourse(courseId, teacherId);

    setActionMessage("Teacher unassigned successfully.");

    await loadCourses();
  } catch (error) {
    setTeacherError(
      error.message || "Unable to unassign teacher."
    );
  }
}

async function handleCreateCourse(event) {
  event.preventDefault();

  setCreatingCourse(true);
  setCreateCourseMessage("");
  setCreateCourseError("");

  try {
    const courseData = {
      name: newCourseName.trim(),
      code: newCourseCode.trim(),
      departmentId: Number(newCourseDepartmentId),
    };

    await createCourse(courseData);

    setCreateCourseMessage("Course created successfully!");
    setNewCourseName("");
    setNewCourseCode("");
    setNewCourseDepartmentId("");

    await loadCourses();
  } catch (error) {
    setCreateCourseError(
      error.message || "Unable to create course."
    );
  } finally {
    setCreatingCourse(false);
  }
}

async function handleCreateDepartment(event) {
  event.preventDefault();

  setCreatingDepartment(true);
  setDepartmentError("");
  setDepartmentMessage("");

  try {
    await createDepartment({
      name: newDepartmentName.trim(),
      code: newDepartmentCode.trim(),
    });

    setDepartmentMessage("Department created successfully!");
    setNewDepartmentName("");
    setNewDepartmentCode("");

    await loadDepartments();
  } catch (error) {
    setDepartmentError(
      error.message || "Unable to create department."
    );
  } finally {
    setCreatingDepartment(false);
  }
}

async function handleDeleteDepartment(departmentId) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this department?"
  );

  if (!confirmed) return;

  setDeletingDepartmentId(departmentId);
  setDepartmentError("");
  setDepartmentMessage("");

  try {
    await deleteDepartment(departmentId);

    setDepartmentMessage("Department deleted successfully!");

    await loadDepartments();
  } catch (error) {
    setDepartmentError(
      error.message || "Unable to delete department."
    );
  } finally {
    setDeletingDepartmentId(null);
  }
}

  const pageTitles = {
    overview: "Admin Dashboard",
    teachers: "Manage Teachers",
    students: "Manage Students",
    courses: "Manage Courses",
    departments: "Departments",
    assignTeacher: "Assign Teacher",
};

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="brand-icon">SC</div>
          <div>
            <h2>Smart Classroom</h2>
            <p>Administration</p>
          </div>
        </div>

        <nav className="admin-nav">
          {[
            ["overview", "Dashboard"],
            ["teachers", "Manage Teachers"],
            ["students", "Manage Students"],
            ["courses", "Manage Courses"],
            ["assignTeacher", "Assign Teacher"],
            ["departments", "Departments"],
          ].map(([view, label]) => (
            <button
              key={view}
              className={activeView === view ? "active" : ""}
              onClick={() => setActiveView(view)}
            >
              {label}
            </button>
          ))}
        </nav>

        <button className="admin-logout" onClick={onLogout}>
          Logout
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>{pageTitles[activeView]}</h1>
            <p>Welcome back, {user.name}</p>
          </div>
          <span className="admin-role">ADMIN</span>
        </header>

        {activeView === "overview" && (
          <section className="admin-overview">
            <div className="admin-welcome-card">
              <h2>Welcome to Smart Classroom</h2>
              <p>
                Manage teachers, students, courses, and departments
                from one place.
              </p>
            </div>

            <div className="admin-summary-grid">
              <article className="admin-summary-card">
                <span>Teachers</span>
                <h2>{teachers.length}</h2>
                <p>Review teacher accounts</p>
              </article>
              <article className="admin-summary-card">
                <span>Students</span>
                <h2>{students.length}</h2>
                <p>View student accounts</p>
              </article>
              <article className="admin-summary-card">
                <span>Courses</span>
                <h2>{courses.length}</h2>
                <p>Organize course offerings</p>
              </article>
              <article className="admin-summary-card">
                <span>Departments</span>
                <h2>{departments.length}</h2>
                <p>Maintain departments</p>
              </article>
            </div>
          </section>
        )}

        {activeView === "teachers" && (
          <section className="admin-teachers">
            <div className="admin-section-heading">
              <div>
                <h2>Teacher Accounts</h2>
                <p>Review registered teachers and approve pending accounts.</p>
              </div>
              <button onClick={loadTeachers} disabled={loadingTeachers}>
                {loadingTeachers ? "Loading..." : "Refresh"}
              </button>
            </div>

            {teacherError && (
              <p className="admin-error" role="alert">{teacherError}</p>
            )}

            {actionMessage && (
              <p className="admin-success" role="status">{actionMessage}</p>
            )}

            {loadingTeachers ? (
              <p>Loading teachers...</p>
            ) : teachers.length === 0 && !teacherError ? (
              <p>No teacher accounts found.</p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Employee ID</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((teacher) => (
                      <tr key={teacher.id}>
                        <td>{teacher.id}</td>
                        <td>{teacher.name}</td>
                        <td>{teacher.email}</td>
                        <td>{teacher.employeeId}</td>
                        <td>{teacher.departmentName}</td>
                        <td>
                          <span
                            className={`admin-status ${
                              teacher.status === "ACTIVE"
                                ? "active"
                                : "pending"
                            }`}
                          >
                            {teacher.status}
                          </span>
                        </td>
                        <td>
                          {teacher.status === "PENDING" ? (
                            <div className="admin-teacher-actions">
                              <button onClick={() => handleApprove(teacher.id)}>
                                Approve
                              </button>

                              <button
                                type="button"
                                onClick={() => handleReject(teacher.id)}
                              >
                                Reject
                              </button>
                            </div>
                          ) : teacher.status === "ACTIVE" ? (
                            <span>Approved</span>
                          ) : (
                            <span>Rejected</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        
    {activeView === "students" && (
    <section className="admin-teachers">
        <div className="admin-section-heading">
        <div>
            <h2>Student Accounts</h2>
            <p>View registered students and their academic details.</p>
        </div>

        <button onClick={loadStudents} disabled={loadingStudents}>
            {loadingStudents ? "Loading..." : "Refresh"}
        </button>
        </div>

        {studentError && (
        <p className="admin-error" role="alert">
            {studentError}
        </p>
        )}

        {loadingStudents ? (
        <p>Loading students...</p>
        ) : students.length === 0 && !studentError ? (
        <p>No student accounts found.</p>
        ) : (
        <div className="admin-table-wrapper">
            <table className="admin-table">
            <thead>
                <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Register Number</th>
                <th>Department</th>
                <th>Year</th>
                <th>Section</th>
                <th>Status</th>
                <th>Action</th>
                </tr>
            </thead>

            <tbody>
                {students.map((student) => (
                <tr key={student.id}>
                    <td>{student.id}</td>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.registerNumber}</td>
                    <td>{student.departmentName}</td>
                    <td>{student.year}</td>
                    <td>{student.section}</td>
                    <td>
                    <span
                        className={`admin-status ${
                        student.status === "ACTIVE" ? "active" : "pending"
                        }`}
                    >
                        {student.status}
                    </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        Remove
                      </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        )}
    </section>
    )}

    
    {activeView === "courses" && (
    <section className="admin-teachers">
        <div className="admin-section-heading">
        <div>
            <h2>Course Management</h2>
            <p>View courses and their associated departments.</p>
        </div>

        <button onClick={loadCourses} disabled={loadingCourses}>
            {loadingCourses ? "Loading..." : "Refresh"}
        </button>
        </div>

        
<form onSubmit={handleCreateCourse} className="admin-assignment-form">
  <h3>Create New Course</h3>

  {createCourseMessage && (
    <p className="admin-success" role="status">
      {createCourseMessage}
    </p>
  )}

  {createCourseError && (
    <p className="admin-error" role="alert">
      {createCourseError}
    </p>
  )}

  <div>
    <label htmlFor="newCourseName">Course Name</label>
    <input
      id="newCourseName"
      type="text"
      value={newCourseName}
      onChange={(event) => setNewCourseName(event.target.value)}
      placeholder="e.g. Operating Systems"
      required
    />
  </div>

  <div>
    <label htmlFor="newCourseCode">Course Code</label>
    <input
      id="newCourseCode"
      type="text"
      value={newCourseCode}
      onChange={(event) => setNewCourseCode(event.target.value)}
      placeholder="e.g. CS202"
      required
    />
  </div>

  <div>
    <label htmlFor="newCourseDepartment">Department</label>
    <select
      id="newCourseDepartment"
      value={newCourseDepartmentId}
      onChange={(event) =>
        setNewCourseDepartmentId(event.target.value)
      }
      required
    >
      <option value="">Select a department</option>
      {departments.map((department) => (
        <option key={department.id} value={department.id}>
          {department.name} ({department.code})
        </option>
      ))}
    </select>
  </div>

  <button type="submit" disabled={creatingCourse}>
    {creatingCourse ? "Creating..." : "Create Course"}
  </button>
</form>


        {courseError && (
        <p className="admin-error" role="alert">{courseError}</p>
        )}

        {loadingCourses ? (
        <p>Loading courses...</p>
        ) : courses.length === 0 && !courseError ? (
        <p>No courses found.</p>
        ) : (
        <div className="admin-table-wrapper">
            <table className="admin-table">
            <thead>
                <tr>
                <th>ID</th>
                <th>Course Name</th>
                <th>Course Code</th>
                <th>Department</th>
                <th>Assigned Teacher</th>
                <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {courses.map((course) => (
                <tr key={course.id}>
                    <td>{course.id}</td>
                    <td>{course.name}</td>
                    <td>{course.code}</td>
                    <td>{course.departmentName}</td>
                    <td>{course.teacherName || "Not assigned"}</td>
                    <td>
                      {course.teacherId ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleUnassignTeacher(course.id, course.teacherId)
                          }
                        >
                          Unassign
                        </button>
                      ) : (
                        <span>—</span>
                      )}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        )}
    </section>
    )}


    {activeView === "departments" && (
    <section className="admin-teachers">
        <div className="admin-section-heading">
        <div>
            <h2>Department Management</h2>
            <p>View the departments registered in Smart Classroom.</p>
        </div>

        <button
            onClick={loadDepartments}
            disabled={loadingDepartments}
        >
            {loadingDepartments ? "Loading..." : "Refresh"}
        </button>
        </div>

        
        <form onSubmit={handleCreateDepartment} className="admin-assignment-form">
          <h3>Add New Department</h3>

          {departmentMessage && (
            <p className="admin-success" role="status">
              {departmentMessage}
            </p>
          )}

          {departmentError && (
            <p className="admin-error" role="alert">
              {departmentError}
            </p>
          )}

          <div>
            <label htmlFor="newDepartmentName">Department Name</label>
            <input
              id="newDepartmentName"
              type="text"
              value={newDepartmentName}
              onChange={(event) => setNewDepartmentName(event.target.value)}
              placeholder="e.g. Information Technology"
              required
            />
          </div>

          <div>
            <label htmlFor="newDepartmentCode">Department Code</label>
            <input
              id="newDepartmentCode"
              type="text"
              value={newDepartmentCode}
              onChange={(event) => setNewDepartmentCode(event.target.value)}
              placeholder="e.g. IT"
              required
            />
          </div>

          <button type="submit" disabled={creatingDepartment}>
            {creatingDepartment ? "Creating..." : "Add Department"}
          </button>
        </form>


        {departmentError && (
        <p className="admin-error" role="alert">
            {departmentError}
        </p>
        )}

        {loadingDepartments ? (
        <p>Loading departments...</p>
        ) : departments.length === 0 && !departmentError ? (
        <p>No departments found.</p>
        ) : (
        <div className="admin-table-wrapper">
            <table className="admin-table">
            <thead>
                <tr>
                <th>ID</th>
                <th>Department Name</th>
                <th>Department Code</th>
                <th>Action</th>
                </tr>
            </thead>

            <tbody>
                {departments.map((department) => (
                <tr key={department.id}>
                  <td>{department.id}</td>
                  <td>{department.name}</td>
                  <td>{department.code}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleDeleteDepartment(department.id)}
                      disabled={deletingDepartmentId === department.id}
                    >
                      {deletingDepartmentId === department.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        )}
    </section>
    )}

    {activeView === "assignTeacher" && (
  <section className="admin-teachers">
    <div className="admin-section-heading">
      <div>
        <h2>Assign Teacher to Course</h2>
        <p>Select a course and an active teacher to create an assignment.</p>
      </div>
    </div>

    {teacherError && (
      <p className="admin-error" role="alert">
        {teacherError}
      </p>
    )}

    {actionMessage && (
      <p className="admin-success" role="status">
        {actionMessage}
      </p>
    )}

    <form onSubmit={handleAssignTeacher} className="admin-assignment-form">
      <div>
        <label htmlFor="courseSelect">Course</label>
        <select
          id="courseSelect"
          value={selectedCourseId}
          onChange={(event) => setSelectedCourseId(event.target.value)}
          required
        >
          <option value="">Select a course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name} ({course.code})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="teacherSelect">Teacher</label>
        <select
          id="teacherSelect"
          value={selectedTeacherId}
          onChange={(event) => setSelectedTeacherId(event.target.value)}
          required
        >
          <option value="">Select a teacher</option>
          {teachers
            .filter((teacher) => teacher.status === "ACTIVE")
            .map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name} ({teacher.employeeId})
              </option>
            ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={assigningTeacher || courses.length === 0}
      >
        {assigningTeacher ? "Assigning..." : "Assign Teacher"}
      </button>
    </form>
  </section>
)}
      </main>
    </div>
  );
}

export default AdminDashboard;