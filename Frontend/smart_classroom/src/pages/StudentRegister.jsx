import { useEffect, useState } from "react";
import "../App.css";

const API_BASE_URL = "http://localhost:8080/api";

function StudentRegister({ onBackToLogin }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    registerNumber: "",
    departmentId: "",
    year: "",
    section: "",
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

        // Read the response safely, even if the body is empty.
        const text = await response.text();

        let data;

        try {
        data = text ? JSON.parse(text) : null;
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
      const response = await fetch(
        `${API_BASE_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            departmentId: Number(form.departmentId),
            year: Number(form.year),
          }),
        }
      );

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
            "Registration failed. Please check your details."
        );
      }

      setSuccess(
        "Student registered successfully! You can now sign in."
      );

      setForm({
        name: "",
        email: "",
        password: "",
        registerNumber: "",
        departmentId: "",
        year: "",
        section: "",
      });
    } catch (err) {
      setError(err.message || "Unable to register student.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card register-card">
        <div className="brand-icon">SC</div>

        <h1>Create Student Account</h1>
        <p className="subtitle">
          Register to access your Smart Classroom.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Full name</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />

          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Create a password"
            minLength={6}
            required
          />

          <label htmlFor="registerNumber">Register number</label>
          <input
            id="registerNumber"
            name="registerNumber"
            value={form.registerNumber}
            onChange={handleChange}
            placeholder="Enter your register number"
            required
          />

          <label htmlFor="departmentId">Department</label>
          <select
            id="departmentId"
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
              No departments found. Please add a department first.
            </p>
          )}

          <label htmlFor="year">Year of study</label>
          <select
            id="year"
            name="year"
            value={form.year}
            onChange={handleChange}
            required
          >
            <option value="">Select year</option>
            <option value="1">First Year</option>
            <option value="2">Second Year</option>
            <option value="3">Third Year</option>
            <option value="4">Fourth Year</option>
          </select>

          <label htmlFor="section">Section</label>
          <input
            id="section"
            name="section"
            value={form.section}
            onChange={handleChange}
            placeholder="For example, A"
            required
          />

          {error && (
            <p className="error-message">{error}</p>
          )}

          {success && (
            <p className="success-message">{success}</p>
          )}

          <button
            type="submit"
            disabled={submitting || loadingDepartments || departments.length === 0}
          >
            {submitting ? "Registering..." : "Register"}
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

export default StudentRegister;
