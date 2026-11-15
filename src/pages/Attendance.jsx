
import { useState, useEffect } from "react";

const API_URL = "http://localhost:5000/api/attendance";

function Attendance() {
  const [records, setRecords] = useState([]);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("Present");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get JWT token
  const getToken = () => {
    try {
      const authData = localStorage.getItem("fitzoneAdmin");

      if (!authData) return null;

      const parsedData = JSON.parse(authData);

      return typeof parsedData === "string"
        ? parsedData
        : parsedData.token || parsedData.accessToken || null;

    } catch {
      return localStorage.getItem("fitzoneAdmin");
    }
  };

  // Fetch attendance records
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Please login first!");
      }

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch attendance");
      }

      setRecords(
        Array.isArray(result.data) ? result.data : []
      );

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // Mark attendance
  const markAttendance = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter member name");
      return;
    }

    try {
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Please login first!");
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          memberName: name.trim(),
          date: new Date().toISOString().slice(0, 10),
          status
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to mark attendance");
      }

      alert("Attendance marked successfully!");

      setName("");
      setStatus("Present");

      await fetchAttendance();

    } catch (err) {
      setError(err.message);
    }
  };

  // Delete attendance record
  const deleteAttendance = async (id) => {
    if (!window.confirm("Delete this attendance record?")) {
      return;
    }

    try {
      setError("");

      const token = getToken();

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Delete failed");
      }

      alert("Attendance deleted successfully!");

      await fetchAttendance();

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-content">

      <div className="page-heading">
        <div>
          <h2>Attendance Management</h2>
          <p>Track daily gym attendance.</p>
        </div>
      </div>

      {error && (
        <p style={{ color: "red", margin: "15px 0" }}>
          {error}
        </p>
      )}

      {/* Mark Attendance Form */}
      <form
        className="form-card"
        onSubmit={markAttendance}
      >
        <h3>Mark Attendance</h3>

        <div className="form-grid">

          <input
            type="text"
            placeholder="Enter Member Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>

          <button
            className="primary-btn"
            type="submit"
          >
            Mark Attendance
          </button>

        </div>
      </form>

      {/* Attendance Records */}
      <div className="section-card">

        <div className="page-heading">
          <h3>Attendance Records ({records.length})</h3>

          <button
            className="primary-btn"
            type="button"
            onClick={fetchAttendance}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="table-wrapper">

          <table>

            <thead>
              <tr>
                <th>Member</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td colSpan="4">Loading attendance...</td>
                </tr>

              ) : records.length > 0 ? (

                records.map((record) => (

                  <tr key={record._id}>

                    <td>{record.memberName}</td>

                    <td>
                      {new Date(record.date).toLocaleDateString("en-IN")}
                    </td>

                    <td>
                      <span
                        className={`status ${record.status.toLowerCase()}`}
                      >
                        {record.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="delete-btn"
                        type="button"
                        onClick={() => deleteAttendance(record._id)}
                      >
                        Delete
                      </button>
                    </td>

                  </tr>

                ))

              ) : (
                <tr>
                  <td colSpan="4">No attendance records found.</td>
                </tr>
              )}

            </tbody>

          </table>

        </div>
      </div>

    </div>
  );
}

export default Attendance;
