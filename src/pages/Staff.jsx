
import { useState } from "react";

export default function Staff() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const saved = JSON.parse(
        localStorage.getItem("fitzoneAdmin") || "null"
      );

      if (!saved?.token) {
        throw new Error("Please login as Admin again");
      }

      const response = await fetch(
        "http://localhost:5000/api/auth/staff",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${saved.token}`
          },
          body: JSON.stringify(form)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Staff creation failed");
      }

      setMessage(data.message);
      setForm({ name: "", email: "", password: "" });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Staff Management</h2>
      <p>Create and manage your gym staff accounts.</p>

      <div style={{
        background: "white",
        padding: "25px",
        borderRadius: "15px",
        maxWidth: "650px",
        marginTop: "25px"
      }}>
        <h3>Create Staff Account</h3>

        <form onSubmit={handleSubmit}>
          <input
            style={inputStyle}
            placeholder="Staff Full Name"
            value={form.name}
            onChange={e => setForm({
              ...form, name: e.target.value
            })}
            required
          />

          <input
            style={inputStyle}
            type="email"
            placeholder="Staff Email"
            value={form.email}
            onChange={e => setForm({
              ...form, email: e.target.value
            })}
            required
          />

          <input
            style={inputStyle}
            type="password"
            placeholder="Password (minimum 8 characters)"
            value={form.password}
            onChange={e => setForm({
              ...form, password: e.target.value
            })}
            minLength={8}
            required
          />

          {message && <p style={{ color: "green" }}>{message}</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#2563eb",
              color: "white",
              padding: "13px 25px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            {loading ? "Creating..." : "Create Staff"}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "13px",
  margin: "15px 0",
  border: "1px solid #ddd",
  borderRadius: "8px",
  boxSizing: "border-box"
};
