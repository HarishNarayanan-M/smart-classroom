import { useEffect, useMemo, useState } from "react";
import {
  getCourseLectures,
  createLecture,
  uploadLectureVideo,
  deleteLecture as deleteLectureApi,
} from "../services/lectureService";
import "./TeacherLectures.css";

function TeacherLectures({ courses = [] }) {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("jwtToken");

    useEffect(() => {
    let cancelled = false;

    async function loadLectures() {
        setLoading(true);
        setError("");

        try {
        const results = await Promise.all(
            courses.map((course) =>
            getCourseLectures(course.id, token)
            )
        );

        if (!cancelled) {
          setLectures(
            results.flat().map((lecture) => ({
              ...lecture,
              type: lecture.type || "Recorded",
              unit: lecture.unit || "",
              date: lecture.date || "",
              status: lecture.status || "Published",
            }))
          );
        }
        } catch (err) {
        if (!cancelled) {
            setError(err.message || "Unable to load lectures.");
        }
        } finally {
        if (!cancelled) {
            setLoading(false);
        }
        }
    }

    if (!token) {
        setError("Please log in again. Authentication token not found.");
        setLoading(false);
        return;
    }

    if (courses.length > 0) {
        loadLectures();
    } else {
        setLectures([]);
        setLoading(false);
    }

    return () => {
        cancelled = true;
    };
    }, [courses, token]);


  const emptyForm = {
    title: "",
    courseId: courses[0]?.id ? String(courses[0].id) : "",
    type: "Recorded",
    unit: "",
    date: "",
    status: "Draft",
    videoUrl: "",
    description: "",
  };

  const [form, setForm] = useState(emptyForm);

  const filteredLectures = useMemo(() => {
    const query = search.trim().toLowerCase();

    return lectures.filter((lecture) => {
      const course = courses.find(
        (item) => item.id === lecture.courseId
      );

      const matchesSearch =
        (lecture.title || "").toLowerCase().includes(query) ||
        (lecture.unit || "").toLowerCase().includes(query) ||
        (course?.name || lecture.courseName || "").toLowerCase().includes(query);

      const matchesCourse =
        courseFilter === "all" ||
        String(lecture.courseId) === courseFilter;

      const matchesType =
        typeFilter === "all" || lecture.type === typeFilter;

      return matchesSearch && matchesCourse && matchesType;
    });
  }, [lectures, courses, search, courseFilter, typeFilter]);

  const recordedCount = lectures.filter(
    (lecture) => lecture.type === "Recorded"
  ).length;

  const upcomingCount = lectures.filter(
    (lecture) =>
      lecture.type === "Live" &&
      lecture.status === "Scheduled" &&
      lecture.date >= new Date().toISOString().slice(0, 10)
  ).length;

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function openAddForm() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      courseId: courses[0]?.id ? String(courses[0].id) : "",
    });
    setSelectedVideo(null);
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(lecture) {
    setEditingId(lecture.id);
    setForm({
      ...emptyForm,
      ...lecture,
      courseId: String(lecture.courseId),
      title: lecture.title || "",
      description: lecture.description || "",
      videoUrl: lecture.videoUrl || "",
      type: lecture.type || "Recorded",
      unit: lecture.unit || "",
      date: lecture.date || "",
      status: lecture.status || "Published",
    });
    setSelectedVideo(null);
    setMessage(
      "Editing existing lectures is not connected yet. You can view their details, but saving changes requires a backend update endpoint."
    );
    setShowForm(true);
  }
  async function handleSubmit(event) {
    event.preventDefault();

    const selectedCourse = courses.find(
      (course) => String(course.id) === form.courseId
    );

    if (!selectedCourse) {
      setMessage("Please select a course.");
      return;
    }

    if (!form.title.trim()) {
      setMessage("Please enter a lecture title.");
      return;
    }

    if (!token) {
      setMessage("Please log in again.");
      return;
    }

    // The current backend has create and upload endpoints, but no update endpoint.
    if (editingId !== null) {
      setMessage(
        "Editing is not connected yet because the backend has no update endpoint. Use Add lecture to create a new lecture."
      );
      return;
    }

    if (!selectedVideo && form.videoUrl.trim()) {
      try {
        new URL(form.videoUrl);
      } catch {
        setMessage("Enter a valid video URL or attach a video file.");
        return;
      }
    }

    setSaving(true);
    setMessage("");

    try {
      let savedLecture;

      if (selectedVideo) {
        savedLecture = await uploadLectureVideo(
          selectedCourse.id,
          {
            title: form.title.trim(),
            description: form.description,
            video: selectedVideo,
          },
          token
        );
      } else {
        savedLecture = await createLecture(
          selectedCourse.id,
          {
            title: form.title.trim(),
            description: form.description,
            videoUrl: form.videoUrl.trim(),
          },
          token
        );
      }

      // Only title, description, videoUrl and course are persisted by the backend.
      const lectureForDisplay = {
        ...savedLecture,
        type: form.type,
        unit: form.unit,
        date: form.date,
        status: form.status || "Published",
      };

      setLectures((current) => [lectureForDisplay, ...current]);
      setMessage("Lecture saved successfully!");

      setForm({
        title: "",
        courseId: String(courses[0]?.id ?? ""),
        type: "Recorded",
        unit: "",
        date: "",
        status: "Draft",
        videoUrl: "",
        description: "",
      });
      setSelectedVideo(null);
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      setMessage(err.message || "Failed to save lecture.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteLecture(lecture) {
    if (
      !window.confirm(
        `Delete "${lecture.title}" permanently from the database?`
      )
    ) {
      return;
    }

    if (!token) {
      setMessage("Please log in again.");
      return;
    }

    setDeletingId(lecture.id);
    setMessage("");

    try {
      await deleteLectureApi(lecture.courseId, lecture.id, token);
      setLectures((current) =>
        current.filter((item) => item.id !== lecture.id)
      );
      setMessage("Lecture deleted successfully.");
    } catch (err) {
      setMessage(err.message || "Failed to delete lecture from the database.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="tl-page">
      <div className="tl-heading">
        <div>
          <span className="tl-eyebrow">TEACHING WORKSPACE</span>
          <h2>Lecture Management</h2>
          <p>Organize recorded lectures and schedule live classes.</p>
        </div>

        <button
          type="button"
          className="td-primary-button"
          onClick={openAddForm}
          disabled={courses.length === 0}
        >
          + Add lecture
        </button>
      </div>

      <div className="tl-stats">
        <article className="tl-stat-card">
          <span className="tl-stat-icon">▤</span>
          <p>Total lectures</p>
          <strong>{lectures.length}</strong>
        </article>

        <article className="tl-stat-card">
          <span className="tl-stat-icon">▷</span>
          <p>Recorded lectures</p>
          <strong>{recordedCount}</strong>
        </article>

        <article className="tl-stat-card">
          <span className="tl-stat-icon">◷</span>
          <p>Upcoming live classes</p>
          <strong>{upcomingCount}</strong>
        </article>
      </div>

      <div className="td-panel tl-list-panel">
        <div className="tl-toolbar">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search lectures or courses..."
            aria-label="Search lectures"
          />

          <select
            value={courseFilter}
            onChange={(event) => setCourseFilter(event.target.value)}
            aria-label="Filter by course"
          >
            <option value="all">All courses</option>
            {courses.map((course) => (
              <option key={course.id} value={String(course.id)}>
                {course.code} — {course.name}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            aria-label="Filter by lecture type"
          >
            <option value="all">All types</option>
            <option value="Recorded">Recorded</option>
            <option value="Live">Live classes</option>
          </select>
        </div>

        {message && (
          <p className="tl-message" role="status">{message}</p>
        )}

        {showForm && (
          <form className="tl-form" onSubmit={handleSubmit}>
            <div className="tl-form-heading">
              <h3>{editingId !== null ? "Edit lecture" : "Add a lecture"}</h3>
              <button
                type="button"
                className="tl-close-button"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <label>
              Lecture title *
              <input
                name="title"
                value={form.title}
                onChange={updateField}
                required
                maxLength={150}
                placeholder="e.g. Introduction to Java"
              />
            </label>

            <div className="tl-form-grid">
              <label>
                Course *
                <select
                  name="courseId"
                  value={form.courseId}
                  onChange={updateField}
                  required
                >
                  <option value="">Select course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={String(course.id)}>
                      {course.code} — {course.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Lecture type *
                <select
                  name="type"
                  value={form.type}
                  onChange={updateField}
                  required
                >
                  <option value="Recorded">Recorded lecture</option>
                  <option value="Live">Live class</option>
                </select>
              </label>

              <label>
                Unit or topic
                <input
                  name="unit"
                  value={form.unit}
                  onChange={updateField}
                  placeholder="e.g. Unit 1"
                />
              </label>

              <label>
                {form.type === "Live" ? "Scheduled date *" : "Lecture date"}
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={updateField}
                  required={form.type === "Live"}
                />
              </label>

              <label>
                Status
                <select
                  name="status"
                  value={form.status}
                  onChange={updateField}
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  {form.type === "Live" && (
                    <option value="Scheduled">Scheduled</option>
                  )}
                </select>
              </label>

              <label>
                Video URL
                <input
                  type="url"
                  name="videoUrl"
                  value={form.videoUrl}
                  onChange={updateField}
                  placeholder="https://..."
                />
              </label>

              <label>
                Attach video file
                <input
                  type="file"
                  accept="video/*"
                  onChange={(event) =>
                    setSelectedVideo(event.target.files?.[0] || null)
                  }
                />
                {selectedVideo && (
                  <small>Selected: {selectedVideo.name}</small>
                )}
                <small>
                  Select a video file, or enter a video URL above. If both are
                  provided, the uploaded file will be used.
                </small>
              </label>
            </div>

            <label>
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={updateField}
                rows={3}
                placeholder="What will students learn?"
              />
            </label>

        <div className="tl-form-actions">
        <button
            type="button"
            className="td-outline-button"
            onClick={() => setShowForm(false)}
        >
            Cancel
        </button>

        <button
            type="submit"
            className="td-primary-button"
            disabled={saving}
        >
            {saving
              ? selectedVideo
                ? "Uploading..."
                : "Saving..."
              : editingId !== null
                ? "Save changes"
                : "Add lecture"}
        </button>
        </div>
          </form>
        )}

        <div className="tl-list-heading">
          <div>
            <h3>All lectures</h3>
            <p>{filteredLectures.length} lecture(s) shown</p>
          </div>
          <span className="tl-preview-label">DATABASE DATA</span>
        </div>

        {loading && <p className="td-empty-state">Loading lectures...</p>}
        {error && <p className="tl-message" role="alert">{error}</p>}

        {!loading && courses.length === 0 ? (
          <p className="td-empty-state">
            Your courses could not be loaded. Check the My Courses API first.
          </p>
        ) : !loading && filteredLectures.length === 0 ? (
          <p className="td-empty-state">
            No lectures match your search and filters.
          </p>
        ) : (
          <div className="tl-lecture-list">
            {filteredLectures.map((lecture) => {
              const course = courses.find(
                (item) => item.id === lecture.courseId
              );

              return (
                <article className="tl-lecture-row" key={lecture.id}>
                  <div className="tl-video-icon">
                    {lecture.type === "Live" ? "◉" : "▷"}
                  </div>

                  <div className="tl-lecture-info">
                    <h4>{lecture.title}</h4>
                    <p>
                      {course?.code || "Course"} · {course?.name || "Unknown course"}
                    </p>
                    <div className="tl-lecture-meta">
                      <span>{lecture.unit || "Topic not set"}</span>
                      <span>{lecture.type || "Recorded"}</span>
                      {lecture.date && <span>{lecture.date}</span>}
                    </div>
                  </div>

                  <span
                    className={`tl-status ${
                      (lecture.status || "Published") === "Published"
                        ? "is-published"
                        : lecture.status === "Scheduled"
                          ? "is-scheduled"
                          : "is-draft"
                    }`}
                  >
                    {lecture.status || "Published"}
                  </span>

                  <div className="tl-actions">
                    {lecture.videoUrl && (
                      <a
                        href={
                          lecture.videoUrl.startsWith("/")
                            ? `http://localhost:8080${lecture.videoUrl}`
                            : lecture.videoUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => openEditForm(lecture)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="tl-delete-button"
                      onClick={() => handleDeleteLecture(lecture)}
                      disabled={deletingId === lecture.id}
                    >
                      {deletingId === lecture.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <p className="tl-disclaimer">
        Lectures are loaded from Spring Boot. Creating, video uploading, and
        deleting use the backend API. Unit, date, type, and status are not yet
        stored by the current backend, and editing requires an update endpoint.
      </p>
    </section>
  );
}

export default TeacherLectures;
