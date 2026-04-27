import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function ChartsSection({ records = [] }) {
  const chartData = [...records]
    .slice()
    .reverse()
    .map((record) => ({
      date: new Date(record.date).toLocaleDateString(),
      feed: Number(record.feed_given_kg || 0),
      mortality: Number(record.mortality_count || 0),
      temperature: Number(record.water_temperature_c || 0),
    }));

  return (
    <div className="card">
      <h2>Pond Performance Trends</h2>

      <div className="chart-container">
        <h3>Feed Usage Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="feed" stroke="#1e3a5f" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3>Mortality Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="mortality" stroke="#b00020" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3>Water Temperature Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="temperature" stroke="#2e7d32" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ChartsSection;