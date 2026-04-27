function PondStatusCards({ recommendations = [] }) {
  const latestByPond = {};

  recommendations.forEach((item) => {
    if (!latestByPond[item.pond_name]) {
      latestByPond[item.pond_name] = item;
    }
  });

  const pondStatuses = Object.values(latestByPond);

  return (
    <div className="card">
      <h2>Pond Status Overview</h2>

      <div className="status-grid">
        {pondStatuses.length > 0 ? (
          pondStatuses.map((pond) => (
            <div key={pond.id} className="status-card">
              <h3>{pond.pond_name}</h3>
              <p>
                <strong>Risk:</strong>{" "}
                <span
                  className={
                    pond.risk_level === "critical"
                      ? "severity-critical"
                      : pond.risk_level === "warning"
                      ? "severity-warning"
                      : "severity-normal"
                  }
                >
                  {pond.risk_level}
                </span>
              </p>
              <p>
                <strong>Recommendation:</strong> {pond.recommendation_text}
              </p>
            </div>
          ))
        ) : (
          <p>No pond status data available.</p>
        )}
      </div>
    </div>
  );
}

export default PondStatusCards;