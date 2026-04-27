function DailyRecords({ records = [] }) {
  return (
    <div className="card">
      <h2>Daily Records</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Pond</th>
            <th>Fish Count</th>
            <th>Avg Weight (g)</th>
            <th>Feed (kg)</th>
            <th>Temp (°C)</th>
            <th>pH</th>
            <th>Mortality</th>
            <th>Recorded By</th>
          </tr>
        </thead>
        <tbody>
          {records.length > 0 ? (
            records.map((record) => (
              <tr key={record.id}>
                <td>{new Date(record.date).toLocaleDateString()}</td>
                <td>{record.pond_name}</td>
                <td>{record.fish_count}</td>
                <td>{record.average_weight_g}</td>
                <td>{record.feed_given_kg}</td>
                <td>{record.water_temperature_c}</td>
                <td>{record.ph}</td>
                <td>{record.mortality_count}</td>
                <td>{record.recorded_by_name || "Unknown"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9">No daily records found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DailyRecords;