
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

function Payments() {
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    member: "",
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "UPI",
    status: "Paid"
  });

  // Get JWT Token
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

  // Common API Request
  const apiRequest = async (url, options = {}) => {
    const token = getToken();

    if (!token) {
      throw new Error("Please login first!");
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers
      }
    });

    const result = await response.json();

    if (!response.ok || result.success === false) {
      throw new Error(result.message || "Something went wrong");
    }

    return result;
  };

  // Fetch Members and Payments
  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const [paymentResult, memberResult] = await Promise.all([
        apiRequest(`${API_URL}/payments`),
        apiRequest(`${API_URL}/members`)
      ]);

      setPayments(
        Array.isArray(paymentResult.data)
          ? paymentResult.data
          : Array.isArray(paymentResult)
            ? paymentResult
            : []
      );

      setMembers(
        Array.isArray(memberResult.data)
          ? memberResult.data
          : Array.isArray(memberResult)
            ? memberResult
            : []
      );

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add Payment
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const paymentData = {
        member: form.member,
        amount: Number(form.amount),
        paymentDate: new Date(
          form.paymentDate + "T12:00:00"
        ).toISOString(),
        paymentMethod: form.paymentMethod,
        status: form.status
      };

      await apiRequest(`${API_URL}/payments`, {
        method: "POST",
        body: JSON.stringify(paymentData)
      });

      setMessage("Payment added successfully!");

      setForm({
        member: "",
        amount: "",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: "UPI",
        status: "Paid"
      });

      await fetchData();

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Update Payment Status
  const updateStatus = async (id, status) => {
    setError("");
    setMessage("");

    try {
      await apiRequest(`${API_URL}/payments/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status })
      });

      setMessage("Payment status updated!");
      await fetchData();

    } catch (err) {
      setError(err.message);
    }
  };

  // Delete Payment
  const deletePayment = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this payment?"
    );

    if (!confirmDelete) return;

    setError("");
    setMessage("");

    try {
      await apiRequest(`${API_URL}/payments/${id}`, {
        method: "DELETE"
      });

      setMessage("Payment deleted successfully!");
      await fetchData();

    } catch (err) {
      setError(err.message);
    }
  };

  // Total Collected
  const total = payments
    .filter((p) => p.status === "Paid")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN");
  };

  return (
    <div className="page-content">

      <h2>Payments Management</h2>
      <p>Manage gym fee payments and transactions.</p>

      {/* Total Collection */}
      <div className="stat-card payment-total">
        <p>Total Collected</p>
        <h2>₹{total.toLocaleString("en-IN")}</h2>
      </div>

      {/* Messages */}
      {message && (
        <p style={{ color: "green" }}>{message}</p>
      )}

      {error && (
        <p style={{ color: "red" }}>{error}</p>
      )}

      {/* Add Payment Form */}
      <form className="form-card" onSubmit={handleSubmit}>

        <h3>Add Payment</h3>

        <div className="form-grid">

          <select
            value={form.member}
            onChange={(e) =>
              setForm({ ...form, member: e.target.value })
            }
            required
          >
            <option value="">Select Member</option>

            {members.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Amount"
            min="1"
            value={form.amount}
            onChange={(e) =>
              setForm({ ...form, amount: e.target.value })
            }
            required
          />

          <input
            type="date"
            value={form.paymentDate}
            onChange={(e) =>
              setForm({ ...form, paymentDate: e.target.value })
            }
            required
          />

          <select
            value={form.paymentMethod}
            onChange={(e) =>
              setForm({ ...form, paymentMethod: e.target.value })
            }
          >
            <option value="UPI">UPI</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cheque">Cheque</option>
          </select>

          <select
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value })
            }
          >
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>

          <button
            className="primary-btn"
            type="submit"
            disabled={saving || members.length === 0}
          >
            {saving ? "Saving..." : "Add Payment"}
          </button>

        </div>
      </form>

      {/* Payment History */}
      <div className="section-card">

        <div className="page-heading">
          <h3>Payment History</h3>

          <button
            className="primary-btn"
            onClick={fetchData}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <p>Loading payments...</p>
        ) : (
          <div className="table-wrapper">

            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="6">No payments found.</td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p._id}>

                      <td>
                        {p.member?.name || "Unknown Member"}
                      </td>

                      <td>
                        ₹{Number(p.amount).toLocaleString("en-IN")}
                      </td>

                      <td>{formatDate(p.paymentDate)}</td>

                      <td>{p.paymentMethod}</td>

                      <td>
                        <select
                          value={p.status}
                          onChange={(e) =>
                            updateStatus(p._id, e.target.value)
                          }
                        >
                          <option value="Paid">Paid</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() => deletePayment(p._id)}
                        >
                          Delete
                        </button>
                      </td>

                    </tr>
                  ))
                )}

              </tbody>
            </table>

          </div>
        )}

      </div>

    </div>
  );
}

export default Payments;
