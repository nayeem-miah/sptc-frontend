"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardMetrics from "@/components/DashboardMetrics";
import WorkloadSummary from "@/components/WorkloadSummary";
import { Project, Task } from "@/types";
import { Activity } from "@/utils/activityLogger";

const DEFAULT_ACTIVITIES: Activity[] = [
  { id: "act-1", time: "10:00 AM", message: 'Project "E-Commerce App" created' },
  { id: "act-2", time: "10:15 AM", message: 'Task "Setup API" assigned to John' },
  { id: "act-3", time: "10:30 AM", message: 'Task "Homepage Design" marked as Completed' }
];

const DEFAULT_PROJECTS: Project[] = [
  { id: "proj-1", name: "Website Redesign", description: "Revamp corporate landing page", deadline: "2026-06-25", status: "Active" },
  { id: "proj-2", name: "Mobile App Development", description: "Build iOS/Android task companion", deadline: "2026-06-30", status: "Active" },
  { id: "proj-3", name: "Admin Portal Panel", description: "Metrics dashboard layout integration", deadline: "2026-06-08", status: "On Hold" }
];

const DEFAULT_TASKS: Task[] = [
  { id: "task-1", title: "Setup API Gateway", description: "Proxy requests to serverless backends", projectId: "proj-1", assignedTo: "member@sptc.com", dueDate: "2026-06-15", priority: "High", status: "In Progress", createdAt: "2026-06-01T10:00:00.000Z" },
  { id: "task-2", title: "Homepage Layout Figma", description: "Design low fidelity wireframes", projectId: "proj-1", assignedTo: "member@sptc.com", dueDate: "2026-06-18", priority: "Medium", status: "Completed", createdAt: "2026-06-01T10:15:00.000Z" },
  { id: "task-3", title: "Database Schema Setup", description: "Configure relations and tables", projectId: "proj-2", assignedTo: "manager@sptc.com", dueDate: "2026-06-20", priority: "High", status: "Todo", createdAt: "2026-06-01T10:30:00.000Z" },
  { id: "task-4", title: "Auth Frontend Component", description: "Setup login screens and validations", projectId: "proj-2", assignedTo: "admin@sptc.com", dueDate: "2026-06-12", priority: "High", status: "Todo", createdAt: "2026-06-01T11:00:00.000Z" }
];

export default function Home() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  const todayDateString = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedProjects = localStorage.getItem("sptc-projects");
      setProjects(storedProjects ? JSON.parse(storedProjects) : DEFAULT_PROJECTS);

      const storedTasks = localStorage.getItem("sptc-tasks");
      setTasks(storedTasks ? JSON.parse(storedTasks) : DEFAULT_TASKS);

      const storedLogs = localStorage.getItem("sptc-activity-log");
      setActivities(storedLogs ? JSON.parse(storedLogs) : DEFAULT_ACTIVITIES);
    }
  }, []);

  if (!user) return null;

  // Stats Calculations
  const displayTasks = user.role === "Team Member" ? tasks.filter((t) => t.assignedTo === user.email) : tasks;
  const totalProjectsCount = projects.length;
  const totalTasksCount = displayTasks.length;
  const completedTasksCount = displayTasks.filter((t) => t.status === "Completed").length;
  const overdueTasksCount = displayTasks.filter((t) => t.dueDate < todayDateString && t.status !== "Completed").length;

  return (
    <>
      {/* Welcome Section */}
      <section className="welcome-section">
        <h2 className="welcome-title">Workspace Dashboard</h2>
        <p className="welcome-subtitle">
          {user.role === "Team Member"
            ? `Welcome back, ${user.name.split(" ")[0]}! Track your assigned workloads and tasks status.`
            : `Welcome back, ${user.name.split(" ")[0]}! Delegate projects, organize workloads, and configure layouts.`}
        </p>
      </section>

      {/* Dynamic Metric Cards */}
      <DashboardMetrics
        totalProjectsCount={totalProjectsCount}
        totalTasksCount={totalTasksCount}
        completedTasksCount={completedTasksCount}
        overdueTasksCount={overdueTasksCount}
        isTeamMember={user.role === "Team Member"}
      />

      {/* Overview Grid */}
      <section style={{ marginTop: "32px" }} className="dashboard-grid">
        {/* Main Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* System Activity */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">System Activity</h3>
            </div>

            {activities.length === 0 ? (
              <div style={{ fontSize: "13px", color: "var(--muted)", textAlign: "center", padding: "20px 0" }}>
                No recent events.
              </div>
            ) : (
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "16px" }}>
                {activities.slice(0, 5).map((act) => (
                  <li key={act.id} style={{ display: "flex", gap: "12px", fontSize: "14px" }}>
                    <span style={{ color: "var(--primary)", fontWeight: "600", minWidth: "60px" }}>
                      {act.time}
                    </span>
                    <span style={{ color: "var(--foreground)" }}>
                      {act.message}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Role-Based System Access Overview */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">Role-Based System Access Overview</h3>
            </div>

            <div className="role-info-card">
              <div className="role-info-title">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ color: "var(--primary)" }}
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>
                  Logged in as: {user.name} ({user.role})
                </span>
              </div>
              <p className="role-info-desc">
                {user.role === "Admin" &&
                  "As an Administrator, you have complete control over all data. You can delete projects, manage team memberships, modify task details, and override assignees."}
                {user.role === "Project Manager" &&
                  "As a Project Manager, you can create projects and delegate tasks. You are restricted from deleting global project configurations."}
                {user.role === "Team Member" &&
                  "As a Team Member, you can view project scopes and update the completion status of tasks specifically assigned to your account."}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <WorkloadSummary tasks={tasks} />
      </section>
    </>
  );
}
