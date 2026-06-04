"use client";

import React, { useState } from "react";
import { useAuth, UserRole } from "@/context/AuthContext";

export default function UserManagementPage() {
  const { user, users, updateUserRole, deleteUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Custom Delete Modal states
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!user) return null;

  // Access control
  if (user.role !== "Admin") {
    return (
      <div className="alert alert-danger" style={{ margin: "24px 0", padding: "20px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>Access Denied</h3>
        <p style={{ fontSize: "14px", color: "var(--danger)" }}>
          You do not have permission to access the User Management panel. This route is restricted to system Administrators.
        </p>
      </div>
    );
  }

  // Filter users based on search
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistics
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "Admin").length;
  const pmCount = users.filter((u) => u.role === "Project Manager").length;
  const memberCount = users.filter((u) => u.role === "Team Member").length;

  const handleRoleChange = (userId: string, targetName: string, newRole: UserRole) => {
    updateUserRole(userId, newRole);
    setSuccessMessage(`Successfully updated ${targetName}'s role to ${newRole}`);
    setTimeout(() => {
      setSuccessMessage("");
    }, 4000);
  };

  const handleDeleteClick = (userId: string, targetName: string) => {
    setUserToDelete({ id: userId, name: targetName });
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteAction = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    const success = await deleteUser(userToDelete.id);
    setIsDeleting(false);
    setIsConfirmModalOpen(false);
    if (success) {
      setSuccessMessage(`Successfully deleted user ${userToDelete.name}`);
      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    } else {
      setErrorMessage(`Failed to delete user ${userToDelete.name}. Please try again.`);
      setTimeout(() => {
        setErrorMessage("");
      }, 4000);
    }
    setUserToDelete(null);
  };

  return (
    <>
      {/* Page Header */}
      <section className="welcome-section">
        <h2 className="welcome-title">User Management</h2>
        <p className="welcome-subtitle">
          Manage system users, change workspace permissions, and audit role scopes.
        </p>
      </section>

      {/* Stats Cards */}
      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div className="kpi-data">
            <span className="kpi-value">{totalUsers}</span>
            <span className="kpi-label">Total Users</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <div className="kpi-data">
            <span className="kpi-value">{adminCount}</span>
            <span className="kpi-label">Admins</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7h-9L9 5H4a2 2 0 0 0-2 2v10c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2V9c0-1.1-.9-2-2-2z"/></svg>
          </div>
          <div className="kpi-data">
            <span className="kpi-value">{pmCount}</span>
            <span className="kpi-label">Managers</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="19" cy="11" r="3"/></svg>
          </div>
          <div className="kpi-data">
            <span className="kpi-value">{memberCount}</span>
            <span className="kpi-label">Team Members</span>
          </div>
        </div>
      </section>

      {/* Success Notification */}
      {successMessage && (
        <div className="alert alert-success" style={{ marginTop: "20px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span style={{ fontSize: "13px", fontWeight: "500" }}>{successMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="alert alert-danger" style={{ marginTop: "20px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
          <span style={{ fontSize: "13px", fontWeight: "500" }}>{errorMessage}</span>
        </div>
      )}

      {/* Actions / Filter row */}
      <div className="filters-row" style={{ marginTop: "24px", justifyContent: "space-between" }}>
        <div className="search-input-wrapper" style={{ maxWidth: "360px" }}>
          <svg
            className="search-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" x2="16.65" y1="21" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="form-input search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container" style={{ marginTop: "16px" }}>
        <table className="table">
          <thead>
            <tr>
              <th>User Name</th>
              <th>Email Address</th>
              <th>System Role</th>
              <th style={{ width: "200px" }}>Role Access Permissions</th>
              <th style={{ width: "80px", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "var(--muted)", padding: "24px" }}>
                  No users matched your search criteria.
                </td>
              </tr>
            ) : (
              filteredUsers.map((item) => {
                const isSelf = item.id === user.id;

                return (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            backgroundColor: "var(--secondary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "13px",
                            fontWeight: "600",
                            color: "var(--primary)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span style={{ fontWeight: "500" }}>{item.name}</span>
                          {isSelf && (
                            <span
                              style={{
                                marginLeft: "8px",
                                fontSize: "10px",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                backgroundColor: "var(--secondary)",
                                border: "1px solid var(--border)",
                                color: "var(--muted)",
                                fontWeight: "600",
                              }}
                            >
                              You
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: "var(--muted)", fontSize: "13px" }}>{item.email}</span>
                    </td>
                    <td>
                      <span className={`tag tag-status-${item.role.toLowerCase().replace(" ", "-")}`}>
                        {item.role}
                      </span>
                    </td>
                    <td>
                      <select
                        className="form-input form-select"
                        value={item.role}
                        onChange={(e) => handleRoleChange(item.id, item.name, e.target.value as UserRole)}
                        disabled={isSelf}
                        title={isSelf ? "Self-demotion prevention enabled" : "Select new user role"}
                        style={{
                          height: "36px",
                          padding: "6px 12px",
                          fontSize: "13px",
                          backgroundColor: isSelf ? "var(--secondary)" : "var(--input-bg)",
                          cursor: isSelf ? "not-allowed" : "pointer",
                        }}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Project Manager">Project Manager</option>
                        <option value="Team Member">Team Member</option>
                      </select>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        onClick={() => handleDeleteClick(item.id, item.name)}
                        className="action-btn action-btn-danger"
                        disabled={isSelf}
                        title={isSelf ? "You cannot delete yourself" : `Delete user ${item.name}`}
                        style={{
                          opacity: isSelf ? 0.4 : 1,
                          cursor: isSelf ? "not-allowed" : "pointer",
                          backgroundColor: "transparent",
                          borderColor: isSelf ? "var(--border)" : "var(--danger-border)",
                          color: isSelf ? "var(--muted)" : "var(--danger)",
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {isConfirmModalOpen && userToDelete && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "400px" }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: "var(--danger)" }}>Confirm Delete User</h3>
              <button
                className="modal-close-btn"
                onClick={() => { setIsConfirmModalOpen(false); setUserToDelete(null); }}
                disabled={isDeleting}
              >
                ✕
              </button>
            </div>
            
            <div style={{ margin: "16px 0", fontSize: "14px", color: "var(--foreground)" }}>
              <p>Are you sure you want to permanently delete user <strong>{userToDelete.name}</strong>?</p>
              <p style={{ marginTop: "8px", fontSize: "12px", color: "var(--muted)" }}>This action cannot be undone.</p>
            </div>

            <div className="modal-footer" style={{ gap: "10px" }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: "auto" }}
                onClick={() => { setIsConfirmModalOpen(false); setUserToDelete(null); }}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: "auto", backgroundColor: "var(--danger)", borderColor: "var(--danger)", color: "#ffffff" }}
                onClick={confirmDeleteAction}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
