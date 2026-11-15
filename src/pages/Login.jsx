
import { useState } from "react";

export default function Login({ onLogin, onRegister }) {
  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, password })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login failed");
      }

      if (!data.token || !data.user) {
        throw new Error("Invalid login response");
      }

      if (data.user.role !== role) {
        throw new Error(
          `This account is not registered as ${role}`
        );
      }

      onLogin(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>FITZONE</h1>

        <p>
          {role.charAt(0).toUpperCase() + role.slice(1)} Login
        </p>

        <label>Login As</label>

        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setError("");
          }}
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: "20px",
            borderRadius: "8px"
          }}
        >
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="member">Member</option>
        </select>

        <label>Email Address</label>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>

        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <p className="login-error">{error}</p>
        )}

        <button type="submit" disabled={loading}>
          {loading
            ? "Logging in..."
            : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`
          }
        </button>

        {role === "member" && (
          <p style={{ marginTop: "20px" }}>
            New Member?{" "}
            <button
              type="button"
              onClick={onRegister}
              style={{
                background: "none",
                border: "none",
                color: "#2563eb",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Create Account
            </button>
          </p>
        )}
      </form>
    </div>
  );
}
