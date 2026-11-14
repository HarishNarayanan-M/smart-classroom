
function LiveClassCard({ liveClass, onJoin }) {
  const startTime = new Date(liveClass.startTime);
  const endTime = new Date(liveClass.endTime);

  return (
    <article className="live-class-card">
      <div className="live-class-icon">
        <span>▶</span>
      </div>

      <div className="live-class-info">
        <h3>{liveClass.title}</h3>

        <p>{liveClass.courseName}</p>

        <p>Teacher: {liveClass.teacherName}</p>

        <p>
          {startTime.toLocaleString()} –{" "}
          {endTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        <span className="live-class-status">
          {liveClass.status}
        </span>
      </div>

      <button
        type="button"
        className="join-class-button"
        onClick={() => onJoin(liveClass)}
        disabled={liveClass.status !== "SCHEDULED"}
      >
        Join Class
      </button>
    </article>
  );
}

export default LiveClassCard;
