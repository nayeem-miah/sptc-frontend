"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardMetrics from "@/components/DashboardMetrics";
import WorkloadSummary from "@/components/WorkloadSummary";
import { Project, Task } from "@/types";
import { Activity } from "@/utils/activityLogger";
import { useGetProjectsQuery, mapBackendProjectStatusToFrontend } from "@/redux/api/projectApi";
import {
  useGetTasksQuery,
  mapBackendTaskStatusToFrontend,
  mapBackendTaskPriorityToFrontend
} from "@/redux/api/taskApi";

const DEFAULT_ACTIVITIES: Activity[] = [
  { id: "act-1", time: "10:00 AM", message: 'Project "E-Commerce App" created' },
  { id: "act-2", time: "10:15 AM", message: 'Task "Setup API" assigned to John' },
  { id: "act-3", time: "10:30 AM", message: 'Task "Homepage Design" marked as Completed' }
];

export default function Home() {
  const { user, users } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);

  const todayDateString = new Date().toISOString().split("T")[0];

  // Fetch projects and tasks from the live backend
  const { data: projectsResponse, isLoading: projectsLoading } = useGetProjectsQuery(undefined);
  const { data: tasksResponse, isLoading: tasksLoading } = useGetTasksQuery(undefined);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLogs = localStorage.getItem("sptc-activity-log");
      setActivities(storedLogs ? JSON.parse(storedLogs) : DEFAULT_ACTIVITIES);
    }
  }, []);

  if (!user) return null;

  if (projectsLoading || tasksLoading) {
    return (
      <div className="loader-container">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  // Convert backend projects array to frontend format
  const backendProjectsList = projectsResponse?.data?.data || [];
  const projects: Project[] = backendProjectsList.map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description || "",
    deadline: p.deadline ? p.deadline.split("T")[0] : "",
    status: mapBackendProjectStatusToFrontend(p.status),
  }));

  // Convert backend tasks array to frontend format
  const backendTasksList = tasksResponse?.data?.data || [];
  const tasks: Task[] = backendTasksList.map((t: any) => {
    let email = t.assignedTo || "";
    if (t.assignedMember?.email) {
      email = t.assignedMember.email;
    } else if (t.assignedMemberId) {
      const matched = users.find((u) => u.id === t.assignedMemberId);
      if (matched) email = matched.email;
    }

    return {
      id: t.id,
      title: t.title,
      description: t.description || "",
      projectId: t.projectId || "",
      assignedTo: email,
      dueDate: t.dueDate ? t.dueDate.split("T")[0] : "",
      priority: mapBackendTaskPriorityToFrontend(t.priority),
      status: mapBackendTaskStatusToFrontend(t.status),
      createdAt: t.createdAt || new Date().toISOString()
    };
  });

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
