
import { useState } from "react";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Trainers from "./pages/Trainers";
import Membership from "./pages/Membership";
import Attendance from "./pages/Attendance";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Staff from "./pages/Staff";
import MemberDashboard from "./pages/MemberDashboard";

import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  const [authPage, setAuthPage] = useState("login");

  const [session, setSession] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("fitzoneSession") ||
        localStorage.getItem("fitzoneAdmin") ||
        "null"
      );

      const user = saved?.user || saved?.admin;

      if (
        saved?.token &&
        ["admin", "staff", "member"].includes(user?.role)
      ) {
        return { ...saved, user };
      }

      return null;
    } catch {
      return null;
    }
  });

  // LOGIN SUCCESS
  const handleLogin = (data) => {
    const newSession = {
      token: data.token,
      user: data.user
    };

    localStorage.setItem(
      "fitzoneSession",
      JSON.stringify(newSession)
    );

    if (data.user.role === "admin") {
      localStorage.setItem(
        "fitzoneAdmin",
        JSON.stringify({
          ...newSession,
          admin: data.user
        })
      );
    }

    setSession(newSession);
    setAuthPage("login");
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("fitzoneSession");
    localStorage.removeItem("fitzoneAdmin");

    setSession(null);
    setActivePage("Dashboard");
    setAuthPage("login");
  };

  // LOGIN / REGISTER SCREEN
  if (!session) {
    if (authPage === "register") {
      return (
        <Register
          onBackToLogin={() => setAuthPage("login")}
        />
      );
    }

    return (
      <Login
        onLogin={handleLogin}
        onRegister={() => setAuthPage("register")}
      />
    );
  }

  const user = session.user;
  const role = user.role;

  // STAFF DASHBOARD
  if (role === "staff") {
    return (
      <div className="app-container">
        <main className="main-content" style={{ width: "100%" }}>
          <div style={{ padding: "30px" }}>
            <h1>FitZone Staff Dashboard</h1>
            <h3>Welcome, {user.name}!</h3>
            <p>You are logged in as Staff.</p>

            <div style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              marginTop: "25px"
            }}>
              <h2>Staff Account</h2>
              <p>Name: {user.name}</p>
              <p>Email: {user.email}</p>
              <p>Role: Staff</p>
            </div>

            <button onClick={handleLogout}>Logout</button>
          </div>
        </main>
      </div>
    );
  }

  // MEMBER DASHBOARD
  // MEMBER DASHBOARD
if (role === "member") {
  return (
    <MemberDashboard
      user={user}
      token={session.token}
      onLogout={handleLogout}
    />
  );
}
  

  // ONLY ADMIN CAN ACCESS ADMIN DASHBOARD
  if (role !== "admin") {
    handleLogout();
    return null;
  }

  // ADMIN PAGES
  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return <Dashboard />;
      case "Members":
        return <Members />;
      case "Trainers":
        return <Trainers />;
      case "Membership":
        return <Membership />;
      case "Attendance":
        return <Attendance />;
      case "Payments":
        return <Payments />;
      case "Reports":
        return <Reports />;
      case "Staff":
        return <Staff />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main className="main-content">
        <Navbar activePage={activePage} />

        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "12px",
          padding: "10px 20px"
        }}>
          <span>Admin: {user.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>

        {renderPage()}
      </main>
    </div>
  );
}

export default App;
