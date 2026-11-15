
function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    { name: "Dashboard", icon: "📊" },
    { name: "Members", icon: "👥" },
    { name: "Trainers", icon: "🏋️" },
    { name: "Membership", icon: "🎫" },
    { name: "Attendance", icon: "📅" },
    { name: "Payments", icon: "💰" },
    { name: "Reports", icon: "📈" },
    { name: "Staff", icon: "👨‍💼" }
  ];

  return (
    <aside className="sidebar">

      <div className="logo">
        <div className="logo-icon">💪</div>
        <div>
          <h2>FitZone</h2>
          <small>GYM MANAGEMENT</small>
        </div>
      </div>

      <p className="menu-heading">MAIN MENU</p>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.name}
            className={`menu-item ${
              activePage === item.name ? "active" : ""
            }`}
            onClick={() => setActivePage(item.name)}
          >
            <span className="menu-icon">{item.icon}</span>
            <span>{item.name}</span>

            {activePage === item.name && (
              <span className="active-indicator"></span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="admin-avatar">A</div>

        <div className="admin-info">
          <strong>Admin</strong>
          <small>Gym Manager</small>
        </div>

        <span className="online-status"></span>
      </div>

    </aside>
  );
}

export default Sidebar;
