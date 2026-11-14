
import { useState } from "react";
import { loginUser } from "./services/authService";
import StudentDashboard from "./pages/StudentDashboard";
import StudentRegister from "./pages/StudentRegister";
import TeacherRegister from "./pages/TeacherRegister";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!savedUser || !token) return null;

    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return null;
    }
  });

  // null = login, student = student registration,
  // teacher = teacher registration, choose = registration selection
  const [authView, setAuthView] = useState("login");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(email, password);

      localStorage.setItem("token", data.token);

      const userData = {
        userId: data.userId,
        studentId: data.studentId,
        teacherId: data.teacherId,
        name: data.name,
        email: data.email,
        role: data.role,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch (err) {
      setError(err.message || "Unable to log in.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setEmail("");
    setPassword("");
    setError("");
    setAuthView("login");
  }

  if (user) {
    if (user.role === "STUDENT") {
      return (
        <StudentDashboard user={user} onLogout={handleLogout} />
      );
    }

    if (user.role === "TEACHER") {
      return (
        <TeacherDashboard user={user} onLogout={handleLogout} />
      );
    }

    if (user.role === "ADMIN") {
      return (
        <AdminDashboard user={user} onLogout={handleLogout} />
      );
    }

    return (
      <main className="login-page">
        <section className="login-card">
          <div className="brand-icon">SC</div>
          <h1>Welcome, {user.name}!</h1>
          <p>Signed in as {user.role}</p>
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </section>
      </main>
    );
  }

  const backToLogin = () => {
    setAuthView("login");
    setError("");
  };

  if (authView === "student") {
    return <StudentRegister onBackToLogin={backToLogin} />;
  }

  if (authView === "teacher") {
    return <TeacherRegister onBackToLogin={backToLogin} />;
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="brand-icon">SC</div>

        <h1>Smart Classroom</h1>
        <p className="subtitle">
          Your learning space, all in one place.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="auth-register-section">
          <p>New to Smart Classroom?</p>

          <button
            type="button"
            className="text-button"
            onClick={() => setAuthView("choose")}
          >
            Create an account
          </button>
        </div>

        {authView === "choose" && (
          <div className="registration-options">
            <h3>Choose account type</h3>

            <button
              type="button"
              onClick={() => setAuthView("student")}
            >
              Register as Student
            </button>

            <button
              type="button"
              onClick={() => setAuthView("teacher")}
            >
              Register as Teacher
            </button>

            <button
              type="button"
              className="text-button"
              onClick={backToLogin}
            >
              Back to sign in
            </button>
          </div>
        )}

        <p className="login-footer">
          Smart learning. Better opportunities.
        </p>
      </section>
    </main>
  );
}

export default App;
