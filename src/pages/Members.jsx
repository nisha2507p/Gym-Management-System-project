
import { useState, useEffect } from "react";
import { apiFetch } from "../utils/api";

const API_URL = "/api/members";

function Members() {
  const initialForm = {
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "Male",
    plan: "Basic",
    status: "Active",
    fee: ""
  };

  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all members
  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch(API_URL);
      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Failed to fetch members");
      }

      setMembers(
        Array.isArray(result)
          ? result
          : Array.isArray(result.data)
          ? result.data
          : []
      );
    } catch (err) {
      setError(err.message || "Backend connection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Add or update member
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const memberData = {
        ...form,
        age: Number(form.age),
        fee: Number(form.fee)
      };

      const url = editId
        ? `${API_URL}/${editId}`
        : API_URL;

      const method = editId ? "PUT" : "POST";

      const response = await apiFetch(url, {
        method,
        body: JSON.stringify(memberData)
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Operation failed");
      }

      alert(
        editId
          ? "Member updated successfully!"
          : "Member added successfully!"
      );

      setForm(initialForm);
      setEditId(null);

      await fetchMembers();

    } catch (err) {
      setError(err.message);
    }
  };

  // Edit member
  const editMember = (member) => {
    setForm({
      name: member.name || "",
      email: member.email || "",
      phone: member.phone || "",
      age: member.age ?? "",
      gender: member.gender || "Male",
      plan: member.plan || "Basic",
      status: member.status || "Active",
      fee: member.fee ?? ""
    });

    setEditId(member._id);
  };

  // Delete member
  const deleteMember = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this member?"
    );

    if (!confirmDelete) return;

    try {
      setError("");

      const response = await apiFetch(`${API_URL}/${id}`, {
        method: "DELETE"
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Delete failed");
      }

      alert("Member deleted successfully!");

      await fetchMembers();

    } catch (err) {
      setError(err.message);
    }
  };

  // Search members
  const filtered = members.filter((member) =>
    member.name?.toLowerCase().includes(search.toLowerCase()) ||
    member.email?.toLowerCase().includes(search.toLowerCase()) ||
    member.phone?.includes(search)
  );

  return (
    <div className="page-content">

      <div className="page-heading">
        <div>
          <h2>Members Management</h2>
          <p>Add and manage gym members.</p>
        </div>
      </div>

      {error && (
        <p style={{ color: "red" }}>{error}</p>
      )}

      <form className="form-card" onSubmit={handleSubmit}>
        <h3>{editId ? "Update Member" : "Add New Member"}</h3>

        <div className="form-grid">

          <input
            name="name"
            placeholder="Member Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            name="phone"
            type="tel"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            required
          />

          <input
            name="age"
            type="number"
            placeholder="Age"
            value={form.age}
            onChange={handleChange}
            min="1"
            required
          />

          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <select
            name="plan"
            value={form.plan}
            onChange={handleChange}
          >
            <option value="Basic">Basic</option>
            <option value="Premium">Premium</option>
            <option value="Pro">Pro</option>
            <option value="Gold">Gold</option>
          </select>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <input
            name="fee"
            type="number"
            placeholder="Membership Fee"
            value={form.fee}
            onChange={handleChange}
            min="0"
            required
          />

          <button className="primary-btn" type="submit">
            {editId ? "Update Member" : "Add Member"}
          </button>

          {editId && (
            <button
              type="button"
              className="delete-btn"
              onClick={() => {
                setEditId(null);
                setForm(initialForm);
              }}
            >
              Cancel Edit
            </button>
          )}

        </div>
      </form>

      <div className="section-card">

        <div className="page-heading">
          <h3>All Members ({members.length})</h3>

          <input
            className="search-box"
            placeholder="Search member..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-wrapper">
          <table>

            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Plan</th>
                <th>Fee</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td colSpan="7">Loading members...</td>
                </tr>
              ) : filtered.length > 0 ? (

                filtered.map((member) => (
                  <tr key={member._id}>

                    <td>{member.name}</td>
                    <td>{member.email}</td>
                    <td>{member.phone}</td>
                    <td>{member.plan}</td>
                    <td>₹{member.fee}</td>

                    <td>
                      <span
                        className={`status ${
                          member.status === "Active"
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => editMember(member)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => deleteMember(member._id)}
                      >
                        Delete
                      </button>
                    </td>

                  </tr>
                ))

              ) : (
                <tr>
                  <td colSpan="7">No members found.</td>
                </tr>
              )}

            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}

export default Members;
