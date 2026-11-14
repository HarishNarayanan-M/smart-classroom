import { useEffect, useMemo, useState } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { getTeacherCourses } from "../services/teacherService";
import TeacherLectures from "./TeacherLectures";
import "./TeacherDashboard.css";
import "./TeacherCourseWorkspace.css";
import TeacherStudyMaterials from "./TeacherStudyMaterials";
import TeacherAssignments from "./TeacherAssignments";
import TeacherQuizzes from "./TeacherQuizzes";
import TeacherAttendance from "./TeacherAttendance";

const navigation = [
  { id: "overview", icon: "▦", label: "Overview" },
  { id: "courses", icon: "▤", label: "My Courses" },
  { id: "lectures", icon: "▷", label: "Lectures" },
  { id: "liveClasses", icon: "◉", label: "Live Classes" },
  { id: "materials", icon: "▧", label: "Study Materials" },
  { id: "assignments", icon: "☷", label: "Assignments" },
  { id: "quizzes", icon: "✓", label: "Quizzes" },
  { id: "attendance", icon: "◷", label: "Attendance" },
  // { id: "performance", icon: "↗", label: "Performance" },
  // { id: "announcements", icon: "♧", label: "Announcements" },
];

const API_URL = "http://localhost:8080/api";

function getToken(user) {
  return user?.token || localStorage.getItem("token") || localStorage.getItem("jwtToken") || "";
}

async function getJson(path, token) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed (${response.status})`);
  }
  return response.status === 204 ? null : response.json();
}

function asArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function formatDueDate(value) {
  if (!value) return "No due date";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function TeacherDashboard({ user, onLogout }) {
  const [activeView, setActiveView] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [showNotifications, setShowNotifications] = useState(false);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({ students: null, assignments: null, lectures: null, quizzes: null });
  const [dashboardAssignments, setDashboardAssignments] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");
  const [liveClasses, setLiveClasses] = useState([]);
  const [liveClassesLoading, setLiveClassesLoading] = useState(false);
  const [liveClassesError, setLiveClassesError] = useState("");
  const [scheduleForm, setScheduleForm] = useState({
    courseId: "",
    title: "",
    description: "",
    startTime: "",
    endTime: "",
  });
  const [scheduling, setScheduling] = useState(false);
  const [scheduleMessage, setScheduleMessage] = useState("");
  const [scheduleError, setScheduleError] = useState("");
  const [selectedLiveClass, setSelectedLiveClass] = useState(null);

useEffect(() => {
  let cancelled = false;

  async function loadCourses() {
    setCoursesLoading(true);
    setCoursesError("");

    try {
      const token = getToken(user);

      if (!token) {
        throw new Error("Your login session was not found. Please log in again.");
      }

      const data = await getTeacherCourses(token);

      if (!cancelled) {
        const colors = ["violet", "blue", "orange", "green"];

        setCourses(
          data.map((course, index) => ({
            ...course,
            department: course.departmentName || "Department not specified",
            students: null,
            progress: null,
            color: colors[index % colors.length],
            icon: course.name?.charAt(0).toUpperCase() || "C",
          }))
        );
      }
    } catch (error) {
      if (!cancelled) {
        setCoursesError(error.message || "Unable to load your courses.");
      }
    } finally {
      if (!cancelled) {
        setCoursesLoading(false);
      }
    }
  }

  loadCourses();

  return () => {
    cancelled = true;
  };
}, [user?.token]);

  // Load real dashboard totals from the existing backend APIs.
  useEffect(() => {
    let cancelled = false;

    async function loadDashboardStats() {
      if (coursesLoading) return;
      if (courses.length === 0) {
        setDashboardStats({ students: 0, assignments: 0, lectures: 0, quizzes: 0 });
        setDashboardAssignments([]);
        setStatsError("");
        return;
      }

      const token = getToken(user);
      if (!token) return;
      setStatsLoading(true);
      setStatsError("");

      try {
        const courseResults = await Promise.all(courses.map(async (course) => {
          const paths = [
            `/enrollments/course/${course.id}/students`,
            `/courses/${course.id}/assignments`,
            `/courses/${course.id}/lectures`,
            `/courses/${course.id}/quizzes`,
          ];
          const results = await Promise.allSettled(paths.map((path) => getJson(path, token)));
          return { course, results };
        }));

        if (cancelled) return;
        const studentIds = new Set();
        let studentsAvailable = true;
        let assignmentsAvailable = true;
        let lecturesAvailable = true;
        let quizzesAvailable = true;
        let assignmentCount = 0;
        let lectureCount = 0;
        let quizCount = 0;
        const assignmentRows = [];

        courseResults.forEach(({ course, results }) => {
          const [studentsResult, assignmentsResult, lecturesResult, quizzesResult] = results;
          if (studentsResult.status === "fulfilled") {
            asArray(studentsResult.value).forEach((student) => {
              if (student?.id != null) studentIds.add(student.id);
            });
          } else studentsAvailable = false;

          if (assignmentsResult.status === "fulfilled") {
            const list = asArray(assignmentsResult.value);
            assignmentCount += list.length;
            list.forEach((assignment) => assignmentRows.push({
              ...assignment,
              courseId: course.id,
              courseName: assignment.courseName || course.name,
            }));
          } else assignmentsAvailable = false;

          if (lecturesResult.status === "fulfilled") lectureCount += asArray(lecturesResult.value).length;
          else lecturesAvailable = false;

          if (quizzesResult.status === "fulfilled") quizCount += asArray(quizzesResult.value).length;
          else quizzesAvailable = false;
        });

        setDashboardStats({
          students: studentsAvailable ? studentIds.size : null,
          assignments: assignmentsAvailable ? assignmentCount : null,
          lectures: lecturesAvailable ? lectureCount : null,
          quizzes: quizzesAvailable ? quizCount : null,
        });
        setDashboardAssignments(assignmentRows);
        if (!studentsAvailable || !assignmentsAvailable || !lecturesAvailable || !quizzesAvailable) {
          setStatsError("Some totals could not be loaded. A dash (—) means that API request failed; verify the endpoint and permissions.");
        }
      } catch (error) {
        if (!cancelled) setStatsError(error.message || "Unable to load dashboard statistics.");
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    }

    loadDashboardStats();
    return () => { cancelled = true; };
  }, [courses, coursesLoading, user?.token]);

  useEffect(() => {
    let cancelled = false;

    async function loadLiveClasses() {
      if (activeView !== "liveClasses") return;
      if (coursesLoading || courses.length === 0) {
        setLiveClasses([]);
        setLiveClassesLoading(false);
        return;
      }

      setLiveClassesLoading(true);
      setLiveClassesError("");

      try {
        const token = getToken(user);
        const results = await Promise.all(
          courses.map((course) => getJson(`/live-classes/course/${course.id}`, token))
        );

        if (!cancelled) {
          setLiveClasses(
            results.flatMap((result) => asArray(result))
              .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
          );
        }
      } catch (error) {
        if (!cancelled) {
          setLiveClassesError(error.message || "Unable to load scheduled classes.");
        }
      } finally {
        if (!cancelled) setLiveClassesLoading(false);
      }
    }

    loadLiveClasses();
    return () => { cancelled = true; };
  }, [activeView, courses, coursesLoading, user?.token]);

  function updateScheduleForm(event) {
    const { name, value } = event.target;
    setScheduleForm((current) => ({ ...current, [name]: value }));
  }

  async function handleScheduleClass(event) {
    event.preventDefault();
    setScheduleMessage("");
    setScheduleError("");

    if (!scheduleForm.courseId || !scheduleForm.title.trim()
        || !scheduleForm.startTime || !scheduleForm.endTime) {
      setScheduleError("Please select a course, enter a title, and choose start and end times.");
      return;
    }

    if (new Date(scheduleForm.endTime) <= new Date(scheduleForm.startTime)) {
      setScheduleError("End time must be after start time.");
      return;
    }

    setScheduling(true);
    try {
      const token = getToken(user);
      const response = await fetch(`${API_URL}/live-classes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: Number(scheduleForm.courseId),
          title: scheduleForm.title.trim(),
          description: scheduleForm.description.trim(),
          startTime: `${scheduleForm.startTime}:00`,
          endTime: `${scheduleForm.endTime}:00`,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Unable to schedule class (HTTP ${response.status}).`);
      }

      const createdClass = await response.json();
      setScheduleMessage(`Live class "${createdClass.title}" scheduled successfully.`);
      setScheduleForm((current) => ({
        ...current,
        title: "",
        description: "",
        startTime: "",
        endTime: "",
      }));
      setLiveClasses((current) =>
        [...current, createdClass].sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      );
    } catch (error) {
      setScheduleError(error.message || "Unable to schedule live class.");
    } finally {
      setScheduling(false);
    }
  }

  const statValue = (value) => {
    if (coursesLoading || statsLoading) return "...";
    if (value === null || value === undefined) return "—";
    return String(value).padStart(2, "0");
  };

  const teacherName = user?.name || "Teacher";
  const initials = teacherName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  const pageTitles = {
    overview: "Dashboard Overview",
    courses: "My Courses",
    courseWorkspace: selectedCourse ? `${selectedCourse.name} Workspace` : "Course Workspace",
    lectures: "Lecture Management",
    liveClasses: "Live Classes",
    materials: "Study Materials",
    assignments: "Assignments",
    quizzes: "Quizzes & Assessments",
    attendance: "Attendance Management",
    performance: "Student Performance",
    announcements: "Announcements",
  };

  const filteredCourses = useMemo(() => {
  const query = searchTerm.trim().toLowerCase();

  return courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(query) ||
      course.code.toLowerCase().includes(query);

    const matchesFilter =
      courseFilter === "all" || course.code === courseFilter;

    return matchesSearch && matchesFilter;
  });
}, [courses, searchTerm, courseFilter]);

  function openView(view) {
    setActiveView(view);
    setSearchTerm("");
    setShowNotifications(false);
  }

  function ComingSoon({ title, description }) {
    return (
      <section className="td-panel td-coming-soon">
        <div className="td-coming-icon">✦</div>
        <span className="td-eyebrow">TEACHER WORKSPACE</span>
        <h2>{title}</h2>
        <p>{description}</p>
        <div className="td-integration-note">
          <span>◉</span>
          This section's API integration will be added in the next phase.
        </div>
      </section>
    );
  }

  function CourseCard({ course }) {
    return (
      <article className="td-course-card" key={course.id}>
        <div className="td-course-card-top">
          <div className={`td-course-icon ${course.color}`}>
            {course.icon}
          </div>
          <span className="td-course-code">{course.code}</span>
          <button
            type="button"
            className="td-more-button"
            aria-label={`More options for ${course.name}`}
            disabled
            title="Course actions will be connected later"
          >
            ···
          </button>
        </div>

        <h3>{course.name}</h3>
        <p className="td-course-department">{course.department}</p>

       <div className="td-course-stats">
        <span>Course ID: {course.id}</span>
        <span>{course.code}</span>
        </div>

        <button
          type="button"
          className="td-outline-button td-course-open"
          onClick={() => {
            setSelectedCourse(course);
            openView("courseWorkspace");
          }}
        >
          View course workspace <span>→</span>
        </button>
      </article>
    );
  }

  return (
    <div className="teacher-layout">
      <aside className="td-sidebar">
        <div className="td-brand">
          <div className="td-brand-mark">SC</div>
          <div>
            <h2>Smart Classroom</h2>
            <p>TEACHER PORTAL</p>
          </div>
        </div>

        <div className="td-sidebar-label">WORKSPACE</div>

        <nav className="td-navigation" aria-label="Teacher navigation">
          {navigation.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`td-nav-item ${
                activeView === item.id ||
                (item.id === "courses" && activeView === "courseWorkspace")
                  ? "active"
                  : ""
              }`}
              onClick={() => openView(item.id)}
            >
              <span className="td-nav-icon">{item.icon}</span>
              <span className="td-nav-label">{item.label}</span>
              {item.badge && (
                <span className="td-nav-badge">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="td-sidebar-bottom">
          <div className="td-help-card">
            <div className="td-help-icon">?</div>
            <h3>Need some help?</h3>
            <p>Your teaching workspace, all in one place.</p>
          </div>

          <div className="td-sidebar-user">
            <div className="td-avatar">{initials || "T"}</div>
            <div className="td-sidebar-user-info">
              <strong>{teacherName}</strong>
              <span>Teacher</span>
            </div>
            <button
              type="button"
              className="td-logout-button"
              onClick={onLogout}
              title="Log out"
              aria-label="Log out"
            >
              ↗
            </button>
          </div>
        </div>
      </aside>

      <main className="td-main">
        <header className="td-header">
          <div className="td-header-title">
            <span className="td-breadcrumb">Teacher Portal /</span>
            <h1>{pageTitles[activeView]}</h1>
          </div>

          <div className="td-header-actions">
            <label className="td-search">
              <span>⌕</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search courses..."
                aria-label="Search courses"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </label>

            <div className="td-notification-wrap">
              <button
                type="button"
                className="td-icon-button"
                onClick={() => setShowNotifications((current) => !current)}
                aria-label="Toggle notifications"
                aria-expanded={showNotifications}
              >
                ♧
                <span className="td-notification-dot" />
              </button>

              {showNotifications && (
                <div className="td-notification-popover">
                  <strong>Notifications</strong>
                  <p>You have 3 assignments awaiting review.</p>
                  <p>Your course workspace is ready to set up.</p>
                </div>
              )}
            </div>

            <div className="td-header-profile">
              <div className="td-avatar">{initials || "T"}</div>
              <div>
                <strong>{teacherName}</strong>
                <span>Faculty</span>
              </div>
            </div>
          </div>
        </header>

        <div className="td-content">
          {activeView === "overview" && (
            <>
              <section className="td-welcome-banner">
                <div className="td-welcome-copy">
                  <span className="td-welcome-tag">YOUR TEACHING SPACE</span>
                  <h2>Welcome back, {teacherName.split(" ")[0]}! 👋</h2>
                  <p>
                    Here&apos;s your classroom at a glance. Keep your courses
                    organized and your students moving forward.
                  </p>
                  <button
                    type="button"
                    className="td-primary-button"
                    onClick={() => openView("courses")}
                  >
                    Explore my courses <span>→</span>
                  </button>
                </div>
                <div className="td-welcome-art" aria-hidden="true">
                  <div className="td-art-circle circle-one" />
                  <div className="td-art-circle circle-two" />
                  <div className="td-art-board">
                    <div className="td-art-board-top">
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className="td-art-lines">
                      <i />
                      <i />
                      <i />
                    </div>
                    <div className="td-art-book">▤</div>
                    <div className="td-art-check">✓</div>
                  </div>
                  <div className="td-art-sparkle">✦</div>
                </div>
              </section>

              <div className="td-section-heading">
                <div>
                  <h2>Your teaching overview</h2>
                  <p>Live totals from your assigned courses.</p>
                </div>
                <span className="td-demo-label">{statsLoading ? "UPDATING..." : "LIVE DATA"}</span>
              </div>

              <section className="td-stat-grid">
                <article className="td-stat-card">
                  <div className="td-stat-top">
                    <span className="td-stat-icon blue">▤</span>
                    <span className="td-stat-trend">This term</span>
                  </div>
                  <p>Assigned courses</p>
                  <div className="td-stat-value">
                    {coursesLoading ? "..." : coursesError ? "—" : String(courses.length).padStart(2, "0")}
                  </div>
                  <span className="td-stat-foot">Courses in your workspace</span>
                </article>

                <article className="td-stat-card">
                  <div className="td-stat-top">
                    <span className="td-stat-icon violet">♙</span>
                    <span className="td-stat-trend">Across courses</span>
                  </div>
                  <p>Total students</p>
                  <div className="td-stat-value">{statValue(dashboardStats.students)}</div>
                  <span className="td-stat-foot">Students across your classes</span>
                </article>

                <article className="td-stat-card">
                  <div className="td-stat-top">
                    <span className="td-stat-icon orange">☷</span>
                    <span className="td-stat-attention">Needs attention</span>
                  </div>
                  <p>Total assignments</p>
                  <div className="td-stat-value">{statValue(dashboardStats.assignments)}</div>
                  <span className="td-stat-foot">Assignments across your courses</span>
                </article>

                <article className="td-stat-card">
                  <div className="td-stat-top">
                    <span className="td-stat-icon green">▣</span>
                    <span className="td-stat-trend">This term</span>
                  </div>
                  <p>Lectures published</p>
                  <div className="td-stat-value">{statValue(dashboardStats.lectures)}</div>
                  <span className="td-stat-foot">Lecture records across your courses</span>
                </article>
              </section>

              <section className="td-main-grid">
                <div className="td-panel td-courses-panel">
                  <div className="td-panel-heading">
                    <div>
                      <h2>My courses</h2>
                      <p>Continue managing your assigned courses.</p>
                    </div>
                    <button
                      type="button"
                      className="td-text-button"
                      onClick={() => openView("courses")}
                    >
                      View all <span>→</span>
                    </button>
                  </div>

                  
                <div className="td-course-list">
                {coursesLoading ? (
                    <p className="td-empty-state">Loading your courses...</p>
                ) : coursesError ? (
                    <p className="td-error-message">{coursesError}</p>
                ) : (
                    <>
                    {filteredCourses.slice(0, 3).map((course) => (
                        <CourseCard key={course.id} course={course} />
                    ))}

                    {filteredCourses.length === 0 && (
                        <p className="td-empty-state">
                        No courses have been assigned to you yet.
                        </p>
                    )}
                    </>
                )}
                </div>

                </div>

                <div className="td-panel td-activity-panel">
                  <div className="td-panel-heading">
                    <div>
                      <h2>Recent activity</h2>
                      <p>Latest classroom updates.</p>
                    </div>
                    <span className="td-live-dot">Preview</span>
                  </div>

                  <div className="td-activity-list">
                    <div className="td-activity-item">
                      <div className="td-activity-icon blue">☷</div>
                      <div className="td-activity-copy">
                        <strong>{statValue(dashboardStats.assignments)} assignments</strong>
                        <p>Created across your assigned courses</p>
                      </div>
                    </div>
                    <div className="td-activity-item">
                      <div className="td-activity-icon violet">✓</div>
                      <div className="td-activity-copy">
                        <strong>{statValue(dashboardStats.quizzes)} quizzes</strong>
                        <p>Available in your courses</p>
                      </div>
                    </div>
                    <div className="td-activity-item">
                      <div className="td-activity-icon green">▷</div>
                      <div className="td-activity-copy">
                        <strong>{statValue(dashboardStats.lectures)} lectures</strong>
                        <p>Lecture records across assigned courses</p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="td-outline-button td-full-button"
                    onClick={() => openView("announcements")}
                  >
                    Open announcements
                  </button>
                </div>
              </section>

              <section className="td-panel td-tasks-panel">
                <div className="td-panel-heading">
                  <div>
                    <h2>Assignment overview</h2>
                    <p>Track submission progress and upcoming deadlines.</p>
                  </div>
                  <button
                    type="button"
                    className="td-text-button"
                    onClick={() => openView("assignments")}
                  >
                    Manage assignments <span>→</span>
                  </button>
                </div>

                <div className="td-table-wrap">
                  <table className="td-table">
                    <thead>
                      <tr>
                        <th>Assignment</th>
                        <th>Course</th>
                        <th>Due date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(coursesLoading || statsLoading) && (
                        <tr><td colSpan="4">Loading assignments...</td></tr>
                      )}
                      {!coursesLoading && !statsLoading && dashboardAssignments.length === 0 && (
                        <tr><td colSpan="4">{statsError ? "Assignment data could not be loaded. Check the API endpoint." : "No assignments found for your assigned courses."}</td></tr>
                      )}
                      {!coursesLoading && !statsLoading && dashboardAssignments.slice(0, 5).map((task) => (
                        <tr key={task.id}>
                          <td>
                            <strong>{task.title || "Untitled assignment"}</strong>
                          </td>
                          <td>{task.courseName}</td>
                          <td>{formatDueDate(task.dueDate || task.deadline)}</td>
                          <td>
                            <span className={`td-status ${(task.dueDate || task.deadline) && new Date(task.dueDate || task.deadline) < new Date() ? "warning" : "progress"}`}>
                              {(task.dueDate || task.deadline) && new Date(task.dueDate || task.deadline) < new Date() ? "Past due" : "Assigned"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {activeView === "courses" && (
            <>
              <div className="td-page-intro">
                <div>
                  <h2>Manage your courses</h2>
                  <p>
                    Browse the courses assigned to you and open their teaching
                    workspace.
                  </p>
                </div>
                <button
                  type="button"
                  className="td-primary-button"
                  disabled
                  title="Course creation and assignment are managed by the admin"
                >
                  + Create course
                </button>
              </div>

              <div className="td-filter-row">
                <label>
                  Filter by course
                  <select
                    value={courseFilter}
                    onChange={(event) => setCourseFilter(event.target.value)}
                  >
                    <option value="all">All courses</option>
                    {courses.map((course) => (
                    <option key={course.id} value={course.code}>
                        {course.code}
                    </option>
                    ))}
                  </select>
                </label>
                <span>{filteredCourses.length} courses shown</span>
              </div>

              
            {coursesLoading ? (
            <p className="td-empty-state">Loading your courses...</p>
            ) : coursesError ? (
            <div className="td-panel">
                <p className="td-error-message">{coursesError}</p>
                <button
                type="button"
                className="td-primary-button"
                onClick={() => window.location.reload()}
                >
                Retry
                </button>
            </div>
            ) : (
            <div className="td-course-grid">
                {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
                ))}

                {filteredCourses.length === 0 && (
                <p className="td-empty-state">
                    {courses.length === 0
                    ? "No courses have been assigned to you yet."
                    : "No courses match the selected filters."}
                </p>
                )}
            </div>
            )}

            </>
          )}

            {activeView === "courseWorkspace" && (
              <section className="td-course-workspace">
                <div className="td-page-intro">
                  <div>
                    <span className="td-eyebrow">SELECTED COURSE</span>
                    <h2>{selectedCourse?.name || "Course workspace"}</h2>
                    <p>
                      {selectedCourse
                        ? `${selectedCourse.code} · ${selectedCourse.department}`
                        : "Choose a course from My Courses to open its workspace."}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="td-outline-button"
                    onClick={() => openView("courses")}
                  >
                    ← Back to My Courses
                  </button>
                </div>

                {selectedCourse ? (
                  <>
                    <p className="td-workspace-hint">
                      Choose what you want to manage for this course.
                    </p>
                    <div className="td-course-grid td-course-tools-grid">
                      <button
                        type="button"
                        className="td-panel td-course-tool"
                        onClick={() => openView("materials")}
                      >
                        <span className="td-course-tool-icon">▧</span>
                        <h3>Study Materials</h3>
                        <p>Upload and manage PDFs, presentations, and notes.</p>
                        <span className="td-course-tool-link">Open materials →</span>
                      </button>
                      <button
                        type="button"
                        className="td-panel td-course-tool"
                        onClick={() => openView("liveClasses")}
                      >
                        <span className="td-course-tool-icon">◉</span>
                        <h3>Live Classes</h3>
                        <p>Schedule online sessions and join your course meetings.</p>
                        <span className="td-course-tool-link">Open live classes →</span>
                      </button>
                      <button
                        type="button"
                        className="td-panel td-course-tool"
                        onClick={() => openView("assignments")}
                      >
                        <span className="td-course-tool-icon">☷</span>
                        <h3>Assignments</h3>
                        <p>Create assignments and manage deadlines.</p>
                        <span className="td-course-tool-link">Open assignments →</span>
                      </button>
                      <button
                        type="button"
                        className="td-panel td-course-tool"
                        onClick={() => openView("quizzes")}
                      >
                        <span className="td-course-tool-icon">✓</span>
                        <h3>Quizzes</h3>
                        <p>Create quizzes and manage their questions.</p>
                        <span className="td-course-tool-link">Open quizzes →</span>
                      </button>
                      <button
                        type="button"
                        className="td-panel td-course-tool"
                        onClick={() => openView("attendance")}
                      >
                        <span className="td-course-tool-icon">◷</span>
                        <h3>Attendance</h3>
                        <p>Record and review attendance for this course.</p>
                        <span className="td-course-tool-link">Open attendance →</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="td-empty-state">
                    Return to My Courses and select a course to continue.
                  </p>
                )}
              </section>
            )}

            {activeView === "lectures" && (
              <TeacherLectures
                courses={courses}
                courseId={selectedCourse?.id}
                selectedCourse={selectedCourse}
              />
            )}

          {activeView === "liveClasses" && (
            <>
              <div className="td-page-intro">
                <div>
                  <h2>Schedule a live class</h2>
                  <p>Create an online session for one of your assigned courses.</p>
                </div>
              </div>

              <section className="td-panel" style={{ marginBottom: "24px" }}>
                <form onSubmit={handleScheduleClass} className="td-live-class-form">
                  <div className="td-filter-row">
                    <label>
                      Course
                      <select name="courseId" value={scheduleForm.courseId} onChange={updateScheduleForm} required>
                        <option value="">Select an assigned course</option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.name} ({course.code})
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Class title
                      <input
                        name="title"
                        value={scheduleForm.title}
                        onChange={updateScheduleForm}
                        placeholder="e.g. Java OOP Revision"
                        maxLength={150}
                        required
                      />
                    </label>
                  </div>

                  <label style={{ display: "block", marginTop: "16px" }}>
                    Description (optional)
                    <textarea
                      name="description"
                      value={scheduleForm.description}
                      onChange={updateScheduleForm}
                      placeholder="Topics to be covered in this session"
                      rows={3}
                    />
                  </label>

                  <div className="td-filter-row" style={{ marginTop: "16px" }}>
                    <label>
                      Start date and time
                      <input type="datetime-local" name="startTime" value={scheduleForm.startTime} onChange={updateScheduleForm} required />
                    </label>
                    <label>
                      End date and time
                      <input
                        type="datetime-local"
                        name="endTime"
                        value={scheduleForm.endTime}
                        onChange={updateScheduleForm}
                        min={scheduleForm.startTime || undefined}
                        required
                      />
                    </label>
                  </div>

                  {scheduleError && <p className="td-error-message">{scheduleError}</p>}
                  {scheduleMessage && <p className="td-success-message">{scheduleMessage}</p>}

                  <button
                    type="submit"
                    className="td-primary-button"
                    disabled={scheduling || coursesLoading || courses.length === 0}
                    style={{ marginTop: "18px" }}
                  >
                    {scheduling ? "Scheduling..." : "Schedule live class"}
                  </button>
                </form>
              </section>

              <div className="td-page-intro">
                <div>
                  <h2>Scheduled classes</h2>
                  <p>Classes scheduled for your assigned courses.</p>
                </div>
              </div>

              {courses.length === 0 && !coursesLoading ? (
                <p className="td-empty-state">No courses are assigned to you yet.</p>
              ) : liveClassesLoading ? (
                <p className="td-empty-state">Loading scheduled classes...</p>
              ) : liveClassesError ? (
                <p className="td-error-message">{liveClassesError}</p>
              ) : (
                <div className="td-panel td-table-wrap">
                  <table className="td-table">
                    <thead>
                      <tr>
                        <th>Class</th><th>Course</th><th>Start</th><th>End</th><th>Status</th><th>Room</th><th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {liveClasses.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <strong>{item.title || "Live class"}</strong>
                            {item.description && <div>{item.description}</div>}
                          </td>
                          <td>{item.courseName || courses.find((course) => String(course.id) === String(item.courseId))?.name || "Course"}</td>
                          <td>{item.startTime ? new Date(item.startTime).toLocaleString() : "—"}</td>
                          <td>{item.endTime ? new Date(item.endTime).toLocaleString() : "—"}</td>
                          <td><span className="td-status progress">{item.status || "SCHEDULED"}</span></td>
                          <td>{item.roomName || "Online"}</td>
                          <td>
                            <button
                              type="button"
                              className="td-primary-button"
                              onClick={() => setSelectedLiveClass(item)}
                              disabled={!item.roomName}
                            >
                              Join Class
                            </button>
                          </td>
                        </tr>
                      ))}
                      {liveClasses.length === 0 && <tr><td colSpan="7">No live classes scheduled yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedLiveClass && (
                <section className="td-panel" style={{ marginTop: "24px", padding: "24px", overflow: "visible", minWidth: 0 }}>
                  <div className="td-panel-heading">
                    <div>
                      <h2>{selectedLiveClass.title}</h2>
                      <p>
                        {selectedLiveClass.courseName ||
                          courses.find(
                            (course) =>
                              String(course.id) === String(selectedLiveClass.courseId)
                          )?.name ||
                          "Live class"}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="td-outline-button"
                      onClick={() => setSelectedLiveClass(null)}
                    >
                      Close Meeting
                    </button>
                  </div>

                  <div
                    style={{
                      width: "100%",
                      height: "650px",
                      minHeight: "650px",
                      position: "relative",
                      overflow: "hidden",
                      borderRadius: "12px",
                    }}
                  >
                    <JitsiMeeting
                      domain="meet.jit.si"
                      roomName={selectedLiveClass.roomName}
                      userInfo={{
                        displayName: teacherName,
                      }}
                      configOverwrite={{
                        prejoinPageEnabled: false,
                        startWithAudioMuted: true,
                        startWithVideoMuted: true,
                      }}
                      getIFrameRef={(iframeRef) => {
                        iframeRef.style.width = "100%";
                        iframeRef.style.height = "100%";
                        iframeRef.style.border = "0";
                      }}
                      style={{
                        height: "100%",
                        minHeight: "650px",
                        width: "100%",
                      }}
                    />
                  </div>
                </section>
              )}
            </>
          )}

          {activeView === "materials" && (
            <TeacherStudyMaterials courseId={selectedCourse?.id} selectedCourse={selectedCourse} courses={courses} />
          )}

            {activeView === "assignments" && (
            <TeacherAssignments courseId={selectedCourse?.id} selectedCourse={selectedCourse} courses={courses} />
            )}

        {activeView === "quizzes" && <TeacherQuizzes courseId={selectedCourse?.id} selectedCourse={selectedCourse} courses={courses} />}    

        {activeView === "attendance" && <TeacherAttendance courseId={selectedCourse?.id} selectedCourse={selectedCourse} courses={courses} />}

          {/* {activeView === "performance" && (
            <ComingSoon
              title="Student performance"
              description="Review assignment grades, quiz results, attendance, and learning progress."
            />
          )}

          {activeView === "announcements" && (
            <ComingSoon
              title="Announcements"
              description="Share important class updates, deadlines, and announcements with your students."
            />
          )} */}

          <footer className="td-footer">
            <span>© 2026 Smart Classroom</span>
            <span>Teacher workspace · live course data</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default TeacherDashboard;
