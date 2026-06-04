"use client";

import React from "react";

interface DashboardMetricsProps {
  totalProjectsCount: number;
  totalTasksCount: number;
  completedTasksCount: number;
  overdueTasksCount: number;
  isTeamMember: boolean;
}

export default function DashboardMetrics({
  totalProjectsCount,
  totalTasksCount,
  completedTasksCount,
  overdueTasksCount,
  isTeamMember
}: DashboardMetricsProps) {
  return (
    <section className="kpi-grid">
      {/* Projects Metric */}
      <div className="kpi-card">
        <div className="kpi-icon-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" x2="4" y1="22" y2="15" />
          </svg>
        </div>
        <div className="kpi-data">
          <span className="kpi-value">{totalProjectsCount}</span>
          <span className="kpi-label">Projects</span>
        </div>
      </div>

      {/* Tasks Metric */}
      <div className="kpi-card">
        <div className="kpi-icon-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </div>
        <div className="kpi-data">
          <span className="kpi-value">{totalTasksCount}</span>
          <span className="kpi-label">{isTeamMember ? "My Tasks" : "Total Tasks"}</span>
        </div>
      </div>

      {/* Completed Metric */}
      <div className="kpi-card">
        <div className="kpi-icon-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="kpi-data">
          <span className="kpi-value">{completedTasksCount}</span>
          <span className="kpi-label">Completed</span>
        </div>
      </div>

      {/* Overdue Metric */}
      <div className="kpi-card">
        <div
          className="kpi-icon-container"
          style={{
            borderStyle: overdueTasksCount > 0 ? "solid" : "dashed",
            borderColor: overdueTasksCount > 0 ? "var(--danger)" : "var(--border)"
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: overdueTasksCount > 0 ? "var(--danger)" : "inherit" }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
        </div>
        <div className="kpi-data">
          <span
            className="kpi-value"
            style={{ color: overdueTasksCount > 0 ? "var(--danger)" : "inherit" }}
          >
            {overdueTasksCount}
          </span>
          <span className="kpi-label">Overdue</span>
        </div>
      </div>
    </section>
  );
}
