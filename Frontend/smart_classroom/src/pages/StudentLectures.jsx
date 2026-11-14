import { useEffect, useMemo, useState } from "react";
import { getCourseLectures } from "../services/lectureService";

const VIDEO_ORIGIN = "http://localhost:8080";

function getVideoUrl(videoUrl) {
  if (!videoUrl) return "";
  if (/^https?:\/\//i.test(videoUrl)) return videoUrl;
  return `${VIDEO_ORIGIN}${videoUrl.startsWith("/") ? "" : "/"}${videoUrl}`;
}

function StudentLectures({ courses = [], selectedCourse = null, onBackToCourses }) {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState(selectedCourse?.id ? String(selectedCourse.id) : "all");
  const [playingLecture, setPlayingLecture] = useState(null);

  useEffect(() => {
    setCourseFilter(selectedCourse?.id ? String(selectedCourse.id) : "all");
    setPlayingLecture(null);
  }, [selectedCourse?.id]);

  useEffect(() => {
    let cancelled = false;
    async function loadLectures() {
      if (!courses.length) {
        setLectures([]);
        setLoading(false);
        setError("");
        return;
      }

      const token = localStorage.getItem("token") || localStorage.getItem("jwtToken");
      if (!token) {
        setError("Your login session could not be found. Please log in again.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        
const results = await Promise.all(
  courses.map(async (course) => {
    console.log("Student course:", course);

    const items = await getCourseLectures(course.id, token);

    console.log(`Lectures for course ${course.id}:`, items);

    return (Array.isArray(items) ? items : []).map((lecture) => ({
      ...lecture,
      courseId: lecture.courseId ?? course.id,
      courseName: lecture.courseName || course.name || "Course",
      courseCode: lecture.courseCode || course.code || "",
    }));
  })
);

const allLectures = results.flat();

console.log("All student lectures:", allLectures);

if (!cancelled) setLectures(allLectures);

      } catch (err) {
        if (!cancelled) setError(err.message || "Unable to load lectures.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadLectures();
    return () => { cancelled = true; };
  }, [courses]);

  const filteredLectures = useMemo(() => {
    const term = search.trim().toLowerCase();
    return lectures.filter((lecture) => {
      const matchesCourse = courseFilter === "all" || String(lecture.courseId) === courseFilter;
      const matchesSearch = [lecture.title, lecture.description, lecture.courseName, lecture.courseCode]
        .some((value) => String(value || "").toLowerCase().includes(term));
      return matchesCourse && matchesSearch;
    });
  }, [lectures, search, courseFilter]);

  const videoUrl = (lecture) => getVideoUrl(lecture?.videoUrl);

  return (
    <section className="student-lectures-page">
      <div className="td-page-intro">
        <div>
          <span className="td-eyebrow">YOUR LEARNING SPACE</span>
          <h2>Lectures</h2>
          <p>Watch recorded lectures shared by teachers for your enrolled courses.</p>
        </div>
        {selectedCourse && <button type="button" className="td-outline-button" onClick={onBackToCourses}>← Back to My Courses</button>}
      </div>

      <div className="td-stat-grid student-lecture-stats">
        <article className="td-stat-card"><div className="td-stat-top"><span className="td-stat-icon blue">▷</span></div><p>Available lectures</p><div className="td-stat-value">{loading ? "…" : lectures.length}</div><span className="td-stat-foot">Across your enrolled courses</span></article>
        <article className="td-stat-card"><div className="td-stat-top"><span className="td-stat-icon violet">▤</span></div><p>Courses</p><div className="td-stat-value">{courses.length}</div><span className="td-stat-foot">Your enrolled courses</span></article>
      </div>

      <div className="td-panel student-lectures-panel">
        <div className="student-lectures-toolbar">
          <label className="td-search student-lecture-search"><span>⌕</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search lectures or topics..." aria-label="Search lectures" /></label>
          <select className="student-lecture-course-filter" value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)} aria-label="Filter lectures by course">
            <option value="all">All courses</option>
            {courses.map((course) => <option key={course.id} value={String(course.id)}>{course.code ? `${course.code} — ` : ""}{course.name}</option>)}
          </select>
        </div>

        {loading && <p className="td-empty-state">Loading lectures...</p>}
        {error && <div className="td-panel"><p className="td-error-message" role="alert">{error}</p><button type="button" className="td-outline-button" onClick={() => window.location.reload()}>Retry</button></div>}
        {!loading && !error && courses.length === 0 && <p className="td-empty-state">You are not enrolled in any courses yet.</p>}
        {!loading && !error && courses.length > 0 && filteredLectures.length === 0 && <p className="td-empty-state">{lectures.length === 0 ? "No lectures have been posted for your courses yet." : "No lectures match your search or course filter."}</p>}

        {!loading && !error && filteredLectures.length > 0 && <div className="student-lecture-grid">
          {filteredLectures.map((lecture) => {
            const url = videoUrl(lecture);
            const isPlaying = playingLecture?.id === lecture.id && String(playingLecture?.courseId) === String(lecture.courseId);
            return <article className="td-panel student-lecture-card" key={`${lecture.courseId}-${lecture.id}`}>
              <div className="student-lecture-card-icon">▷</div>
              <div className="student-lecture-card-content">
                <span className="td-eyebrow">{lecture.courseCode || "COURSE"}</span>
                <h3>{lecture.title || "Untitled lecture"}</h3>
                <p className="student-lecture-course-name">{lecture.courseName}</p>
                {lecture.description && <p className="student-lecture-description">{lecture.description}</p>}
              </div>
              {url ? <div className="student-lecture-actions">
                <button type="button" className="td-primary-button" onClick={() => setPlayingLecture(isPlaying ? null : lecture)}>{isPlaying ? "Close player" : "▶ Watch lecture"}</button>
                <a className="student-lecture-open-link" href={url} target="_blank" rel="noreferrer">Open in new tab ↗</a>
              </div> : <p className="td-empty-state">Video is not available for this lecture yet.</p>}
              {isPlaying && <div className="student-lecture-player"><video controls autoPlay preload="metadata" src={url}><track kind="captions" /></video><p>If the video does not play, use “Open in new tab”.</p></div>}
            </article>;
          })}
        </div>}
      </div>
    </section>
  );
}

export default StudentLectures;
