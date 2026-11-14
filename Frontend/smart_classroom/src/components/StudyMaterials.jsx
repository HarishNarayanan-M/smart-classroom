
import { useEffect, useState } from "react";
import { getStudyMaterialsByCourse } from "../services/studyMaterialService";

function StudyMaterials({ courseId }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadMaterials() {
      setLoading(true);
      setError("");

      try {
        const data = await getStudyMaterialsByCourse(courseId);

        if (!cancelled) {
          setMaterials(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load study materials.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMaterials();

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  if (loading) {
    return <p>Loading study materials...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (materials.length === 0) {
    return <p>No study materials available for this course yet.</p>;
  }

  return (
    <div className="study-material-list">
      {materials.map((material) => (
        <article className="study-material-card" key={material.id}>
          <div className="study-material-info">
            <h3>{material.title}</h3>

            <p>
              {material.description || "No description available."}
            </p>

            <span className="study-material-type">
              {material.fileType?.includes("pdf")
                ? "PDF"
                : material.fileType?.includes("presentation")
                  ? "PowerPoint"
                  : material.fileType || "File"}
            </span>
          </div>

          <a
            className="study-material-download"
            href={`http://localhost:8080${material.fileUrl}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open / Download
          </a>
        </article>
      ))}
    </div>
  );
}

export default StudyMaterials;
