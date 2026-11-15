
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

function Dashboard() {
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const saved = JSON.parse(
          localStorage.getItem("fitzoneAdmin")
        );

        const headers = {
          Authorization: `Bearer ${saved?.token}`
        };

        const [memberRes, trainerRes, paymentRes] =
          await Promise.all([
            fetch(`${API_URL}/members`, { headers }),
            fetch(`${API_URL}/trainers`, { headers }),
            fetch(`${API_URL}/payments`, { headers })
          ]);

        const memberData = await memberRes.json();
        const trainerData = await trainerRes.json();
        const paymentData = await paymentRes.json();

        if (memberData.success) {
          setMembers(memberData.data || []);
        }

        if (trainerData.success) {
          setTrainers(trainerData.data || []);
        }

        if (paymentData.success) {
          setPayments(paymentData.data || []);
        }

      } catch (error) {
        console.log("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const activeMembers = members.filter(
    (member) => member.status === "Active"
  ).length;

  const totalRevenue = payments.reduce(
    (total, payment) =>
      total + Number(payment.amount || payment.fee || 0),
    0
  );

  const stats = [
    {
      title: "Total Members",
      value: members.length,
      icon: "👥",
      color: "#2563eb"
    },
    {
      title: "Total Trainers",
      value: trainers.length,
      icon: "🏋️",
      color: "#9333ea"
    },
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      icon: "💰",
      color: "#16a34a"
    },
    {
      title: "Active Members",
      value: activeMembers,
      icon: "⭐",
      color: "#ea580c"
    }
  ];

  return (
    <div className="dashboard">

      <div className="dashboard-heading">
        <div>
          <h2>Dashboard Overview</h2>
          <p>Here's what's happening in your gym today.</p>
        </div>
      </div>

      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <>
          <div className="stats-grid">
            {stats.map((item) => (
              <div className="stat-card" key={item.title}>
                <div>
                  <p>{item.title}</p>
                  <h2>{item.value}</h2>
                </div>

                <div
                  className="stat-icon"
                  style={{ background: item.color }}
                >
                  {item.icon}
                </div>
              </div>
            ))}
          </div>

          <div className="dashboard-bottom">

            <div className="dashboard-panel">
              <h3>Revenue Overview</h3>
              <p className="panel-subtitle">
                Payment collection summary
              </p>

              <div className="revenue-info">
                <h2>₹{totalRevenue.toLocaleString("en-IN")}</h2>
                <span>Total Collection</span>
              </div>

              <div className="revenue-bar">
                <div style={{
                  width: "100%",
                  height: "100%",
                  background: "#2563eb",
                  borderRadius: "10px"
                }}></div>
              </div>

              <p className="panel-subtitle">
                Based on all recorded payments
              </p>
            </div>

            <div className="dashboard-panel">
              <h3>Gym Summary</h3>

              <div className="summary-row">
                <span>Total Members</span>
                <strong>{members.length}</strong>
              </div>

              <div className="summary-row">
                <span>Active Members</span>
                <strong>{activeMembers}</strong>
              </div>

              <div className="summary-row">
                <span>Total Trainers</span>
                <strong>{trainers.length}</strong>
              </div>

              <div className="summary-row">
                <span>Total Payments</span>
                <strong>{payments.length}</strong>
              </div>
            </div>

          </div>

          <div className="dashboard-panel recent-payments">
            <h3>Recent Payments</h3>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Payment ID</th>
                    <th>Amount</th>
                    <th>Payment Method</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.slice(-5).reverse().map((payment) => (
                    <tr key={payment._id}>
                      <td>{payment._id?.slice(-6)}</td>
                      <td>
                        ₹{Number(
                          payment.amount || payment.fee || 0
                        ).toLocaleString("en-IN")}
                      </td>
                      <td>{payment.paymentMethod || payment.method || "N/A"}</td>
                      <td>
                        <span className="payment-status">
                          {payment.status || "Paid"}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {payments.length === 0 && (
                    <tr>
                      <td colSpan="4">No payments available</td>
                    </tr>
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

export default Dashboard;
