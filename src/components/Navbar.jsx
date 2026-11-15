
function Navbar({ activePage }) {
  return (
    <header className="navbar">

      <div className="navbar-title">
        <h2>{activePage}</h2>
        <p>Welcome back! Manage your gym efficiently.</p>
      </div>

      <div className="navbar-right">

        <div className="navbar-search">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search here..."
          />
        </div>

        <button className="notification-btn" title="Notifications">
          🔔
          <span className="notification-dot"></span>
        </button>

        <div className="navbar-profile">
          <div className="profile-avatar">A</div>
          <div>
            <strong>Admin</strong>
            <small>Administrator</small>
          </div>
        </div>

      </div>

    </header>
  );
}

export default Navbar;
