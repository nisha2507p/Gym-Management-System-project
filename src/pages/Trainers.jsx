
import { useState, useEffect } from "react";

const API_URL = "http://localhost:5000/api/trainers";

function Trainers() {
  const initialForm = {
    name: "",
    specialization: "",
    phone: "",
    salary: "",
    paymentDate: "",
    paymentMethod: ""
  };

  const [trainers, setTrainers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  // Common headers
  const getHeaders = (json = false) => {
    const token = getToken();

    return {
      ...(json && { "Content-Type": "application/json" }),
      Authorization: `Bearer ${token}`
    };
  };

  // Fetch Trainers
  const fetchTrainers = async () => {
    try {
      const token = getToken();

      if (!token) {
        setError("Please login first!");
        setTrainers([]);
        return;
      }

      setLoading(true);
      setError("");

      const response = await fetch(API_URL, {
        method: "GET",
        headers: getHeaders()
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch trainers");
      }

      setTrainers(
        Array.isArray(result.data) ? result.data : []
      );

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  // Handle Input
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Add / Update Trainer
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = getToken();

      if (!token) {
        setError("Please login first!");
        return;
      }

      setError("");

      const trainerData = {
        ...form,
        salary: Number(form.salary)
      };

      const url = editId
        ? `${API_URL}/${editId}`
        : API_URL;

      const method = editId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: getHeaders(true),
        body: JSON.stringify(trainerData)
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Operation failed");
      }

      alert(
        editId
          ? "Trainer updated successfully!"
          : "Trainer added successfully!"
      );

      setForm(initialForm);
      setEditId(null);

      await fetchTrainers();

    } catch (err) {
      setError(err.message);
    }
  };

  // Edit Trainer
  const editTrainer = (trainer) => {
    setForm({
      name: trainer.name || "",
      specialization: trainer.specialization || "",
      phone: trainer.phone || "",
      salary: trainer.salary ?? "",
      paymentDate: trainer.paymentDate
        ? trainer.paymentDate.slice(0, 10)
        : "",
      paymentMethod: trainer.paymentMethod || ""
    });

    setEditId(trainer._id);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Delete Trainer
  const deleteTrainer = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this trainer?"
    );

    if (!confirmDelete) return;

    try {
      const token = getToken();

      if (!token) {
        setError("Please login first!");
        return;
      }

      setError("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: getHeaders()
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Delete failed");
      }

      alert("Trainer deleted successfully!");

      await fetchTrainers();

    } catch (err) {
      setError(err.message);
    }
  };

  // Search Trainers
  const filtered = trainers.filter((trainer) =>
    trainer.name?.toLowerCase().includes(search.toLowerCase()) ||
    trainer.specialization?.toLowerCase().includes(search.toLowerCase()) ||
    trainer.phone?.includes(search)
  );

  return (
    <div className="page-content">

      <div className="page-heading">
        <div>
          <h2>Trainers Management</h2>
          <p>Add and manage gym trainers.</p>
        </div>
      </div>

      {error && (
        <p style={{ color: "red" }}>{error}</p>
      )}

      {/* Trainer Form */}
      <form className="form-card" onSubmit={handleSubmit}>

        <h3>
          {editId ? "Update Trainer" : "Add New Trainer"}
        </h3>

        <div className="form-grid">

          <input
            name="name"
            placeholder="Trainer Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="specialization"
            placeholder="Specialization"
            value={form.specialization}
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
            name="salary"
            type="number"
            placeholder="Monthly Salary"
            value={form.salary}
            onChange={handleChange}
            min="0"
            required
          />

          <label>
            Payment Date
            <input
              name="paymentDate"
              type="date"
              value={form.paymentDate}
              onChange={handleChange}
              required
            />
          </label>

          <select
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handleChange}
            required
          >
            <option value="">Select Payment Method</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cheque">Cheque</option>
          </select>

          <button
            className="primary-btn"
            type="submit"
          >
            {editId ? "Update Trainer" : "Add Trainer"}
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

      {/* Trainers Table */}
      <div className="section-card">

        <div className="page-heading">
          <h3>All Trainers ({trainers.length})</h3>

          <input
            className="search-box"
            placeholder="Search trainer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-wrapper">

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialization</th>
                <th>Phone</th>
                <th>Salary</th>
                <th>Payment Date</th>
                <th>Payment Method</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td colSpan="7">Loading trainers...</td>
                </tr>
              ) : filtered.length > 0 ? (

                filtered.map((trainer) => (
                  <tr key={trainer._id}>

                    <td>{trainer.name}</td>
                    <td>{trainer.specialization}</td>
                    <td>{trainer.phone}</td>
                    <td>₹{trainer.salary}</td>

                    <td>
                      {trainer.paymentDate
                        ? new Date(trainer.paymentDate).toLocaleDateString("en-IN")
                        : "-"}
                    </td>

                    <td>{trainer.paymentMethod || "-"}</td>

                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => editTrainer(trainer)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => deleteTrainer(trainer._id)}
                      >
                        Delete
                      </button>
                    </td>

                  </tr>
                ))

              ) : (
                <tr>
                  <td colSpan="7">No trainers found.</td>
                </tr>
              )}

            </tbody>
          </table>

        </div>
      </div>

    </div>
  );
}

export default Trainers;
