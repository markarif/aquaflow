import { useState } from "react";
import {
  createUser,
  updateUser,
  deleteUser,
  updateUserPassword,
} from "./api";

function Users({ users, ponds, onUserUpdated }) {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [resetPasswordUserId, setResetPasswordUserId] = useState(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "staff_trainee",
    assigned_pond_id: "",
  });

  const [passwordData, setPasswordData] = useState({
    password: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      password: "",
      role: "staff_trainee",
      assigned_pond_id: "",
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setFormData({
      full_name: "",
      email: "",
      password: "",
      role: "staff_trainee",
      assigned_pond_id: "",
    });
    setShowForm(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name || "",
      email: user.email || "",
      password: "",
      role: user.role || "staff_trainee",
      assigned_pond_id: user.assigned_pond_id || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (userId) => {
    const confirmed = window.confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;

    try {
      await deleteUser(userId);
      await onUserUpdated();
      alert("User deleted successfully");
    } catch (error) {
      alert(error.message || "Failed to delete user");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        role: formData.role,
        assigned_pond_id:
          formData.role === "admin" || formData.assigned_pond_id === ""
            ? null
            : Number(formData.assigned_pond_id),
      };

      if (editingUser) {
        await updateUser(editingUser.id, payload);
        alert("User updated successfully");
      } else {
        await createUser({
          ...payload,
          password: formData.password,
        });
        alert("User created successfully");
      }

      await onUserUpdated();
      resetForm();
    } catch (error) {
      alert(error.message || "Failed to save user");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (!passwordData.password) {
      alert("Please enter a new password");
      return;
    }

    try {
      await updateUserPassword(resetPasswordUserId, {
        password: passwordData.password,
      });

      alert("Password updated successfully");
      setResetPasswordUserId(null);
      setPasswordData({ password: "" });
      await onUserUpdated();
    } catch (error) {
      alert(error.message || "Failed to update password");
    }
  };

  const getPondName = (pondId) => {
    const pond = ponds.find((p) => Number(p.id) === Number(pondId));
    return pond ? pond.pond_name : "-";
  };

  return (
    <div className="users-page">
      <div className="section-header">
        <h2>User Management</h2>
        <button className="primary-btn" onClick={handleAddNew}>
          Add User
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Assigned Pond</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.full_name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.assigned_pond_id ? getPondName(user.assigned_pond_id) : "-"}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(user)}
                      >
                        Edit
                      </button>
                      <button
                        className="secondary-btn"
                        onClick={() => setResetPasswordUserId(user.id)}
                      >
                        Reset Password
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(user.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>{editingUser ? "Edit User" : "Add User"}</h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            {!editingUser && (
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Role</label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value,
                    assigned_pond_id: e.target.value === "admin" ? "" : formData.assigned_pond_id,
                  })
                }
                required
              >
                <option value="admin">admin</option>
                <option value="pond_manager">pond_manager</option>
                <option value="staff_trainee">staff_trainee</option>
              </select>
            </div>

            {formData.role !== "admin" && (
              <div className="form-group">
                <label>Assigned Pond</label>
                <select
                  value={formData.assigned_pond_id}
                  onChange={(e) =>
                    setFormData({ ...formData, assigned_pond_id: e.target.value })
                  }
                  required
                >
                  <option value="">Select pond</option>
                  {ponds.map((pond) => (
                    <option key={pond.id} value={pond.id}>
                      {pond.pond_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="primary-btn" disabled={submitting}>
                {submitting
                  ? "Saving..."
                  : editingUser
                  ? "Update User"
                  : "Create User"}
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

      {resetPasswordUserId && (
        <div className="form-card">
          <h3>Reset User Password</h3>

          <form onSubmit={handlePasswordReset}>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={passwordData.password}
                onChange={(e) =>
                  setPasswordData({ password: e.target.value })
                }
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-btn">
                Update Password
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setResetPasswordUserId(null);
                  setPasswordData({ password: "" });
                }}
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

export default Users;