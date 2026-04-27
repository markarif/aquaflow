import { useEffect, useState } from "react";
import { getLandingSummary } from "./api";

function LandingPage({ onStart }) {
  const [data, setData] = useState({
    metrics: {
      activePonds: 0,
      openAlerts: 0,
      recordsToday: 0,
      pondHealth: 0,
    },
    latestInsight: null,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await getLandingSummary();
        setData(result);
      } catch (error) {
        console.error("Landing data error:", error);
      }
    };

    loadData();
  }, []);

  return (
    <div className="app-shell">
      <main className="main-content">
        <section className="section">
          <div className="card hero-card">
            <h1>AquaFlow AI</h1>
            <p>
              AI-powered fish pond monitoring and decision support platform for
              aquaculture teams.
            </p>

            <button className="hero-btn" onClick={onStart}>
              Login to Dashboard
            </button>
          </div>
        </section>

        <section className="section">
          <div className="cards-grid">
            <div className="summary-card">
              <h3>Active Ponds</h3>
              <p>{data.metrics.activePonds}</p>
            </div>

            <div className="summary-card">
              <h3>Open Alerts</h3>
              <p>{data.metrics.openAlerts}</p>
            </div>

            <div className="summary-card">
              <h3>Records Today</h3>
              <p>{data.metrics.recordsToday}</p>
            </div>

            <div className="summary-card">
              <h3>Pond Health</h3>
              <p>{data.metrics.pondHealth}%</p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="card">
            <h2>Latest AI Insight</h2>

            {data.latestInsight ? (
              <>
                <p>
                  <strong>{data.latestInsight.pondName}</strong> —{" "}
                  {data.latestInsight.riskLevel}
                </p>
                <p>{data.latestInsight.text}</p>
              </>
            ) : (
              <p>No AI insight available yet.</p>
            )}
          </div>
        </section>

        <section className="section">
          <div className="card">
            <h2>Why AquaFlow AI</h2>

            <div className="cards-grid">
              <div className="status-card">
                <h3>Daily Records</h3>
                <p>
                  Capture fish count, feed, water quality, mortality, and pond
                  observations.
                </p>
              </div>

              <div className="status-card">
                <h3>AI Recommendations</h3>
                <p>
                  Turn daily pond data into practical insights and early warning
                  signals.
                </p>
              </div>

              <div className="status-card">
                <h3>Role-Based Access</h3>
                <p>
                  Support admins, pond managers, and staff with controlled
                  access.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="card">
            <h2>How It Works</h2>

            <div className="cards-grid">
              <div className="status-card">
                <h3>1. Record Data</h3>
                <p>Users submit daily pond data from the field.</p>
              </div>

              <div className="status-card">
                <h3>2. Generate Insight</h3>
                <p>AI reviews pond conditions and creates recommendations.</p>
              </div>

              <div className="status-card">
                <h3>3. Act Early</h3>
                <p>Teams review alerts and respond before risks grow.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="card hero-card">
            <h2>Ready to improve pond monitoring?</h2>
            <p>
              Login to access records, alerts, AI insights, and pond analytics
              in one place.
            </p>

            <button className="hero-btn" onClick={onStart}>
              Continue to Login
            </button>
          </div>
        </section>
      </main>

      <footer className="footer">
        AquaFlow AI © 2026
      </footer>
    </div>
  );
}

export default LandingPage;