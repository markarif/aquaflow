import "./App.css";
import { useEffect, useState } from "react";
import {
  getPonds,
  getDailyRecords,
  getAiRecommendations,
  getAlerts,
  getUsers,
} from "./api";
import LandingPage from "./LandingPage";
import Login from "./Login";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import DashboardCards from "./DashboardCards";
import PondStatusCards from "./PondStatusCards";
import ChartsSection from "./ChartsSection";
import Ponds from "./Ponds";
import DailyEntryForm from "./DailyEntryForm";
import DailyRecords from "./DailyRecords";
import AIRecommendations from "./AIRecommendations";
import Alerts from "./Alerts";
import Footer from "./Footer";
import Users from "./Users";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [ponds, setPonds] = useState([]);
  const [records, setRecords] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");

  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "pond_manager";
  const isstaff_trainee = user?.role === "staff_trainee";

  const loadDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const baseRequests = [
        getPonds(),
        getDailyRecords(),
        getAiRecommendations(),
        getAlerts(),
      ];

      const results = await Promise.all(
        isAdmin ? [...baseRequests, getUsers()] : baseRequests
      );

      const [pondsData, recordsData, recommendationsData, alertsData, usersData] = results;

      setPonds(pondsData || []);
      setRecords(recordsData || []);
      setRecommendations(recommendationsData || []);
      setAlerts(alertsData || []);
      setUsers(usersData || []);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setShowLogin(false); // ← this is the only change
    setActiveTab("Dashboard");
  };

  const handleUserUpdated = async () => {
    await loadDashboardData();
  };

  const handlePondUpdated = async () => {
    await loadDashboardData();
  };

  const handleRecordUpdated = async () => {
    await loadDashboardData();
  };

  const handleAlertUpdated = async () => {
    await loadDashboardData();
  };

  if (!user && !showLogin) {
    return (
      <LandingPage
        onStart={() => setShowLogin(true)}
        ponds={ponds}
        records={records}
        alerts={alerts}
        recommendations={recommendations}
      />
    );
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  if (loading) {
    return (
      <div className="app">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      <main className="main-content">
        <header className="header">
          <h1>Welcome, {user.full_name}</h1>
          <p>
            Role: {user.role}
            {user.assigned_pond_id ? ` | Assigned Pond: ${user.assigned_pond_id}` : ""}
          </p>
        </header>

        {activeTab === "Dashboard" && (
          <>
            <div className="section">
              <HeroSection onGoToEntry={() => setActiveTab("Daily Entry")} />
            </div>

            <div className="section">
              <DashboardCards
                records={records}
                ponds={ponds}
                alerts={alerts}
                users={users}
                user={user}
              />
            </div>

            <div className="section">
              <PondStatusCards recommendations={recommendations} />
            </div>

            <div className="section">
              <ChartsSection records={records} />
            </div>
          </>
        )}

        {activeTab === "Daily Entry" && (
          <div className="section">
            <DailyEntryForm
              onRecordAdded={handleRecordUpdated}
              assignedPondId={user.assigned_pond_id}
              role={user.role}
              ponds={ponds}
            />
          </div>
        )}

        {activeTab === "Ponds" && (
          <div className="section">
            <Ponds
              ponds={ponds}
              user={user}
              onPondUpdated={handlePondUpdated}
            />
          </div>
        )}

        {activeTab === "Records" && (
          <div className="section">
            <DailyRecords
              records={records}
              ponds={ponds}
              user={user}
              onRecordUpdated={handleRecordUpdated}
            />
          </div>
        )}

        {activeTab === "AI Insights" && (
          <div className="section">
            <AIRecommendations
              recommendations={recommendations}
              user={user}
            />
          </div>
        )}

        {activeTab === "Alerts" && (
          <div className="section">
            <Alerts
              alerts={alerts}
              user={user}
              onAlertUpdated={handleAlertUpdated}
            />
          </div>
        )}

        {activeTab === "Users" && isAdmin && (
          <div className="section">
            <Users
              users={users}
              ponds={ponds}
              onUserUpdated={handleUserUpdated}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;