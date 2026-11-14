function CourseCard({ course, liveClassCount, onClick }) {
  return (
    <button
      type="button"
      className="course-card"
      onClick={onClick}
    >
      <div className="course-card-icon">
        <span>{course.name?.charAt(0)?.toUpperCase() || "C"}</span>
      </div>

      <div className="course-card-info">
        <h3>{course.name}</h3>
        <p>{course.code}</p>
        <span className="course-card-meta">
          {liveClassCount} scheduled{" "}
          {liveClassCount === 1 ? "class" : "classes"}
        </span>
      </div>

      <span className="course-card-arrow">›</span>
    </button>
  );
}

export default CourseCard;
