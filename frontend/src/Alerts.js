import { updateAlert, deleteAlert } from "./api";

function Alerts({ alerts = [], user, onAlertUpdated }) {
  const canUpdateStatus =
    user?.role === "admin" || user?.role === "pond_manager";
  const canDelete = user?.role === "admin";

  const handleStatusChange = async (alertId, newStatus) => {
    try {
      await updateAlert(alertId, { status: newStatus });
      alert("Alert status updated successfully");
      if (onAlertUpdated) {
        await onAlertUpdated();
      }
    } catch (error) {
      alert(error.message || "Failed to update alert");
    }
  };

  const handleDelete = async (alertId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this alert?"
    );
    if (!confirmed) return;

    try {
      await deleteAlert(alertId);
      alert("Alert deleted successfully");
      if (onAlertUpdated) {
        await onAlertUpdated();
      }
    } catch (error) {
      alert(error.message || "Failed to delete alert");
    }
  };

  return (
    <div className="card">
      <h2>Alerts</h2>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Pond</th>
            <th>Alert Type</th>
            <th>Severity</th>
            <th>Message</th>
            <th>Status</th>
            <th>Sent To</th>
            {(canUpdateStatus || canDelete) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {alerts.length > 0 ? (
            alerts.map((alertItem) => (
              <tr key={alertItem.id}>
                <td>{new Date(alertItem.created_at).toLocaleDateString()}</td>
                <td>{alertItem.pond_name}</td>
                <td>{alertItem.alert_type}</td>
                <td
                  className={
                    alertItem.severity === "critical"
                      ? "severity-critical"
                      : alertItem.severity === "warning"
                      ? "severity-warning"
                      : ""
                  }
                >
                  {alertItem.severity}
                </td>
                <td>{alertItem.message}</td>
                <td>{alertItem.status}</td>
                <td>{alertItem.sent_to}</td>

                {(canUpdateStatus || canDelete) && (
                  <td>
                    <div className="action-buttons">
                      {canUpdateStatus && alertItem.status !== "resolved" && (
                        <button
                          className="edit-btn"
                          onClick={() =>
                            handleStatusChange(alertItem.id, "resolved")
                          }
                        >
                          Mark Resolved
                        </button>
                      )}

                      {canUpdateStatus && alertItem.status !== "open" && (
                        <button
                          className="secondary-btn"
                          onClick={() =>
                            handleStatusChange(alertItem.id, "open")
                          }
                        >
                          Reopen
                        </button>
                      )}

                      {canDelete && (
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(alertItem.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={(canUpdateStatus || canDelete) ? 8 : 7}>
                No alerts found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Alerts;