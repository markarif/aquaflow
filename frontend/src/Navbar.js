function Navbar({ activeTab, setActiveTab, user, onLogout }) {
  let tabs = [];

  if (user.role === "admin") {
    tabs = [
      "Dashboard",
      "Daily Entry",
      "Ponds",
      "Records",
      "AI Insights",
      "Alerts",
      "Users",
    ];
  } else if (user.role === "pond_manager") {
    tabs = [
      "Dashboard",
      "Daily Entry",
      "Ponds",
      "Records",
      "AI Insights",
      "Alerts",
    ];
  } else if (user.role === "staff_trainee") {
    tabs = [
      "Dashboard",
      "Daily Entry",
      "Ponds",
      "Records",
    ];
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>AquaFlow AI</h2>
      </div>

      <div className="navbar-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "nav-btn active" : "nav-btn"}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}

        <button className="nav-btn logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;