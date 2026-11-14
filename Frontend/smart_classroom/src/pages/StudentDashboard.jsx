import { useEffect, useMemo, useState } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import {
  getStudentCourses,
  getAllCourses,
  enrollInCourse,
  unenrollFromCourse,
} from "../services/courseService";
import { getLiveClassesByCourse } from "../services/liveClassService";
import StudyMaterials from "../components/StudyMaterials";
import Assignments from "../components/Assignments";
import StudentLectures from "./StudentLectures";
import "./TeacherDashboard.css";
import "./StudentDashboard.css";
import StudentQuizzes from "./StudentQuizzes";
import StudentAttendance from "./StudentAttendance";


const navigation = [
  { id: "overview", icon: "▦", label: "Overview" },
  { id: "courses", icon: "▤", label: "My Courses" },
  { id: "browseCourses", icon: "⌕", label: "Browse Courses" },
  { id: "lectures", icon: "▷", label: "Lectures" },
  { id: "liveClasses", icon: "▷", label: "Live Classes" },
  { id: "materials", icon: "▧", label: "Study Materials" },
  { id: "assignments", icon: "☷", label: "Assignments" },
  { id: "quizzes", icon: "✓", label: "Quizzes" },
  { id: "attendance", icon: "◷", label: "Attendance" },
];

function StudentDashboard({ user, onLogout }) {
  const [activeView, setActiveView] = useState("overview");
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState("");
  const [coursesRefreshKey, setCoursesRefreshKey] = useState(0);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [availableCoursesLoading, setAvailableCoursesLoading] = useState(false);
  const [availableCoursesError, setAvailableCoursesError] = useState("");
  const [catalogueRefreshKey, setCatalogueRefreshKey] = useState(0);
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  const [enrollmentMessage, setEnrollmentMessage] = useState("");
  const [enrollmentError, setEnrollmentError] = useState("");
  const [liveClasses, setLiveClasses] = useState([]);
  const [liveClassesLoading, setLiveClassesLoading] = useState(false);
  const [liveClassesError, setLiveClassesError] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLiveClass, setSelectedLiveClass] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [overviewAssignments, setOverviewAssignments] = useState([]);
  const [overviewMaterials, setOverviewMaterials] = useState([]);
  const [overviewLearningLoading, setOverviewLearningLoading] = useState(false);
  const [overviewLearningError, setOverviewLearningError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCourses() {
      setCoursesLoading(true);
      setCoursesError("");
      try {
        if (!user?.studentId) {
          throw new Error("Student information was not found. Please log in again.");
        }
        const data = await getStudentCourses(user.studentId);
        console.log("Enrollment API response:", data);
console.log("Logged-in student ID:", user.studentId);
        if (!cancelled) {
          const colors = ["violet", "blue", "orange", "green"];
          setCourses(
            (Array.isArray(data) ? data : []).map((course, index) => ({
              ...course,
              department: course.departmentName || course.department?.name || "Department not specified",
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

    if (user?.role === "STUDENT") {
      loadCourses();
    } else {
      setCourses([]);
      setCoursesLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [user?.studentId, user?.role, coursesRefreshKey]);

  useEffect(() => {
    let cancelled = false;

    async function loadOverviewLearningData() {
      if (coursesLoading || coursesError) return;
      if (!courses.length) {
        setOverviewAssignments([]);
        setOverviewMaterials([]);
        setOverviewLearningError("");
        setOverviewLearningLoading(false);
        return;
      }

      setOverviewLearningLoading(true);
      setOverviewLearningError("");

      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const results = await Promise.all(
          courses.map(async (course) => {
            const [assignmentsResponse, materialsResponse] = await Promise.all([
              fetch(`http://localhost:8080/api/courses/${course.id}/assignments`, { headers }),
              fetch(`http://localhost:8080/api/courses/${course.id}/materials`, { headers }),
            ]);

            if (!assignmentsResponse.ok || !materialsResponse.ok) {
              throw new Error("Could not load assignments or study materials.");
            }

            const assignmentsData = await assignmentsResponse.json();
            const materialsData = await materialsResponse.json();

            return {
              courseId: course.id,
              courseName: course.name,
              assignments: Array.isArray(assignmentsData)
                ? assignmentsData
                : Array.isArray(assignmentsData?.content)
                  ? assignmentsData.content
                  : [],
              materials: Array.isArray(materialsData)
                ? materialsData
                : Array.isArray(materialsData?.content)
                  ? materialsData.content
                  : [],
            };
          })
        );

        if (!cancelled) {
          setOverviewAssignments(
            results.flatMap((result) =>
              result.assignments.map((item) => ({
                ...item,
                courseId: item.courseId ?? result.courseId,
                courseName: item.courseName ?? result.courseName,
              }))
            )
          );
          setOverviewMaterials(
            results.flatMap((result) =>
              result.materials.map((item) => ({
                ...item,
                courseId: item.courseId ?? result.courseId,
                courseName: item.courseName ?? result.courseName,
              }))
            )
          );
        }
      } catch (error) {
        if (!cancelled) {
          setOverviewLearningError(
            error.message || "Unable to load assignments and study materials."
          );
        }
      } finally {
        if (!cancelled) setOverviewLearningLoading(false);
      }
    }

    loadOverviewLearningData();

    return () => {
      cancelled = true;
    };
  }, [courses, coursesLoading, coursesError]);

  useEffect(() => {
    let cancelled = false;

    async function loadLiveClasses() {
      if (coursesLoading || coursesError) return;
      if (!courses.length) {
        setLiveClasses([]);
        setLiveClassesLoading(false);
        return;
      }

      setLiveClassesLoading(true);
      setLiveClassesError("");
      try {
        const results = await Promise.all(courses.map((course) => getLiveClassesByCourse(course.id)));
        if (!cancelled) {
          setLiveClasses(
            results.flat().map((item) => ({
              ...item,
              courseName: item.courseName || courses.find((course) => course.id === item.courseId)?.name || "Course",
            }))
          );
        }
      } catch (error) {
        if (!cancelled) {
          setLiveClassesError(error.message || "Unable to load live classes.");
        }
      } finally {
        if (!cancelled) {
          setLiveClassesLoading(false);
        }
      }
    }

    loadLiveClasses();

    return () => {
      cancelled = true;
    };
  }, [courses, coursesLoading, coursesError]);

  useEffect(() => {
    let cancelled = false;

    async function loadAvailableCourses() {
      if (activeView !== "browseCourses") return;

      setAvailableCoursesLoading(true);
      setAvailableCoursesError("");
      try {
        const data = await getAllCourses();
        if (!cancelled) {
          setAvailableCourses(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (!cancelled) {
          setAvailableCoursesError(error.message || "Unable to load available courses.");
        }
      } finally {
        if (!cancelled) {
          setAvailableCoursesLoading(false);
        }
      }
    }

    loadAvailableCourses();

    return () => {
      cancelled = true;
    };
  }, [activeView, catalogueRefreshKey]);

  async function handleEnroll(course) {
    if (!user?.studentId) {
      setEnrollmentError("Student information was not found. Please log in again.");
      setEnrollmentMessage("");
      return;
    }

    setEnrollingCourseId(course.id);
    setEnrollmentMessage("");
    setEnrollmentError("");

    try {
      await enrollInCourse(user.studentId, course.id);
      setEnrollmentMessage(`Successfully enrolled in ${course.name}.`);
      setCoursesRefreshKey((key) => key + 1);
    } catch (error) {
      setEnrollmentError(error.message || "Unable to enroll in this course.");
    } finally {
      setEnrollingCourseId(null);
    }
  }

  const enrolledCourseIds = useMemo(
    () => new Set(courses.map((course) => String(course.id))),
    [courses]
  );

  const filteredAvailableCourses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return availableCourses;
    return availableCourses.filter((course) =>
      [course.name, course.code, course.departmentName, course.department?.name].some((value) =>
        String(value || "").toLowerCase().includes(term)
      )
    );
  }, [availableCourses, searchTerm]);

  const filteredCourses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return courses;
    return courses.filter((course) =>
      [course.name, course.code, course.department].some((value) =>
        String(value || "").toLowerCase().includes(term)
      )
    );
  }, [courses, searchTerm]);

  const studentName = user?.name || "Student";
  const initials = studentName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  const pageTitles = {
    overview: "Dashboard Overview",
    courses: "My Courses",
    browseCourses: "Browse Courses",
    courseWorkspace: selectedCourse ? `${selectedCourse.name} Workspace` : "Course Workspace",
    lectures: "Lectures",
    materials: "Study Materials",
    assignments: "Assignments",
    quizzes: "Quizzes & Assessments",
    attendance: "My Attendance",
    performance: "My Performance",
    announcements: "Announcements",
  };

  function openView(view) {
    setActiveView(view);
    setSelectedLiveClass(null);
    setSearchTerm("");
    setShowNotifications(false);
    if (["overview", "courses", "browseCourses", "lectures", "liveClasses", "performance", "announcements"].includes(view)) {
      setSelectedCourse(null);
    }
  }

  function openCourse(course) {
    setSelectedCourse(course);
    setSelectedLiveClass(null);
    setActiveView("courseWorkspace");
  }

  function openCourseSection(view) {
    if (!selectedCourse) {
      openView("courses");
      return;
    }
    setSelectedLiveClass(null);
    setActiveView(view);
  }

  async function handleUnenroll(course) {
  const confirmed = window.confirm(
    `Are you sure you want to unenroll from ${course.name}?`
  );

  if (!confirmed) return;

  try {
    await unenrollFromCourse(user.studentId, course.id);

    setSelectedCourse((current) =>
      current?.id === course.id ? null : current
    );

    setCoursesRefreshKey((key) => key + 1);

    if (selectedCourse?.id === course.id) {
      setActiveView("courses");
    }
  } catch (error) {
    window.alert(error.message || "Unable to unenroll from this course.");
  }
}

  function CourseCard({ course }) {
    return (
      <article className="td-course-card">
        <div className="td-course-card-top">
          <div className={`td-course-icon ${course.color}`}>{course.icon}</div>
          <span className="td-course-code">{course.code || "COURSE"}</span>
        </div>
        <h3>{course.name}</h3>
        <p className="td-course-department">{course.department}</p>
        <div className="td-course-stats">
          <span>Course ID: {course.id}</span>
          <span>Enrolled</span>
        </div>
        <button type="button" className="td-outline-button td-course-open" onClick={() => openCourse(course)}>
          Open course <span>→</span>
        </button>
      </article>
    );
  }

  function ComingSoon({ title, description }) {
    return (
      <section className="td-panel td-coming-soon">
        <div className="td-coming-icon">✦</div>
        <span className="td-eyebrow">STUDENT WORKSPACE</span>
        <h2>{title}</h2>
        <p>{description}</p>
        <div className="td-integration-note">
          <span>◉</span>This section will be connected to the student APIs in the next phase.
        </div>
      </section>
    );
  }

  return (
    <div className="teacher-layout student-layout">
      <aside className="td-sidebar">
        <div className="td-brand">
          <div className="td-brand-mark">SC</div>
          <div>
            <h2>Smart Classroom</h2>
            <p>STUDENT PORTAL</p>
          </div>
        </div>
        <div className="td-sidebar-label">LEARNING SPACE</div>
        <nav className="td-navigation" aria-label="Student navigation">
          {navigation.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`td-nav-item ${
                activeView === item.id || (item.id === "courses" && activeView === "courseWorkspace") ? "active" : ""
              }`}
              onClick={() => {
                if (item.id === "quizzes" && !selectedCourse) {
                  openView("courses");
                } else {
                  openView(item.id);
                }
              }}
            >
              <span className="td-nav-icon">{item.icon}</span>
              <span className="td-nav-label">{item.label}</span>
              {item.id === "courses" && courses.length > 0 && <span className="td-nav-badge">{courses.length}</span>}
            </button>
          ))}
        </nav>
        <div className="td-sidebar-bottom">
          <div className="td-help-card">
            <div className="td-help-icon">?</div>
            <h3>Keep learning!</h3>
            <p>Your courses and learning resources in one place.</p>
          </div>
          <div className="td-sidebar-user">
            <div className="td-avatar">{initials || "S"}</div>
            <div className="td-sidebar-user-info">
              <strong>{studentName}</strong>
              <span>Student account</span>
            </div>
            <button type="button" className="td-logout-button" onClick={onLogout} title="Log out" aria-label="Log out">
              ↗
            </button>
          </div>
        </div>
      </aside>

      <main className="td-main">
        <header className="td-header">
          <div className="td-header-title">
            <span className="td-breadcrumb">Student Portal /</span>
            <h1>{pageTitles[activeView] || "Student Workspace"}</h1>
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
                <button type="button" onClick={() => setSearchTerm("")} aria-label="Clear search">
                  ×
                </button>
              )}
            </label>
            <div className="td-notification-wrap">
              <button
                type="button"
                className="td-icon-button"
                onClick={() => setShowNotifications((value) => !value)}
                aria-label="Toggle notifications"
                aria-expanded={showNotifications}
              >
                ♧<span className="td-notification-dot" />
              </button>
              {showNotifications && (
                <div className="td-notification-popover">
                  <strong>Notifications</strong>
                  <p>Check your courses for new materials and assignments.</p>
                  <p>Join scheduled live classes on time.</p>
                </div>
              )}
            </div>
            <div className="td-header-profile">
              <div className="td-avatar">{initials || "S"}</div>
              <div>
                <strong>{studentName}</strong>
                <span>Student</span>
              </div>
            </div>
          </div>
        </header>

        <div className="td-content">
          {activeView === "overview" && (
            <>
              <section className="td-welcome-banner">
                <div className="td-welcome-copy">
                  <span className="td-welcome-tag">YOUR LEARNING SPACE</span>
                  <h2>Welcome back, {studentName.split(" ")[0]}! 👋</h2>
                  <p>
                    Pick up where you left off. Explore your courses, review resources, and stay on top of upcoming
                    classes.
                  </p>
                  <button type="button" className="td-primary-button" onClick={() => openView("courses")}>
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
                  <h2>Your learning overview</h2>
                  <p>A quick look at your courses and classroom activities.</p>
                </div>
                <span className="td-demo-label">STUDENT SUMMARY</span>
              </div>

              <section className="td-stat-grid">
                <article className="td-stat-card">
                  <div className="td-stat-top">
                    <span className="td-stat-icon blue">▤</span>
                    <span className="td-stat-trend">Enrolled</span>
                  </div>
                  <p>My courses</p>
                  <div className="td-stat-value">
                    {coursesLoading ? "..." : coursesError ? "—" : String(courses.length).padStart(2, "0")}
                  </div>
                  <span className="td-stat-foot">Courses available to you</span>
                </article>

                <article className="td-stat-card">
                  <div className="td-stat-top">
                    <span className="td-stat-icon violet">▷</span>
                    <span className="td-stat-trend">Scheduled</span>
                  </div>
                  <p>Live classes</p>
                  <div className="td-stat-value">
                    {liveClassesLoading ? "..." : liveClassesError ? "—" : String(liveClasses.length).padStart(2, "0")}
                  </div>
                  <span className="td-stat-foot">Classes across your courses</span>
                </article>

                <article className="td-stat-card">
                  <div className="td-stat-top">
                    <span className="td-stat-icon orange">☷</span>
                    <span className="td-stat-attention">To complete</span>
                  </div>
                  <p>Assignments</p>
                  <div className="td-stat-value">
                    {overviewLearningLoading ? "..." : overviewLearningError ? "—" : String(overviewAssignments.length).padStart(2, "0")}
                  </div>
                  <span className="td-stat-foot">Assignments across your courses</span>
                </article>

                <article className="td-stat-card">
                  <div className="td-stat-top">
                    <span className="td-stat-icon green">▧</span>
                    <span className="td-stat-trend">Resources</span>
                  </div>
                  <p>Study materials</p>
                  <div className="td-stat-value">
                    {overviewLearningLoading ? "..." : overviewLearningError ? "—" : String(overviewMaterials.length).padStart(2, "0")}
                  </div>
                  <span className="td-stat-foot">Study resources across your courses</span>
                </article>
              </section>

              <section className="td-main-grid">
                <div className="td-panel td-courses-panel">
                  <div className="td-panel-heading">
                    <div>
                      <h2>My courses</h2>
                      <p>Open a course to access its learning resources.</p>
                    </div>
                    <button type="button" className="td-text-button" onClick={() => openView("courses")}>
                      View all <span>→</span>
                    </button>
                  </div>
                  <div className="td-course-list">
                    {coursesLoading ? (
                      <p className="td-empty-state">Loading your courses...</p>
                    ) : coursesError ? (
                      <p className="td-error-message">{coursesError}</p>
                    ) : (
                      filteredCourses.slice(0, 3).map((course) => <CourseCard key={course.id} course={course} />)
                    )}
                    {!coursesLoading && !coursesError && courses.length === 0 && (
                      <p className="td-empty-state">You are not enrolled in any courses yet.</p>
                    )}
                    {!coursesLoading && !coursesError && courses.length > 0 && filteredCourses.length === 0 && (
                      <p className="td-empty-state">No courses match your search.</p>
                    )}
                  </div>
                </div>

                <div className="td-panel td-activity-panel">
                  <div className="td-panel-heading">
                    <div>
                      <h2>Learning shortcuts</h2>
                      <p>Jump into your classroom activities.</p>
                    </div>
                    <span className="td-live-dot">READY</span>
                  </div>
                  <div className="td-activity-list">
                    <button
                      type="button"
                      className="td-activity-item student-activity-button"
                      onClick={() => openView("materials")}
                    >
                      <div className="td-activity-icon blue">▧</div>
                      <div className="td-activity-copy">
                        <strong>Study materials</strong>
                        <p>Review notes and shared resources</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      className="td-activity-item student-activity-button"
                      onClick={() => openView("assignments")}
                    >
                      <div className="td-activity-icon violet">☷</div>
                      <div className="td-activity-copy">
                        <strong>Assignments</strong>
                        <p>View work and due dates</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      className="td-activity-item student-activity-button"
                      onClick={() => openView("liveClasses")}
                    >
                      <div className="td-activity-icon green">▷</div>
                      <div className="td-activity-copy">
                        <strong>Live classes</strong>
                        <p>See scheduled sessions</p>
                      </div>
                    </button>
                  </div>
                  <button type="button" className="td-outline-button td-full-button" onClick={() => openView("liveClasses")}>
                    View live class schedule →
                  </button>
                </div>
              </section>

              <section className="td-main-grid">
                <div className="td-panel td-tasks-panel">
                  <div className="td-panel-heading">
                    <div>
                      <h2>Assignments</h2>
                      <p>Recent assignments from your enrolled courses.</p>
                    </div>
                    <button type="button" className="td-text-button" onClick={() => openView("assignments")}>
                      View all →
                    </button>
                  </div>
                  {overviewLearningLoading ? (
                    <p className="td-empty-state">Loading assignments...</p>
                  ) : overviewLearningError ? (
                    <p className="td-error-message">{overviewLearningError}</p>
                  ) : overviewAssignments.length === 0 ? (
                    <p className="td-empty-state">No assignments have been added to your courses yet.</p>
                  ) : (
                    <div className="td-activity-list">
                      {overviewAssignments.slice(0, 4).map((assignment, index) => (
                        <button
                          type="button"
                          className="td-activity-item student-activity-button"
                          key={assignment.id ?? `${assignment.courseId}-assignment-${index}`}
                          onClick={() => {
                            const course = courses.find((item) => String(item.id) === String(assignment.courseId));
                            if (course) {
                              setSelectedCourse(course);
                              setActiveView("assignments");
                            } else {
                              openView("assignments");
                            }
                          }}
                        >
                          <div className="td-activity-icon violet">☷</div>
                          <div className="td-activity-copy">
                            <strong>{assignment.title || "Assignment"}</strong>
                            <p>{assignment.courseName}{assignment.dueDate ? ` · Due ${new Date(assignment.dueDate).toLocaleDateString()}` : ""}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="td-panel td-tasks-panel">
                  <div className="td-panel-heading">
                    <div>
                      <h2>Study materials</h2>
                      <p>Recently shared learning resources.</p>
                    </div>
                    <button type="button" className="td-text-button" onClick={() => openView("materials")}>
                      View all →
                    </button>
                  </div>
                  {overviewLearningLoading ? (
                    <p className="td-empty-state">Loading study materials...</p>
                  ) : overviewLearningError ? (
                    <p className="td-error-message">{overviewLearningError}</p>
                  ) : overviewMaterials.length === 0 ? (
                    <p className="td-empty-state">No study materials have been added to your courses yet.</p>
                  ) : (
                    <div className="td-activity-list">
                      {overviewMaterials.slice(0, 4).map((material, index) => (
                        <button
                          type="button"
                          className="td-activity-item student-activity-button"
                          key={material.id ?? `${material.courseId}-material-${index}`}
                          onClick={() => {
                            const course = courses.find((item) => String(item.id) === String(material.courseId));
                            if (course) {
                              setSelectedCourse(course);
                              setActiveView("materials");
                            } else {
                              openView("materials");
                            }
                          }}
                        >
                          <div className="td-activity-icon blue">▧</div>
                          <div className="td-activity-copy">
                            <strong>{material.title || "Study material"}</strong>
                            <p>{material.courseName}{material.fileType ? ` · ${material.fileType}` : ""}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section className="td-panel td-tasks-panel">
                <div className="td-panel-heading">
                  <div>
                    <h2>Upcoming live classes</h2>
                    <p>Join a scheduled class from your enrolled courses.</p>
                  </div>
                  <button type="button" className="td-text-button" onClick={() => openView("liveClasses")}>
                    View schedule <span>→</span>
                  </button>
                </div>
                {liveClassesLoading ? (
                  <p className="td-empty-state">Loading live classes...</p>
                ) : liveClassesError ? (
                  <p className="td-error-message">{liveClassesError}</p>
                ) : liveClasses.length === 0 ? (
                  <p className="td-empty-state">No live classes scheduled right now.</p>
                ) : (
                  <div className="td-table-wrap">
                    <table className="td-table">
                      <thead>
                        <tr>
                          <th>Class</th>
                          <th>Course</th>
                          <th>Room</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {liveClasses.slice(0, 5).map((item) => (
                          <tr key={item.id}>
                            <td>
                              <strong>{item.title || "Live class"}</strong>
                            </td>
                            <td>{item.courseName}</td>
                            <td>{item.roomName || "Online"}</td>
                            <td>
                              <button
                                type="button"
                                className="td-text-button"
                                onClick={() => {
                                  const course = courses.find((c) => String(c.id) === String(item.courseId));
                                  setSelectedCourse(course || null);
                                  setSelectedLiveClass(item);
                                  setActiveView("liveClasses");
                                }}
                              >
                                Join class →
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}

          {activeView === "browseCourses" && (
            <>
              <div className="td-page-intro">
                <div>
                  <h2>Browse available courses</h2>
                  <p>Explore courses offered by your college and enroll to access their learning resources.</p>
                </div>
                <span className="td-demo-label">{filteredAvailableCourses.length} COURSES</span>
              </div>

              {enrollmentMessage && <p className="td-success-message">{enrollmentMessage}</p>}
              {enrollmentError && <p className="td-error-message">{enrollmentError}</p>}

              {availableCoursesLoading ? (
                <p className="td-empty-state">Loading available courses...</p>
              ) : availableCoursesError ? (
                <div className="td-panel">
                  <p className="td-error-message">{availableCoursesError}</p>
                  <button
                    type="button"
                    className="td-primary-button"
                    onClick={() => setActiveView("overview")}
                  >
                    Back to dashboard
                  </button>
                  <button
                    type="button"
                    className="td-outline-button"
                    onClick={() => setCatalogueRefreshKey((key) => key + 1)}
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="td-course-grid">
                  {filteredAvailableCourses.map((course, index) => {
                    const isEnrolled = enrolledCourseIds.has(String(course.id));
                    const colors = ["violet", "blue", "orange", "green"];
                    const courseForCard = {
                      ...course,
                      department: course.departmentName || course.department?.name || "Department not specified",
                      color: colors[index % colors.length],
                      icon: course.name?.charAt(0).toUpperCase() || "C",
                    };

                    return (
                      <article className="td-course-card" key={course.id}>
                        <div className="td-course-card-top">
                          <div className={`td-course-icon ${courseForCard.color}`}>{courseForCard.icon}</div>
                          <span className="td-course-code">{course.code || "COURSE"}</span>
                        </div>
                        <h3>{course.name}</h3>
                        <p className="td-course-department">{courseForCard.department}</p>
                        <div className="td-course-stats">
                          <span>Course ID: {course.id}</span>
                          <span>{isEnrolled ? "Enrolled" : "Available"}</span>
                        </div>
                        {isEnrolled ? (
                        <div className="td-course-actions">
                          <button
                            type="button"
                            className="td-outline-button"
                            onClick={() => openCourse(course)}
                          >
                            Open course →
                          </button>

                          <button
                            type="button"
                            className="td-danger-button"
                            onClick={() => handleUnenroll(course)}
                          >
                            Unenroll
                          </button>
                        </div>
                        ) : (
                          <button
                            type="button"
                            className="td-primary-button td-course-open"
                            disabled={enrollingCourseId !== null}
                            onClick={() => handleEnroll(course)}
                          >
                            {enrollingCourseId === course.id ? "Enrolling..." : "Enroll"}
                          </button>
                        )}
                      </article>
                    );
                  })}
                  {filteredAvailableCourses.length === 0 && (
                    <p className="td-empty-state">
                      {availableCourses.length === 0
                        ? "No courses are available right now."
                        : "No courses match your search."}
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {activeView === "courses" && (
            <>
              <div className="td-page-intro">
                <div>
                  <h2>My enrolled courses</h2>
                  <p>Browse your courses and open a course workspace to continue learning.</p>
                </div>
                <span className="td-demo-label">{filteredCourses.length} COURSES</span>
              </div>
              {coursesLoading ? (
                <p className="td-empty-state">Loading your courses...</p>
              ) : coursesError ? (
                <div className="td-panel">
                  <p className="td-error-message">{coursesError}</p>
                  <button type="button" className="td-primary-button" onClick={() => window.location.reload()}>
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
                      {courses.length === 0 ? "You are not enrolled in any courses yet." : "No courses match your search."}
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
                  <span className="td-eyebrow">YOUR COURSE</span>
                  <h2>{selectedCourse?.name || "Course workspace"}</h2>
                  <p>
                    {selectedCourse
                      ? `${selectedCourse.code || "Course"} · ${selectedCourse.department}`
                      : "Select a course from My Courses to open its workspace."}
                  </p>
                </div>
                <button type="button" className="td-outline-button" onClick={() => openView("courses")}>
                  ← Back to My Courses
                </button>
              </div>
              {selectedCourse ? (
                <>
                  <p className="td-workspace-hint">Choose a learning activity for this course.</p>
                  <div className="td-course-grid td-course-tools-grid">
                    <button type="button" className="td-panel td-course-tool" onClick={() => openCourseSection("materials")}>
                      <span className="td-course-tool-icon">▧</span>
                      <h3>Study Materials</h3>
                      <p>Read PDFs, presentations, notes, and other shared resources.</p>
                      <span className="td-course-tool-link">View materials →</span>
                    </button>
                    <button type="button" className="td-panel td-course-tool" onClick={() => openCourseSection("assignments")}>
                      <span className="td-course-tool-icon">☷</span>
                      <h3>Assignments</h3>
                      <p>Review assignment instructions and prepare your submissions.</p>
                      <span className="td-course-tool-link">View assignments →</span>
                    </button>
                    <button type="button" className="td-panel td-course-tool" onClick={() => openCourseSection("quizzes")}>
                      <span className="td-course-tool-icon">✓</span>
                      <h3>Quizzes</h3>
                      <p>Access quizzes and check your learning progress.</p>
                      <span className="td-course-tool-link">Explore quizzes →</span>
                    </button>
                    <button type="button" className="td-panel td-course-tool" onClick={() => openCourseSection("attendance")}>
                      <span className="td-course-tool-icon">◷</span>
                      <h3>Attendance</h3>
                      <p>Review your attendance information for this course.</p>
                      <span className="td-course-tool-link">View attendance →</span>
                    </button>
                    <button type="button" className="td-panel td-course-tool" onClick={() => openCourseSection("liveClasses")}>
                      <span className="td-course-tool-icon">▷</span>
                      <h3>Live Classes</h3>
                      <p>Find scheduled sessions and join online classes.</p>
                      <span className="td-course-tool-link">View classes →</span>
                    </button>
                  </div>
                </>
              ) : (
                <p className="td-empty-state">Return to My Courses and select a course to continue.</p>
              )}
            </section>
          )}

          {activeView === "materials" && (
            <>
              <div className="td-page-intro">
                <div>
                  <h2>Study materials</h2>
                  <p>
                    {selectedCourse
                      ? `Learning resources for ${selectedCourse.name}.`
                      : "Choose a course to view its shared learning resources."}
                  </p>
                </div>
                {selectedCourse && (
                  <button type="button" className="td-outline-button" onClick={() => openView("courseWorkspace")}>
                    ← Course workspace
                  </button>
                )}
              </div>
              {selectedCourse ? (
                <StudyMaterials courseId={selectedCourse.id} />
              ) : (
                <div className="td-course-grid">
                  {courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                  {!coursesLoading && courses.length === 0 && <p className="td-empty-state">No courses available yet.</p>}
                </div>
              )}
            </>
          )}

          {activeView === "assignments" && (
            <>
              <div className="td-page-intro">
                <div>
                  <h2>Assignments</h2>
                  <p>
                    {selectedCourse
                      ? `Assignments for ${selectedCourse.name}.`
                      : "Choose a course to review its assignments and due dates."}
                  </p>
                </div>
                {selectedCourse && (
                  <button type="button" className="td-outline-button" onClick={() => openView("courseWorkspace")}>
                    ← Course workspace
                  </button>
                )}
              </div>
              {selectedCourse ? (
                <Assignments courseId={selectedCourse.id} studentId={user?.studentId} />
              ) : (
                <div className="td-course-grid">
                  {courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                  {!coursesLoading && courses.length === 0 && <p className="td-empty-state">No courses available yet.</p>}
                </div>
              )}
            </>
          )}

          {activeView === "lectures" && (
            <StudentLectures
              courses={courses}
              selectedCourse={selectedCourse}
              onBackToCourses={() => openView("courses")}
            />
          )}

          {activeView === "liveClasses" && (
            <>
              <div className="td-page-intro">
                <div>
                  <h2>Live classes</h2>
                  <p>View scheduled sessions and join your online classroom.</p>
                </div>
                {selectedCourse && (
                  <button
                    type="button"
                    className="td-outline-button"
                    onClick={() => {
                      setSelectedCourse(null);
                      setSelectedLiveClass(null);
                    }}
                  >
                    Show all classes
                  </button>
                )}
              </div>
              {selectedLiveClass ? (
                <section className="td-panel student-meeting-panel">
                  <button type="button" className="td-outline-button" onClick={() => setSelectedLiveClass(null)}>
                    ← Back to schedule
                  </button>
                  <h2>{selectedLiveClass.title || "Live class"}</h2>
                  <p>{selectedCourse?.name || selectedLiveClass.courseName}</p>
                  <div className="jitsi-container">
                    <JitsiMeeting
                      domain="meet.jit.si"
                      roomName={selectedLiveClass.roomName}
                      userInfo={{ displayName: studentName }}
                      configOverwrite={{ prejoinPageEnabled: false, startWithAudioMuted: true }}
                      getIFrameRef={(iframeRef) => {
                        iframeRef.style.width = "100%";
                        iframeRef.style.height = "600px";
                        iframeRef.style.border = "0";
                      }}
                    />
                  </div>
                </section>
              ) : liveClassesLoading ? (
                <p className="td-empty-state">Loading live classes...</p>
              ) : liveClassesError ? (
                <p className="td-error-message">{liveClassesError}</p>
              ) : (
                <div className="td-panel td-table-wrap">
                  <table className="td-table">
                    <thead>
                      <tr>
                        <th>Class</th>
                        <th>Course</th>
                        <th>Room</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {liveClasses
                        .filter((item) => !selectedCourse || String(item.courseId) === String(selectedCourse.id))
                        .map((item) => (
                          <tr key={item.id}>
                            <td>
                              <strong>{item.title || "Live class"}</strong>
                            </td>
                            <td>{item.courseName}</td>
                            <td>{item.roomName || "Online"}</td>
                            <td>
                              <button
                                type="button"
                                className="td-primary-button"
                                onClick={() => setSelectedLiveClass(item)}
                              >
                                Join class
                              </button>
                            </td>
                          </tr>
                        ))}
                      {liveClasses.filter(
                        (item) => !selectedCourse || String(item.courseId) === String(selectedCourse.id)
                      ).length === 0 && (
                        <tr>
                          <td colSpan="4">No live classes scheduled for this selection.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {activeView === "quizzes" && (
            selectedCourse ? (
              <StudentQuizzes
                courseId={selectedCourse.id}
                studentId={user?.studentId}
              />
            ) : (
              <ComingSoon
                title="Select a course"
                description="Choose a course from My Courses to view its quizzes."
              />
            )
          )}
          {activeView === "attendance" && (
            selectedCourse ? (
              <StudentAttendance
                studentId={user?.studentId}
                courseId={selectedCourse.id}
                courseName={selectedCourse.name}
              />
            ) : (
              <div className="td-course-grid">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}

                {!coursesLoading && courses.length === 0 && (
                  <p className="td-empty-state">
                    You are not enrolled in any courses yet.
                  </p>
                )}
              </div>
            )
          )}
          {activeView === "performance" && (
            <ComingSoon
              title="My performance"
              description="View your quiz scores, assignment results, and learning progress in one place."
            />
          )}
          {activeView === "announcements" && (
            <ComingSoon
              title="Announcements"
              description="Important updates and announcements from your teachers will appear here."
            />
          )}

          <footer className="td-footer">
            <span>© 2026 Smart Classroom</span>
            <span>Student workspace · learning portal</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default StudentDashboard;