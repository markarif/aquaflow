function AIRecommendations({ recommendations = [] }) {
  const formatConfidence = (value) => {
    if (value === null || value === undefined || value === "") return "-";

    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) return value;

    if (numericValue <= 1) {
      return `${(numericValue * 100).toFixed(0)}%`;
    }

    return `${numericValue}%`;
  };

  const getRiskClass = (riskLevel) => {
    if (riskLevel === "critical") return "severity-critical";
    if (riskLevel === "warning") return "severity-warning";
    if (riskLevel === "low") return "severity-low";
    return "";
  };

  return (
    <div className="card">
      <h2>AI Recommendations</h2>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Pond</th>
            <th>Recommendation</th>
            <th>Risk Level</th>
            <th>Confidence</th>
          </tr>
        </thead>
        <tbody>
          {recommendations.length > 0 ? (
            recommendations.map((item) => (
              <tr key={item.id}>
                <td>{new Date(item.created_at).toLocaleDateString()}</td>
                <td>{item.pond_name || "-"}</td>
                <td className="recommendation-cell">
                  {item.recommendation_text || "-"}
                </td>
                <td className={getRiskClass(item.risk_level)}>
                  {item.risk_level || "-"}
                </td>
                <td>{formatConfidence(item.confidence_score)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No AI recommendations found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AIRecommendations;