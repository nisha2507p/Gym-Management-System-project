
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

function Reports() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

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
  const apiRequest = async (url) => {
    const token = getToken();

    if (!token) {
      throw new Error("Please login first!");
    }

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (!response.ok || result.success === false) {
      throw new Error(result.message || "Something went wrong");
    }

    return result;
  };

  // Normalize API Response
  const getArray = (result) => {
    if (Array.isArray(result)) return result;
    if (Array.isArray(result.data)) return result.data;
    if (Array.isArray(result.data?.data)) return result.data.data;
    return [];
  };

  // Fetch Payments
  const fetchReports = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await apiRequest(`${API_URL}/payments`);
      setPayments(getArray(result));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Filter Payments by Selected Month
  const monthlyPayments = payments.filter((payment) => {
    if (!payment.paymentDate) return false;

    const date = new Date(payment.paymentDate);

    if (Number.isNaN(date.getTime())) return false;

    const paymentMonth =
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    return paymentMonth === selectedMonth;
  });

  // Revenue Calculations
  const paidPayments = monthlyPayments.filter(
    (payment) => payment.status === "Paid"
  );

  const pendingPayments = monthlyPayments.filter(
    (payment) => payment.status === "Pending"
  );

  const totalRevenue = paidPayments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  const pendingAmount = pendingPayments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  const totalTransactions = monthlyPayments.length;

  // All Time Revenue
  const allTimeRevenue = payments
    .filter((payment) => payment.status === "Paid")
    .reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );

  // Payment Method Report
  const methods = ["UPI", "Cash", "Bank Transfer", "Cheque"];

  const methodReport = methods.map((method) => {
    const methodPayments = paidPayments.filter(
      (payment) => payment.paymentMethod === method
    );

    const amount = methodPayments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );

    return {
      name: method,
      count: methodPayments.length,
      amount
    };
  });

  // Last Six Months Revenue
  const getMonthlyRevenue = () => {
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - i);

      const month = date.getMonth();
      const year = date.getFullYear();

      const revenue = payments
        .filter((payment) => {
          const paymentDate = new Date(payment.paymentDate);

          return (
            payment.status === "Paid" &&
            !Number.isNaN(paymentDate.getTime()) &&
            paymentDate.getMonth() === month &&
            paymentDate.getFullYear() === year
          );
        })
        .reduce(
          (sum, payment) => sum + Number(payment.amount || 0),
          0
        );

      months.push({
        name: date.toLocaleDateString("en-IN", {
          month: "short"
        }),
        revenue
      });
    }

    return months;
  };

  const monthlyRevenue = getMonthlyRevenue();

  const maxRevenue = Math.max(
    ...monthlyRevenue.map((item) => item.revenue),
    1
  );

  // Format Currency
  const formatAmount = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  // Format Date
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN");
  };

  // Download CSV Report
  const downloadReport = () => {
    const headers = [
      "Member",
      "Amount",
      "Payment Date",
      "Payment Method",
      "Status"
    ];

    const rows = monthlyPayments.map((payment) => [
      payment.member?.name || "Unknown Member",
      payment.amount || 0,
      formatDate(payment.paymentDate),
      payment.paymentMethod || "-",
      payment.status || "-"
    ]);

    const csvContent = [
      headers,
      ...rows
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      ["\uFEFF" + csvContent],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `FitZone_Report_${selectedMonth}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const cardStyle = {
    background: "#fff",
    padding: "22px",
    borderRadius: "12px",
    border: "1px solid #eee",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "18px",
    marginBottom: "25px"
  };

  const headingStyle = {
    marginBottom: "18px",
    fontSize: "19px",
    color: "#222"
  };

  return (
    <div className="page-content">

      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
          marginBottom: "25px"
        }}
      >
        <div>
          <h2>Reports Management</h2>
          <p>View gym revenue and payment reports.</p>
        </div>

        <button
          className="primary-btn"
          onClick={fetchReports}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh Reports"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p style={{ color: "red", marginBottom: "15px" }}>
          {error}
        </p>
      )}

      {loading ? (
        <p>Loading reports...</p>
      ) : (
        <>

          {/* Month Filter */}
          <div
            style={{
              ...cardStyle,
              marginBottom: "25px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "15px"
            }}
          >
            <div>
              <h3>Select Report Month</h3>
              <p>Choose a month to view payment records.</p>
            </div>

            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "7px"
              }}
            />
          </div>

          {/* Revenue Cards */}
          <div style={gridStyle}>

            <div style={cardStyle}>
              <p>Monthly Revenue</p>
              <h2 style={{ color: "#16a34a", fontSize: "28px" }}>
                {formatAmount(totalRevenue)}
              </h2>
              <small>Paid amount for selected month</small>
            </div>

            <div style={cardStyle}>
              <p>Pending Amount</p>
              <h2 style={{ color: "#dc2626", fontSize: "28px" }}>
                {formatAmount(pendingAmount)}
              </h2>
              <small>Unpaid amount for selected month</small>
            </div>

            <div style={cardStyle}>
              <p>Total Transactions</p>
              <h2 style={{ color: "#2563eb", fontSize: "28px" }}>
                {totalTransactions}
              </h2>
              <small>Payments in selected month</small>
            </div>

            <div style={cardStyle}>
              <p>All Time Revenue</p>
              <h2 style={{ color: "#9333ea", fontSize: "28px" }}>
                {formatAmount(allTimeRevenue)}
              </h2>
              <small>Total collected since beginning</small>
            </div>

          </div>

          {/* Payment Status Report */}
          <div style={{ ...cardStyle, marginBottom: "25px" }}>

            <h3 style={headingStyle}>Payment Status Report</h3>

            <div style={gridStyle}>

              <div>
                <p>Paid Payments</p>
                <h2 style={{ color: "#16a34a" }}>
                  {paidPayments.length}
                </h2>
                <small>{formatAmount(totalRevenue)}</small>
              </div>

              <div>
                <p>Pending Payments</p>
                <h2 style={{ color: "#dc2626" }}>
                  {pendingPayments.length}
                </h2>
                <small>{formatAmount(pendingAmount)}</small>
              </div>

            </div>
          </div>

          {/* Monthly Revenue Chart */}
          <div style={{ ...cardStyle, marginBottom: "25px" }}>

            <h3 style={headingStyle}>
              Last 6 Months Revenue
            </h3>

            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-around",
                gap: "12px",
                height: "230px",
                padding: "15px 5px 0",
                borderBottom: "1px solid #ddd"
              }}
            >
              {monthlyRevenue.map((item, index) => (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    height: "100%",
                    gap: "8px"
                  }}
                >
                  <small style={{ fontSize: "11px" }}>
                    {formatAmount(item.revenue)}
                  </small>

                  <div
                    title={formatAmount(item.revenue)}
                    style={{
                      width: "65%",
                      maxWidth: "65px",
                      height: `${Math.max(
                        (item.revenue / maxRevenue) * 145,
                        4
                      )}px`,
                      background: "#2563eb",
                      borderRadius: "6px 6px 0 0"
                    }}
                  />

                  <small>{item.name}</small>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Report */}
          <div style={{ ...cardStyle, marginBottom: "25px" }}>

            <h3 style={headingStyle}>Payment Method Report</h3>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Payment Method</th>
                    <th>Transactions</th>
                    <th>Collected Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {methodReport.map((method) => (
                    <tr key={method.name}>
                      <td>{method.name}</td>
                      <td>{method.count}</td>
                      <td>{formatAmount(method.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment History */}
          <div style={cardStyle}>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "15px",
                marginBottom: "18px"
              }}
            >
              <h3>Monthly Payment History</h3>

              <button
                className="primary-btn"
                onClick={downloadReport}
                disabled={monthlyPayments.length === 0}
              >
                Download CSV Report
              </button>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Method</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {monthlyPayments.length === 0 ? (
                    <tr>
                      <td colSpan="5">
                        No payment records found for this month.
                      </td>
                    </tr>
                  ) : (
                    monthlyPayments.map((payment) => (
                      <tr key={payment._id}>
                        <td>
                          {payment.member?.name || "Unknown Member"}
                        </td>

                        <td>{formatAmount(payment.amount)}</td>

                        <td>{formatDate(payment.paymentDate)}</td>

                        <td>{payment.paymentMethod || "-"}</td>

                        <td>
                          <span
                            style={{
                              color:
                                payment.status === "Paid"
                                  ? "#16a34a"
                                  : "#dc2626",
                              fontWeight: "600"
                            }}
                          >
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </>
      )}

    </div>
  );
}

export default Reports;
