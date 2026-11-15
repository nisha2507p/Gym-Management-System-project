
import { useEffect, useState } from "react";
import "./MemberDashboard.css";

function MemberDashboard({ user, token, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentError, setPaymentError] = useState("");

  const API = "http://localhost:5000/api";

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        setLoading(true);
        setError("");
        setPaymentError("");

        if (!token) {
          throw new Error("Login token not found. Please login again.");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        };

        const profileResponse = await fetch(
          `${API}/members/my-profile`,
          { headers }
        );

        const profileData = await profileResponse.json();

        if (!profileResponse.ok) {
          throw new Error(profileData.message || "Profile loading failed");
        }

        setProfile(profileData.data);

        const paymentResponse = await fetch(
          `${API}/payments/my`,
          { headers }
        );

        const paymentData = await paymentResponse.json();

        if (!paymentResponse.ok) {
          setPaymentError(
            paymentData.message || "Payment history loading failed"
          );
          setPayments([]);
        } else {
          setPayments(paymentData.data || []);
        }
      } catch (err) {
        console.error("DASHBOARD ERROR:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, [token]);

  const formatDate = (date) => {
    if (!date) return "Not available";
    return new Date(date).toLocaleDateString("en-IN");
  };

  if (loading) {
    return (
      <div className="member-message">
        <div className="member-spinner"></div>
        <h2>Loading Your Fitness Dashboard...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="member-message">
        <h2>Unable to load dashboard</h2>
        <p>{error}</p>
        <button className="member-logout" onClick={onLogout}>
          Logout
        </button>
      </div>
    );
  }

  const memberName = user?.name || profile?.name || "Member";

  return (
    <div className="member-dashboard">

      {/* HEADER */}
      <header className="member-header">
        <div>
          <span className="member-eyebrow">FITZONE FITNESS CLUB</span>
          <h1>Welcome Back, {memberName}!</h1>
          <p>Your fitness journey. Your progress. Your success.</p>
        </div>

        <button className="member-logout" onClick={onLogout}>
          Logout ↗
        </button>
      </header>

      {/* WELCOME STRIP */}
      <div className="member-welcome">
        <div>
          <span>YOUR PERSONAL FITNESS SPACE</span>
          <h2>Stay Strong. Stay Consistent.</h2>
          <p>Manage your profile, membership and payments in one place.</p>
        </div>
        <div className="member-welcome-icon">💪</div>
      </div>

      {/* NAVIGATION */}
      <nav className="member-nav">
        <button
          className={activeTab === "profile" ? "member-tab active" : "member-tab"}
          onClick={() => setActiveTab("profile")}
        >
          <span>👤</span> My Profile
        </button>

        <button
          className={activeTab === "membership" ? "member-tab active" : "member-tab"}
          onClick={() => setActiveTab("membership")}
        >
          <span>🏆</span> My Membership
        </button>

        <button
          className={activeTab === "payments" ? "member-tab active" : "member-tab"}
          onClick={() => setActiveTab("payments")}
        >
          <span>💳</span> Payment History
        </button>
      </nav>

      {/* PROFILE */}
      {activeTab === "profile" && (
        <section className="member-panel">
          <div className="member-section-heading">
            <div>
              <span className="member-label">PERSONAL INFORMATION</span>
              <h2>My Profile</h2>
              <p>Your registered account details</p>
            </div>
            <div className="member-avatar">👤</div>
          </div>

          <div className="member-info-grid">
            <div className="member-info-card">
              <span>FULL NAME</span>
              <h3>{profile?.name || user?.name || "N/A"}</h3>
            </div>

            <div className="member-info-card">
              <span>EMAIL ADDRESS</span>
              <h3>{profile?.email || user?.email || "N/A"}</h3>
            </div>

            <div className="member-info-card">
              <span>PHONE NUMBER</span>
              <h3>{profile?.phone || "N/A"}</h3>
            </div>

            <div className="member-info-card">
              <span>AGE</span>
              <h3>{profile?.age ?? "N/A"}</h3>
            </div>

            <div className="member-info-card">
              <span>GENDER</span>
              <h3>{profile?.gender || "N/A"}</h3>
            </div>

            <div className="member-info-card">
              <span>ACCOUNT STATUS</span>
              <h3>
                <span className="member-status">
                  {profile?.status || "N/A"}
                </span>
              </h3>
            </div>
          </div>
        </section>
      )}

      {/* MEMBERSHIP */}
      {activeTab === "membership" && (
        <section className="member-panel">
          <div className="member-section-heading">
            <div>
              <span className="member-label">YOUR FITNESS PLAN</span>
              <h2>My Membership</h2>
              <p>Details of your current membership</p>
            </div>
            <div className="member-avatar">🏆</div>
          </div>

          <div className="member-plan-card">
            <span>CURRENT MEMBERSHIP</span>
            <h2>{profile?.plan || "Not assigned"}</h2>
            <h3>₹{profile?.fee ?? 0}</h3>
            <p>Membership Fee</p>
          </div>

          <div className="member-info-grid">
            <div className="member-info-card">
              <span>JOINING DATE</span>
              <h3>{formatDate(profile?.joinDate)}</h3>
            </div>

            <div className="member-info-card">
              <span>EXPIRY DATE</span>
              <h3>{formatDate(profile?.expiryDate)}</h3>
            </div>

            <div className="member-info-card">
              <span>MEMBERSHIP STATUS</span>
              <h3>
                <span className="member-status">
                  {profile?.status || "N/A"}
                </span>
              </h3>
            </div>
          </div>
        </section>
      )}

      {/* PAYMENT HISTORY */}
      {activeTab === "payments" && (
        <section className="member-panel">
          <div className="member-section-heading">
            <div>
              <span className="member-label">TRANSACTION DETAILS</span>
              <h2>My Payment History</h2>
              <p>View your gym payment records</p>
            </div>
            <div className="member-avatar">💳</div>
          </div>

          {paymentError ? (
            <div className="member-empty">
              <h3>Unable to load payments</h3>
              <p>{paymentError}</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="member-empty">
              <span>💳</span>
              <h3>No payment records found</h3>
              <p>Your payment transactions will appear here.</p>
            </div>
          ) : (
            <>
              <div className="member-payment-summary">
                <span>TOTAL PAYMENT RECORDS</span>
                <h2>{payments.length}</h2>
              </div>

              <div className="member-table-wrapper">
                <table className="member-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Payment Method</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment._id}>
                        <td>{formatDate(payment.paymentDate)}</td>
                        <td className="member-amount">
                          ₹{payment.amount}
                        </td>
                        <td>{payment.paymentMethod}</td>
                        <td>
                          <span className={
                            payment.status === "Paid"
                              ? "member-status"
                              : "member-pending"
                          }>
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      )}

      <footer className="member-footer">
        <span>FITZONE FITNESS CLUB</span>
        <p>Stay Fit. Stay Healthy. Stay Strong.</p>
      </footer>

    </div>
  );
}

export default MemberDashboard;
