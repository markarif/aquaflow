function DashboardCards({ records = [], ponds = [], alerts = [] }) {
  const totalPonds = ponds.length;

  const totalFeed = records.reduce(
    (sum, record) => sum + Number(record.feed_given_kg || 0),
    0
  );

  const totalMortality = records.reduce(
    (sum, record) => sum + Number(record.mortality_count || 0),
    0
  );

  const openAlerts = alerts.filter((alert) => alert.status === "open").length;

  return (
    <div className="cards-grid">
      <div className="summary-card">
        <h3>Total Ponds</h3>
        <p>{totalPonds}</p>
      </div>

      <div className="summary-card">
        <h3>Total Feed Used</h3>
        <p>{totalFeed.toFixed(2)} kg</p>
      </div>

      <div className="summary-card">
        <h3>Total Mortality</h3>
        <p>{totalMortality}</p>
      </div>

      <div className="summary-card">
        <h3>Open Alerts</h3>
        <p>{openAlerts}</p>
      </div>
    </div>
  );
}

export default DashboardCards;