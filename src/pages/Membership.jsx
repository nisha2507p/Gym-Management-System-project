
import { useState, useEffect } from "react";

const API_URL = "http://localhost:5000/api";

function Membership() {
  const plans = [
    {
      name: "Monthly Plan",
      price: 1000,
      duration: "1 Month",
      months: 1,
      features: "Gym Access, Basic Training",
    },
    {
      name: "Quarterly Plan",
      price: 2700,
      duration: "3 Months",
      months: 3,
      features: "Gym Access, Personal Guidance",
    },
    {
      name: "Yearly Plan",
      price: 9000,
      duration: "12 Months",
      months: 12,
      features: "Full Gym Access, Trainer Support",
    },
  ];

  const [members, setMembers] = useState([]);
  const [memberships, setMemberships] = useState([]);

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [memberName, setMemberName] = useState("");
  const [startDate, setStartDate] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch Members and Memberships
  const fetchData = async () => {
    try {
      setError("");

      const [membersRes, membershipsRes] = await Promise.all([
        fetch(`${API_URL}/members`),
        fetch(`${API_URL}/memberships`),
      ]);

      if (!membersRes.ok || !membershipsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const [membersResult, membershipsResult] = await Promise.all([
        membersRes.json(),
        membershipsRes.json(),
      ]);

      setMembers(
        Array.isArray(membersResult)
          ? membersResult
          : membersResult.data || []
      );

      setMemberships(
        Array.isArray(membershipsResult)
          ? membershipsResult
          : membershipsResult.data || []
      );
    } catch (err) {
      setError(err.message || "Backend connection failed");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate End Date
  const calculateEndDate = () => {
    if (!startDate || !selectedPlan) return "";

    const date = new Date(startDate + "T12:00:00");

    date.setMonth(date.getMonth() + selectedPlan.months);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // Reset Form
  const resetForm = () => {
    setSelectedPlan(null);
    setMemberName("");
    setStartDate("");
    setEditingId(null);
  };

  // Add or Update Membership
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPlan || !memberName || !startDate) {
      setMessage("Please fill all details.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setError("");

      const url = editingId
        ? `${API_URL}/memberships/${editingId}`
        : `${API_URL}/memberships`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberName,
          plan: selectedPlan.name.replace(" Plan", ""),
          amount: selectedPlan.price,
          duration: selectedPlan.duration,
          startDate,
          endDate: calculateEndDate(),
          status: "Active",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Membership operation failed");
      }

      setMessage(
        editingId
          ? "Membership updated successfully!"
          : "Membership added successfully!"
      );

      resetForm();

      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Edit Membership
  const handleEdit = (item) => {
    const plan = plans.find(
      (p) => p.name.replace(" Plan", "") === item.plan
    );

    if (!plan) {
      setError("This membership plan is not available.");
      return;
    }

    setSelectedPlan(plan);
    setMemberName(item.memberName || "");

    if (item.startDate) {
      const date = new Date(item.startDate);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      setStartDate(`${year}-${month}-${day}`);
    }

    setEditingId(item._id);
    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Delete Membership
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this membership?"
    );

    if (!confirmDelete) return;

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/memberships/${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Delete failed");
      }

      setMessage("Membership deleted successfully!");

      if (editingId === id) {
        resetForm();
      }

      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-content">

      <h2>Membership Plans</h2>
      <p>Choose and manage gym membership plans.</p>

      {message && (
        <p className="membership-success">{message}</p>
      )}

      {error && (
        <p className="membership-error">{error}</p>
      )}

      {/* Membership Plans */}
      <div className="plans-grid">

        {plans.map((plan) => (
          <div className="plan-card" key={plan.name}>

            <div className="plan-icon">🎫</div>

            <h3>{plan.name}</h3>

            <h1>
              ₹{plan.price.toLocaleString("en-IN")}
            </h1>

            <p>{plan.duration}</p>

            <div className="plan-feature">
              {plan.features}
            </div>

            <button
              className="primary-btn"
              onClick={() => {
                setSelectedPlan(plan);
                setMemberName("");
                setStartDate("");
                setEditingId(null);
                setMessage("");
                setError("");
              }}
            >
              Select Plan
            </button>

          </div>
        ))}

      </div>

      {/* Add / Edit Membership Form */}
      {selectedPlan && (
        <div className="section-card membership-form">

          <h3>
            {editingId ? "Edit Membership" : "Add Membership"}
            {" - "}
            {selectedPlan.name}
          </h3>

          <form onSubmit={handleSubmit}>

            <label>Select Member</label>

            <select
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              required
            >
              <option value="">Choose Member</option>

              {members.map((member) => (
                <option key={member._id} value={member.name}>
                  {member.name}
                </option>
              ))}

            </select>

            <label>Selected Plan</label>

            <input
              type="text"
              value={selectedPlan.name}
              readOnly
            />

            <label>Amount</label>

            <input
              type="text"
              value={`₹${selectedPlan.price.toLocaleString("en-IN")}`}
              readOnly
            />

            <label>Start Date</label>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />

            <label>End Date</label>

            <input
              type="date"
              value={calculateEndDate()}
              readOnly
            />

            <div className="membership-actions">

              <button
                type="submit"
                className="primary-btn"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : editingId
                    ? "Update Membership"
                    : "Save Membership"}
              </button>

              <button
                type="button"
                className="cancel-btn"
                onClick={resetForm}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>
      )}

      {/* Membership List */}
      <div className="section-card membership-list">

        <h3>Membership List</h3>

        <div className="table-wrapper">

          <table>

            <thead>
              <tr>
                <th>Member Name</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {memberships.length > 0 ? (

                memberships.map((item) => (

                  <tr key={item._id}>

                    <td>{item.memberName || "-"}</td>

                    <td>{item.plan || "-"}</td>

                    <td>
                      ₹{Number(item.amount || 0).toLocaleString("en-IN")}
                    </td>

                    <td>
                      {item.startDate
                        ? new Date(item.startDate).toLocaleDateString("en-IN")
                        : "-"}
                    </td>

                    <td>
                      {item.endDate
                        ? new Date(item.endDate).toLocaleDateString("en-IN")
                        : "-"}
                    </td>

                    <td>
                      <span
                        className={`status ${
                          item.status?.toLowerCase() || ""
                        }`}
                      >
                        {item.status || "Unknown"}
                      </span>
                    </td>

                    <td>

                      <button
                        type="button"
                        className="edit-btn"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => handleDelete(item._id)}
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>
                  <td colSpan="7">
                    No memberships found.
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* Refresh Button */}
      <button
        className="primary-btn"
        onClick={fetchData}
      >
        🔄 Refresh Memberships
      </button>

    </div>
  );
}

export default Membership;
