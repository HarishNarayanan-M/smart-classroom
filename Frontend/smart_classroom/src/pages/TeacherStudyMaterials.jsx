
import { useEffect, useState } from "react";
import "./TeacherStudyMaterials.css";

import { getTeacherCourses } from "../services/teacherService";
import {
  getStudyMaterialsByCourse,
  uploadStudyMaterial,
  deleteStudyMaterial,
} from "../services/studyMaterialService";

const API_SERVER_URL = "http://localhost:8080";

function TeacherStudyMaterials() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [materials, setMaterials] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadCourses() {
      try {
        setError("");
        const token = localStorage.getItem("token");
        const data = await getTeacherCourses(token);

        setCourses(data);

        if (data.length > 0) {
          setSelectedCourseId(String(data[0].id));
        }
      } catch (err) {
        setError(err.message || "Failed to load courses.");
      } finally {
        setLoadingCourses(false);
      }
    }

    loadCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) {
      setMaterials([]);
      return;
    }

    async function loadMaterials() {
      try {
        setLoadingMaterials(true);
        setError("");
        setMaterials([]);

        const data = await getStudyMaterialsByCourse(selectedCourseId);
        setMaterials(data);
      } catch (err) {
        setError(err.message || "Failed to load study materials.");
      } finally {
        setLoadingMaterials(false);
      }
    }

    loadMaterials();
  }, [selectedCourseId]);

  async function handleUpload(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!selectedCourseId) {
      setError("Please select a course.");
      return;
    }

    if (!title.trim() || !file) {
      setError("Please enter a title and select a file.");
      return;
    }

    const allowedExtensions = ["pdf", "ppt", "pptx"];
    const extension = file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setError("Only PDF, PPT, and PPTX files are allowed.");
      return;
    }

    try {
      setUploading(true);

      await uploadStudyMaterial(selectedCourseId, {
        title: title.trim(),
        description: description.trim(),
        file,
      });

      setTitle("");
      setDescription("");
      setFile(null);

      const fileInput = document.getElementById("material-file");
      if (fileInput) fileInput.value = "";

      const updatedMaterials =
        await getStudyMaterialsByCourse(selectedCourseId);

      setMaterials(updatedMaterials);
      setMessage("Study material uploaded successfully.");
    } catch (err) {
      setError(err.message || "Failed to upload study material.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(materialId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this study material?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      setDeletingId(materialId);

      await deleteStudyMaterial(selectedCourseId, materialId);

      setMaterials((previous) =>
        previous.filter((material) => material.id !== materialId)
      );

      setMessage("Study material deleted successfully.");
    } catch (err) {
      setError(err.message || "Failed to delete study material.");
    } finally {
      setDeletingId(null);
    }
  }

  function getFileUrl(fileUrl) {
    if (!fileUrl) return "#";

    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
      return fileUrl;
    }

    return `${API_SERVER_URL}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
  }

  function getFileType(material) {
    if (material.fileType) {
      return material.fileType.split("/").pop().toUpperCase();
    }

    const url = material.fileUrl || "";
    return url.split(".").pop().split("?")[0].toUpperCase();
  }

  if (loadingCourses) {
    return <div className="materials-page"><p>Loading courses...</p></div>;
  }

  return (
    <main className="materials-page">
      <header className="materials-header">
        <div>
          <p className="materials-eyebrow">TEACHER WORKSPACE</p>
          <h1>Study Materials</h1>
          <p>Upload and manage notes, presentations, and learning resources.</p>
        </div>

        <div className="materials-count">
          <span>{materials.length}</span>
          <small>Materials</small>
        </div>
      </header>

      {error && <div className="materials-alert error">{error}</div>}
      {message && <div className="materials-alert success">{message}</div>}

      <section className="materials-course-section">
        <label htmlFor="course-select">Select course</label>

        {courses.length === 0 ? (
          <p>No courses have been assigned to you yet.</p>
        ) : (
          <select
            id="course-select"
            value={selectedCourseId}
            onChange={(event) => {
              setSelectedCourseId(event.target.value);
              setMessage("");
            }}
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name} {course.code ? `(${course.code})` : ""}
              </option>
            ))}
          </select>
        )}
      </section>

      <div className="materials-layout">
        <section className="materials-card upload-card">
          <div className="materials-section-heading">
            <span className="materials-icon">↑</span>
            <div>
              <h2>Upload material</h2>
              <p>Share resources with students enrolled in this course.</p>
            </div>
          </div>

          <form onSubmit={handleUpload}>
            <label htmlFor="material-title">Material title</label>
            <input
              id="material-title"
              type="text"
              placeholder="e.g. DBMS Unit 1 Notes"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={150}
              required
            />

            <label htmlFor="material-description">Description</label>
            <textarea
              id="material-description"
              placeholder="Briefly describe this material..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
            />

            <label htmlFor="material-file">Choose file</label>
            <input
              id="material-file"
              type="file"
              accept=".pdf,.ppt,.pptx"
              onChange={(event) =>
                setFile(event.target.files?.[0] || null)
              }
              required
            />

            <p className="materials-hint">
              Accepted formats: PDF, PPT, PPTX
            </p>

            <button
              className="materials-primary-button"
              type="submit"
              disabled={uploading || !selectedCourseId}
            >
              {uploading ? "Uploading..." : "Upload material"}
            </button>
          </form>
        </section>

        <section className="materials-card library-card">
          <div className="materials-section-heading">
            <span className="materials-icon">▤</span>
            <div>
              <h2>Course library</h2>
              <p>Materials available for the selected course.</p>
            </div>
          </div>

          {loadingMaterials ? (
            <p className="materials-empty">Loading materials...</p>
          ) : materials.length === 0 ? (
            <div className="materials-empty">
              <span className="materials-empty-icon">▧</span>
              <h3>No materials yet</h3>
              <p>Upload your first PDF or presentation using the form.</p>
            </div>
          ) : (
            <div className="materials-list">
              {materials.map((material) => (
                <article className="material-item" key={material.id}>
                  <div className="material-file-icon">
                    {getFileType(material).includes("PDF") ? "PDF" : "PPT"}
                  </div>

                  <div className="material-details">
                    <h3>{material.title}</h3>
                    <p>
                      {material.description || "No description provided."}
                    </p>
                    <span className="material-type">
                      {getFileType(material)}
                    </span>
                  </div>

                  <div className="material-actions">
                    {material.fileUrl ? (
                      <a
                        className="materials-view-link"
                        href={getFileUrl(material.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                    ) : (
                      <span className="materials-hint">No file</span>
                    )}

                    <button
                      className="materials-delete-button"
                      type="button"
                      onClick={() => handleDelete(material.id)}
                      disabled={deletingId === material.id}
                    >
                      {deletingId === material.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default TeacherStudyMaterials;
