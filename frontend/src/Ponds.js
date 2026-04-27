import { useState } from "react";
import { createPond, updatePond, deletePond } from "./api";

function Ponds({ ponds = [], user, onPondUpdated }) {
  const isAdmin = user?.role === "admin";

  const [showForm, setShowForm] = useState(false);
  const [editingPond, setEditingPond] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    pond_name: "",
    location: "",
    fish_type: "",
    stocking_date: "",
    initial_fish_count: "",
    status: "active",
  });

  const resetForm = () => {
    setFormData({
      pond_name: "",
      location: "",
      fish_type: "",
      stocking_date: "",
      initial_fish_count: "",
      status: "active",
    });
    setEditingPond(null);
    setShowForm(false);
  };

  const handleAddNew = () => {
    setEditingPond(null);
    setFormData({
      pond_name: "",
      location: "",
      fish_type: "",
      stocking_date: "",
      initial_fish_count: "",
      status: "active",
    });
    setShowForm(true);
  };

  const handleEdit = (pond) => {
    setEditingPond(pond);
    setFormData({
      pond_name: pond.pond_name || "",
      location: pond.location || "",
      fish_type: pond.fish_type || "",
      stocking_date: pond.stocking_date || "",
      initial_fish_count: pond.initial_fish_count || "",
      status: pond.status || "active",
    });
    setShowForm(true);
  };

  const handleDelete = async (pondId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this pond?"
    );
    if (!confirmed) return;

    try {
      await deletePond(pondId);
      alert("Pond deleted successfully");
      if (onPondUpdated) {
        await onPondUpdated();
      }
    } catch (error) {
      alert(error.message || "Failed to delete pond");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        initial_fish_count:
          formData.initial_fish_count === ""
            ? null
            : Number(formData.initial_fish_count),
      };

      if (editingPond) {
        await updatePond(editingPond.id, payload);
        alert("Pond updated successfully");
      } else {
        await createPond(payload);
        alert("Pond created successfully");
      }

      if (onPondUpdated) {
        await onPondUpdated();
      }

      resetForm();
    } catch (error) {
      alert(error.message || "Failed to save pond");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div className="section-header">
        <h2>Ponds</h2>
        {isAdmin && (
          <button className="primary-btn" onClick={handleAddNew}>
            Add Pond
          </button>
        )}
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Pond Name</th>
            <th>Fish Type</th>
            <th>Location</th>
            <th>Stocking Date</th>
            <th>Initial Fish Count</th>
            <th>Status</th>
            {isAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {ponds.length > 0 ? (
            ponds.map((pond) => (
              <tr key={pond.id}>
                <td>{pond.id}</td>
                <td>{pond.pond_name}</td>
                <td>{pond.fish_type || "-"}</td>
                <td>{pond.location || "-"}</td>
                <td>{pond.stocking_date || "-"}</td>
                <td>{pond.initial_fish_count || "-"}</td>
                <td>{pond.status || "-"}</td>
                {isAdmin && (
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(pond)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(pond.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={isAdmin ? 8 : 7}>No ponds found</td>
            </tr>
          )}
        </tbody>
      </table>

      {showForm && isAdmin && (
        <div className="form-card">
          <h3>{editingPond ? "Edit Pond" : "Add Pond"}</h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Pond Name</label>
              <input
                type="text"
                value={formData.pond_name}
                onChange={(e) =>
                  setFormData({ ...formData, pond_name: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Fish Type</label>
              <input
                type="text"
                value={formData.fish_type}
                onChange={(e) =>
                  setFormData({ ...formData, fish_type: e.target.value })
                }
                placeholder="e.g. Tilapia"
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Stocking Date</label>
              <input
                type="date"
                value={formData.stocking_date}
                onChange={(e) =>
                  setFormData({ ...formData, stocking_date: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Initial Fish Count</label>
              <input
                type="number"
                value={formData.initial_fish_count}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    initial_fish_count: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
                <option value="maintenance">maintenance</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-btn" disabled={submitting}>
                {submitting
                  ? "Saving..."
                  : editingPond
                  ? "Update Pond"
                  : "Create Pond"}
              </button>

              <button
                type="button"
                className="secondary-btn"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Ponds;