
import { useEffect, useState } from "react";
import {
  getStudentAttendance,
  getAttendanceSummary,
} from "../services/attendanceService";
import "./StudentAttendance.css";

function StudentAttendance({ studentId, courseId, courseName }) {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAttendance() {
      setLoading(true);
      setError("");

      try {
        if (!studentId) {
          throw new Error(
            "Student ID is missing. Please log in again."
          );
        }

        const [attendanceData, summaryData] = await Promise.all([
          getStudentAttendance(studentId),
          getAttendanceSummary(studentId, courseId),
        ]);

        if (cancelled) return;

        const courseRecords = (
          Array.isArray(attendanceData) ? attendanceData : []
        ).filter(
          (record) =>
            String(record.courseId) === String(courseId)
        );

        setRecords(courseRecords);
        setSummary(summaryData);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Unable to load attendance."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAttendance();

    return () => {
      cancelled = true;
    };
  }, [studentId, courseId]);

  if (loading) {
    return <p>Loading attendance...</p>;
  }

  if (error) {
    return (
      <p className="attendance-error" role="alert">
        {error}
      </p>
    );
  }

  const presentCount = summary?.presentCount ?? 0;
  const absentCount = summary?.absentCount ?? 0;
  const totalClasses =
    summary?.totalClasses ?? presentCount + absentCount;
  const percentage = summary?.attendancePercentage ?? 0;

  return (
    <section className="student-attendance">
      <div className="attendance-heading">
        <h2>My Attendance</h2>
        <p>
          Attendance records for {courseName || "your course"}.
        </p>
      </div>

      <div className="attendance-stats">
        <article className="attendance-stat-card">
          <span>Total Classes</span>
          <strong>{totalClasses}</strong>
        </article>

        <article className="attendance-stat-card">
          <span>Present</span>
          <strong>{presentCount}</strong>
        </article>

        <article className="attendance-stat-card">
          <span>Absent</span>
          <strong>{absentCount}</strong>
        </article>

        <article className="attendance-stat-card">
          <span>Attendance Percentage</span>
          <strong>{Number(percentage).toFixed(1)}%</strong>
        </article>
      </div>

      <div className="attendance-records">
        <h3>Attendance Records</h3>

        {records.length === 0 ? (
          <p className="attendance-empty">
            No attendance records found for this course.
          </p>
        ) : (
          <div className="attendance-table-wrapper">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Course</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {[...records]
                  .sort((a, b) =>
                    (b.date || "").localeCompare(a.date || "")
                  )
                  .map((record) => (
                    <tr key={record.id}>
                      <td>{record.date || "—"}</td>
                      <td>{record.courseName || courseName}</td>
                      <td>
                        <span
                          className={`attendance-status ${
                            record.status?.toUpperCase() === "PRESENT"
                              ? "present"
                              : "absent"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default StudentAttendance;
