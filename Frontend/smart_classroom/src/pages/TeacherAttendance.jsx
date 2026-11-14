import { useEffect, useState } from "react";
import { getTeacherCourses } from "../services/teacherService";
import {
  getEnrolledStudents,
  getAttendanceByCourseAndDate,
  markAttendance,
} from "../services/attendanceService";
import "./TeacherAttendance.css";

export default function TeacherAttendance() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [date, setDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId && date) {
      loadAttendanceData();
    }
  }, [selectedCourseId, date]);

  async function loadCourses() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const data = await getTeacherCourses(token);

      setCourses(data);

      if (data.length > 0) {
        setSelectedCourseId(String(data[0].id));
      }
    } catch (err) {
      setError(err.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }

  async function loadAttendanceData() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const [studentData, attendanceData] = await Promise.all([
        getEnrolledStudents(selectedCourseId),
        getAttendanceByCourseAndDate(selectedCourseId, date),
      ]);

      setStudents(studentData);

      const initialAttendance = {};

      studentData.forEach((student) => {
        const existingRecord = attendanceData.find(
          (record) => record.studentId === student.id
        );

        initialAttendance[student.id] = existingRecord
          ? existingRecord.status
          : "PRESENT";
      });

      setAttendance(initialAttendance);
    } catch (err) {
      setError(err.message || "Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  }

  function handleStatusChange(studentId, status) {
    setAttendance((current) => ({
      ...current,
      [studentId]: status,
    }));
  }

  async function handleSaveAttendance() {
    if (!selectedCourseId || !date || students.length === 0) {
      setError("Select a course with enrolled students first.");
      return;
    }

    const alreadyMarked = await getAttendanceByCourseAndDate(
      selectedCourseId,
      date
    ).catch(() => []);

    const existingStudentIds = new Set(
      alreadyMarked.map((record) => record.studentId)
    );

    const studentsToSave = students.filter(
      (student) => !existingStudentIds.has(student.id)
    );

    if (studentsToSave.length === 0) {
      setError("Attendance has already been marked for all students on this date.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const results = await Promise.allSettled(
        studentsToSave.map((student) =>
          markAttendance(selectedCourseId, {
            studentId: student.id,
            date,
            status: attendance[student.id] || "PRESENT",
          })
        )
      );

      const succeeded = results.filter(
        (result) => result.status === "fulfilled"
      ).length;

      await loadAttendanceData();

      if (succeeded === studentsToSave.length) {
        setMessage(`Attendance saved for ${succeeded} student(s).`);
      } else {
        setError(
          `Attendance saved for ${succeeded} of ${studentsToSave.length} students. Check the records and try again for any remaining students.`
        );
      }
    } catch (err) {
      setError(err.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  }

  const presentCount = students.filter(
    (student) => attendance[student.id] === "PRESENT"
  ).length;

  const absentCount = students.filter(
    (student) => attendance[student.id] === "ABSENT"
  ).length;

  return (
    <div className="teacher-attendance">
      <div className="attendance-header">
        <div>
          <h1>Attendance Management</h1>
          <p>Mark and review attendance for your courses.</p>
        </div>
      </div>

      {error && <div className="attendance-alert attendance-error">{error}</div>}
      {message && (
        <div className="attendance-alert attendance-success">{message}</div>
      )}

      <section className="attendance-panel">
        <div className="attendance-filters">
          <label>
            Select Course
            <select
              value={selectedCourseId}
              onChange={(event) =>
                setSelectedCourseId(event.target.value)
              }
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Attendance Date
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              max={new Date().toLocaleDateString("en-CA")}
            />
          </label>

          <button
            type="button"
            onClick={loadAttendanceData}
            disabled={loading || !selectedCourseId}
          >
            Refresh
          </button>
        </div>
      </section>

      <section className="attendance-panel">
        <div className="attendance-summary">
          <div>
            <span>Enrolled Students</span>
            <strong>{students.length}</strong>
          </div>
          <div>
            <span>Present</span>
            <strong>{presentCount}</strong>
          </div>
          <div>
            <span>Absent</span>
            <strong>{absentCount}</strong>
          </div>
        </div>

        <h2>Student Attendance</h2>

        {loading ? (
          <p>Loading attendance...</p>
        ) : students.length === 0 ? (
          <p>No students are enrolled in this course.</p>
        ) : (
          <>
            <div className="attendance-table-wrapper">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Register Number</th>
                    <th>Student Name</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>{student.registerNumber}</td>
                      <td>{student.name}</td>
                      <td>
                        <select
                          value={attendance[student.id] || "PRESENT"}
                          onChange={(event) =>
                            handleStatusChange(
                              student.id,
                              event.target.value
                            )
                          }
                          disabled={Boolean(
                            attendance[student.id + "_saved"]
                          )}
                        >
                          <option value="PRESENT">Present</option>
                          <option value="ABSENT">Absent</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              className="attendance-save-button"
              onClick={handleSaveAttendance}
              disabled={saving || loading}
            >
              {saving ? "Saving Attendance..." : "Save Attendance"}
            </button>
          </>
        )}
      </section>
    </div>
  );
}