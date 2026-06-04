"use client";

import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated || !user) {
    return (
      <div className="loader-container">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  // Get first character of name for avatar
  const avatarLetter = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  // Determine role-specific styling class
  const getRoleBadgeClass = () => {
    if (!user) return "";
    switch (user.role) {
      case "Admin":
        return "badge-admin";
      case "Project Manager":
        return "badge-manager";
      default:
        return "badge-member";
    }
  };

  // Content based on Role
  const getRolePermissionsDescription = () => {
    if (!user) return "";
    switch (user.role) {
      case "Admin":
        return "You have unrestricted access to the entire collaboration suite. You can provision new project dashboards, audit user operations, define workflow schemas, and re-assign tasks across any active project boards.";
      case "Project Manager":
        return "You have project management authority. You can spin up new projects, set delivery milestones, and delegate tasks to team members. Note that system-level configurations are restricted to Administrators.";
      default:
        return "You have standard workspace permissions. You are authorized to access project workspaces you have been added to, track your workloads, comment on tasks, and toggle task completion status.";
    }
  };

  return (
    <div className="dashboard-container">
      {/* Dashboard Top Header */}
      <header className="dashboard-header">
        <div className="dashboard-logo">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--primary)" }}
          >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span>SPTC</span>
        </div>

        <div className="dashboard-nav-right">
          {/* Theme Switcher in Dashboard as requested */}
          <ThemeToggle />

          <div
            style={{
              width: "1px",
              height: "24px",
              backgroundColor: "var(--border)",
            }}
          ></div>

          {/* User Details */}
          <div className="user-profile">
            <div className="user-avatar">{avatarLetter}</div>
            <div className="user-meta">
              <span className="user-name">{user.name}</span>
              <span className={`user-role-badge ${getRoleBadgeClass()}`}>
                {user.role}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="btn-icon-logout"
            title="Log out"
            aria-label="Logout"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Dashboard Panel */}
      <main className="dashboard-main">
        {/* Welcome message */}
        <section className="welcome-section">
          <h2 className="welcome-title">Welcome back, {user.name.split(" ")[0]}!</h2>
          <p className="welcome-subtitle">
            Here's what's happening across your collaboration projects today.
          </p>
        </section>

        {/* Mock KPI Indicators */}
        <section className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
            </div>
            <div className="kpi-data">
              <span className="kpi-value">5</span>
              <span className="kpi-label">Active Projects</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            </div>
            <div className="kpi-data">
              <span className="kpi-value">18</span>
              <span className="kpi-label">Total Tasks</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div className="kpi-data">
              <span className="kpi-value">12</span>
              <span className="kpi-label">Completed Tasks</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            </div>
            <div className="kpi-data">
              <span className="kpi-value">6</span>
              <span className="kpi-label">Pending Tasks</span>
            </div>
          </div>
        </section>

        {/* Dashboard Grid split panel */}
        <div className="dashboard-grid">
          {/* Main workspace info */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">Active Role Status</h3>
              <span className={`user-role-badge ${getRoleBadgeClass()}`}>{user.role} Permissions</span>
            </div>

            <div className="role-info-card">
              <div className="role-info-title">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ color: "var(--primary)" }}
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Authorization Context</span>
              </div>
              <p className="role-info-desc">{getRolePermissionsDescription()}</p>
            </div>

            <div style={{ marginTop: "24px", color: "var(--muted)", fontSize: "14px" }}>
              <p>📌 This is a frontend demo. The full collaborative workspaces, real-time board syncs, and file attachments are ready to be integrated into this Next.js app.</p>
            </div>
          </div>

          {/* Quick Shortcuts / Settings panel */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">System Activity</h3>
            </div>

            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "16px" }}>
              <li style={{ display: "flex", gap: "12px", fontSize: "14px" }}>
                <span style={{ color: "var(--primary)", fontWeight: "600" }}>10:30 AM</span>
                <span style={{ color: "var(--foreground)" }}>Task "Home Design" marked as completed</span>
              </li>
              <li style={{ display: "flex", gap: "12px", fontSize: "14px" }}>
                <span style={{ color: "var(--primary)", fontWeight: "600" }}>10:15 AM</span>
                <span style={{ color: "var(--foreground)" }}>Task "Setup API" assigned to John Doe</span>
              </li>
              <li style={{ display: "flex", gap: "12px", fontSize: "14px" }}>
                <span style={{ color: "var(--primary)", fontWeight: "600" }}>10:00 AM</span>
                <span style={{ color: "var(--foreground)" }}>Project "E-Commerce App" created</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
