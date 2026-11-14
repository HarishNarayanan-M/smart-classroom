import { useEffect, useState } from "react";
import "../App.css";

const API_BASE_URL = "http://localhost:8080/api";

function TeacherRegister({ onBackToLogin }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    employeeId: "",
    departmentId: "",
  });

  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadDepartments() {
      try {
        const response = await fetch(`${API_BASE_URL}/departments`);
        const responseText = await response.text();

        let data;
        try {
          data = responseText ? JSON.parse(responseText) : null;
        } catch {
          throw new Error(
            `Invalid departments response (HTTP ${response.status}).`
          );
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              `Failed to load departments (HTTP ${response.status}).`
          );
        }

        if (!Array.isArray(data)) {
          throw new Error("The departments API did not return a JSON array.");
        }

        setDepartments(data);
      } catch (err) {
        setError(err.message || "Unable to load departments.");
      } finally {
        setLoadingDepartments(false);
      }
    }

    loadDepartments();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/teacher`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          employeeId: form.employeeId.trim(),
          departmentId: Number(form.departmentId),
        }),
      });

      const responseText = await response.text();
      let data = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          data = { message: responseText };
        }
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Teacher registration failed. Please check your details."
        );
      }

      setSuccess(
        "Teacher registration submitted successfully. Your account is pending admin approval. You can sign in after your account is approved."
      );

      setForm({
        name: "",
        email: "",
        password: "",
        employeeId: "",
        departmentId: "",
      });
    } catch (err) {
      setError(err.message || "Unable to register teacher.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card register-card">
        <div className="brand-icon">SC</div>

        <h1>Create Teacher Account</h1>
        <p className="subtitle">
          Register to teach and manage classes in Smart Classroom.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="teacher-name">Full name</label>
          <input
            id="teacher-name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            autoComplete="name"
            required
          />

          <label htmlFor="teacher-email">Email address</label>
          <input
            id="teacher-email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            autoComplete="email"
            required
          />

          <label htmlFor="teacher-password">Password</label>
          <input
            id="teacher-password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Create a password"
            minLength={6}
            autoComplete="new-password"
            required
          />

          <label htmlFor="employeeId">Employee ID</label>
          <input
            id="employeeId"
            name="employeeId"
            value={form.employeeId}
            onChange={handleChange}
            placeholder="Enter your employee ID"
            required
          />

          <label htmlFor="teacher-departmentId">Department</label>
          <select
            id="teacher-departmentId"
            name="departmentId"
            value={form.departmentId}
            onChange={handleChange}
            required
            disabled={loadingDepartments || departments.length === 0}
          >
            <option value="">
              {loadingDepartments
                ? "Loading departments..."
                : "Select department"}
            </option>

            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name} ({department.code})
              </option>
            ))}
          </select>

          {!loadingDepartments && departments.length === 0 && (
            <p className="error-message">
              No departments found. Please contact the administrator.
            </p>
          )}

          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="success-message" role="status">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={
              submitting ||
              loadingDepartments ||
              departments.length === 0
            }
          >
            {submitting ? "Registering..." : "Register as Teacher"}
          </button>
        </form>

        <p className="register-footer">
          Already have an account?{" "}
          <button
            type="button"
            className="text-button"
            onClick={onBackToLogin}
          >
            Sign in
          </button>
        </p>
      </section>
    </main>
  );
}

export default TeacherRegister;
