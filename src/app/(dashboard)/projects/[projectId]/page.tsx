"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useGetProjectByIdQuery, mapBackendProjectStatusToFrontend } from "@/redux/api/projectApi";
import { Project, Task, TEAM_MEMBERS } from "@/types";
import { logActivity } from "@/utils/activityLogger";
import CreateTaskModal from "@/components/CreateTaskModal";

interface PageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default function ProjectDetailsPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const projectId = resolvedParams.projectId;

  const { user } = useAuth();
  
  // Tasks state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [validationError, setValidationError] = useState("");
  
  // Filter states
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState("all");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState("all");

  // Custom confirmation modal for task deletion
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const todayDateString = new Date().toISOString().split("T")[0];

  // Fetch project details from live backend API
  const { data: projectResponse, isLoading: projectLoading, error: projectError } = useGetProjectByIdQuery(projectId);

  // Load tasks from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTasks = localStorage.getItem("sptc-tasks");
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    }
  }, []);

  if (!user) return null;

  // Permissions
  const canManageTasks = user.role === "Admin" || user.role === "Project Manager";
  const canChangeTaskStatus = (task: Task) => {
    return user.role === "Admin" || user.role === "Project Manager" || task.assignedTo === user.email;
  };

  // Helper date validator
  const isPastDate = (dateStr: string) => {
    const checkDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  if (projectLoading) {
    return (
      <div className="loader-container">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  const backendProject = projectResponse?.data;
  if (projectError || !backendProject) {
    return (
      <div style={{ padding: "32px", maxWidth: "600px", margin: "40px auto", textAlign: "center" }}>
        <div className="alert alert-danger" style={{ display: "inline-flex", alignItems: "center", gap: "8px", width: "100%", justifyContent: "center" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          <span>Failed to load project details. It may have been deleted or does not exist.</span>
        </div>
        <div style={{ marginTop: "16px" }}>
          <Link href="/projects" className="btn btn-secondary" style={{ display: "inline-flex", width: "auto" }}>
            Back to Projects Directory
          </Link>
        </div>
      </div>
    );
  }

  // Map to local Project type format
  const project: Project = {
    id: backendProject.id,
    name: backendProject.name,
    description: backendProject.description || "",
    deadline: backendProject.deadline ? backendProject.deadline.split("T")[0] : "",
    status: mapBackendProjectStatusToFrontend(backendProject.status),
  };

  // Filter tasks specific to this project
  const projectTasks = tasks.filter((t) => t.projectId === project.id);

  // Apply filters
  const filteredTasks = projectTasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(taskSearchQuery.toLowerCase());
    const matchesStatus = taskStatusFilter === "all" || t.status === taskStatusFilter;
    const matchesPriority = taskPriorityFilter === "all" || t.priority === taskPriorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate KPIs
  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter((t) => t.status === "Completed").length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Handlers for Tasks CRUD
  const handleOpenCreateTask = () => {
    setEditingTask(null);
    setValidationError("");
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setEditingTask(task);
    setValidationError("");
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (taskData: {
    title: string;
    description: string;
    projectId: string;
    assignedTo: string;
    dueDate: string;
    priority: "High" | "Medium" | "Low";
    status: "Todo" | "In Progress" | "Completed";
  }) => {
    // 1. Validate past due date
    if (isPastDate(taskData.dueDate)) {
      setValidationError("Please select a valid deadline.");
      return;
    }

    // 2. Validate duplicate task name
    const isDuplicate = tasks.some(
      (t) =>
        t.projectId === project.id &&
        t.title.toLowerCase().trim() === taskData.title.toLowerCase().trim() &&
        t.id !== editingTask?.id
    );
    if (isDuplicate) {
      setValidationError("This task already exists in the project.");
      return;
    }

    // 3. Validate completed task reassignment
    if (editingTask && editingTask.status === "Completed" && editingTask.assignedTo !== taskData.assignedTo) {
      setValidationError("Completed tasks cannot be reassigned.");
      return;
    }

    let updatedTasks: Task[] = [];
    if (editingTask) {
      // Edit
      updatedTasks = tasks.map((t) => {
        if (t.id === editingTask.id) {
          return { ...t, ...taskData };
        }
        return t;
      });
      
      // Log update activity
      if (editingTask.status !== taskData.status) {
        logActivity(`Task "${taskData.title}" status was marked as "${taskData.status}" by ${user.name.split(" ")[0]}.`);
      } else if (editingTask.assignedTo !== taskData.assignedTo) {
        const shortEmail = taskData.assignedTo.split("@")[0];
        logActivity(`Task "${taskData.title}" was reassigned to ${shortEmail} by ${user.name.split(" ")[0]}.`);
      } else {
        logActivity(`Task "${taskData.title}" details were updated by ${user.name.split(" ")[0]}.`);
      }
    } else {
      // Create
      const newTask: Task = {
        id: `task-${Date.now()}`,
        ...taskData,
        createdAt: new Date().toISOString(),
      };
      updatedTasks = [...tasks, newTask];

      const shortEmail = taskData.assignedTo.split("@")[0];
      logActivity(`Task "${taskData.title}" was created and assigned to ${shortEmail} by ${user.name.split(" ")[0]}.`);
    }

    setTasks(updatedTasks);
    localStorage.setItem("sptc-tasks", JSON.stringify(updatedTasks));
    setIsTaskModalOpen(false);
    setValidationError("");
  };

  const handleDeleteTaskClick = (task: Task) => {
    if (!canManageTasks) return;
    setTaskToDelete(task);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDeleteTaskAction = () => {
    if (!taskToDelete) return;
    const updatedTasks = tasks.filter((t) => t.id !== taskToDelete.id);
    setTasks(updatedTasks);
    localStorage.setItem("sptc-tasks", JSON.stringify(updatedTasks));
    logActivity(`Task "${taskToDelete.title}" was deleted by ${user.name.split(" ")[0]}.`);
    setIsConfirmDeleteOpen(false);
    setTaskToDelete(null);
  };

  const handleQuickStatusChange = (task: Task, newStatus: "Todo" | "In Progress" | "Completed") => {
    if (!canChangeTaskStatus(task)) return;

    const updatedTasks = tasks.map((t) => {
      if (t.id === task.id) {
        return { ...t, status: newStatus };
      }
      return t;
    });
    setTasks(updatedTasks);
    localStorage.setItem("sptc-tasks", JSON.stringify(updatedTasks));

    logActivity(`Task "${task.title}" status was updated to "${newStatus}" by ${user.name.split(" ")[0]}.`);
  };

  const projectList: Project[] = [project];
  const isOverdue = project.deadline < todayDateString && project.status !== "Completed";

  return (
    <>
      {/* Back Button */}
      <div style={{ marginBottom: "20px" }}>
        <Link
          href="/projects"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            fontWeight: "500",
            color: "var(--muted)",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back to Projects</span>
        </Link>
      </div>

      {/* Project Meta Info Panel */}
      <section className="dashboard-panel" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "8px" }}>
              <h2 className="welcome-title" style={{ margin: 0, fontSize: "24px" }}>{project.name}</h2>
              <span className={`tag tag-status-${project.status.toLowerCase().replace(" ", "-")}`}>
                {project.status}
              </span>
            </div>
            <p style={{ color: "var(--muted)", fontSize: "14px", margin: 0, maxWidth: "720px", lineHeight: "1.5" }}>
              {project.description || "No project description provided."}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 14px",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border)",
              backgroundColor: "var(--secondary)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isOverdue ? "var(--danger)" : "currentColor"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "10px", color: "var(--muted)", textTransform: "uppercase", fontWeight: "600" }}>
                Deadline
              </span>
              <span style={{ fontSize: "13px", fontWeight: "500", color: isOverdue ? "var(--danger)" : "var(--foreground)" }}>
                {project.deadline || "No deadline set"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Stats Grid */}
      <div className="kpi-grid" style={{ marginBottom: "24px" }}>
        <div className="kpi-card">
          <div className="kpi-icon-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
          </div>
          <div className="kpi-data">
            <span className="kpi-value">{totalTasks}</span>
            <span className="kpi-label">Total Tasks</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-container" style={{ color: "var(--success)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div className="kpi-data">
            <span className="kpi-value">{completedTasks}</span>
            <span className="kpi-label">Completed</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-container" style={{ color: "var(--warning)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div className="kpi-data">
            <span className="kpi-value">{pendingTasks}</span>
            <span className="kpi-label">Pending</span>
          </div>
        </div>

        <div className="kpi-card">
          <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span className="kpi-value">{completionRate}%</span>
              <span className="kpi-label">Progress</span>
            </div>
            <div style={{ width: "100%", height: "6px", backgroundColor: "var(--border)", borderRadius: "3px", overflow: "hidden", marginTop: "8px" }}>
              <div style={{ width: `${completionRate}%`, height: "100%", backgroundColor: "var(--primary)", transition: "width 0.3s ease" }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Scoped Project Tasks Section */}
      <section className="dashboard-panel">
        <div className="panel-header" style={{ marginBottom: "20px" }}>
          <h3 className="panel-title" style={{ fontSize: "16px" }}>Project Tasks</h3>
        </div>

        {/* Filters Row */}
        <div className="filters-row">
          <div className="search-input-wrapper">
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
              placeholder="Search project tasks..."
              className="form-input search-input"
              value={taskSearchQuery}
              onChange={(e) => setTaskSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-item">
            <select
              className="form-input form-select"
              value={taskStatusFilter}
              onChange={(e) => setTaskStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="filter-item">
            <select
              className="form-input form-select"
              value={taskPriorityFilter}
              onChange={(e) => setTaskPriorityFilter(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {canManageTasks && (
            <div style={{ marginLeft: "auto" }}>
              <button className="btn btn-primary" onClick={handleOpenCreateTask} style={{ width: "auto" }}>
                + New Task
              </button>
            </div>
          )}
        </div>

        {/* Tasks Table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Task Title</th>
                <th>Assignee</th>
                <th>Due Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--muted)", padding: "24px" }}>
                    No tasks found for this project.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const isOwner = task.assignedTo === user.email;
                  const hasStatusTogglePermission = canChangeTaskStatus(task);
                  const assigneeName = TEAM_MEMBERS.find((m) => m.email === task.assignedTo)?.name.split(" ")[0] || task.assignedTo;

                  return (
                    <tr key={task.id}>
                      <td>
                        <div style={{ fontWeight: "500" }}>{task.title}</div>
                        {task.description && (
                          <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>
                            {task.description}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: "12px" }}>{assigneeName}</span>
                      </td>
                      <td>
                        <span
                          style={{
                            color:
                              task.dueDate < todayDateString && task.status !== "Completed"
                                ? "var(--danger)"
                                : "inherit",
                          }}
                        >
                          {task.dueDate}
                        </span>
                      </td>
                      <td>
                        <span className={`tag tag-priority-${task.priority.toLowerCase()}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td>
                        {hasStatusTogglePermission ? (
                          <select
                            className="form-input"
                            style={{ padding: "4px 8px", fontSize: "12px", width: "auto" }}
                            value={task.status}
                            onChange={(e) => handleQuickStatusChange(task, e.target.value as any)}
                          >
                            <option value="Todo">Todo</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        ) : (
                          <span className={`tag tag-status-${task.status.toLowerCase().replace(" ", "-")}`}>
                            {task.status}
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="action-btn-group">
                          {canManageTasks ? (
                            <>
                              <button
                                onClick={() => handleOpenEditTask(task)}
                                className="action-btn"
                                title="Edit Task"
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
                                  <path d="M12 20h9" />
                                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteTaskClick(task)}
                                className="action-btn action-btn-danger"
                                title="Delete Task"
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
                            </>
                          ) : isOwner ? (
                            <button
                              onClick={() => handleOpenEditTask(task)}
                              className="action-btn"
                              title="Edit Task Status"
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
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                              </svg>
                            </button>
                          ) : (
                            <span style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>
                              No access
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Task Create / Edit Modal */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
          setValidationError("");
        }}
        onSubmit={handleSaveTask}
        editingTask={editingTask}
        projects={projectList}
        canManageTasks={canManageTasks}
        validationError={validationError}
        setValidationError={setValidationError}
      />

      {/* Custom Task Delete Confirmation Modal */}
      {isConfirmDeleteOpen && taskToDelete && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "400px" }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: "var(--danger)" }}>Confirm Delete Task</h3>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setIsConfirmDeleteOpen(false);
                  setTaskToDelete(null);
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ margin: "16px 0", fontSize: "14px", color: "var(--foreground)" }}>
              <p>Are you sure you want to permanently delete task <strong>{taskToDelete.title}</strong>?</p>
              <p style={{ marginTop: "8px", fontSize: "12px", color: "var(--muted)" }}>This action will permanently remove the task and cannot be undone.</p>
            </div>

            <div className="modal-footer" style={{ gap: "10px" }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: "auto" }}
                onClick={() => {
                  setIsConfirmDeleteOpen(false);
                  setTaskToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: "auto", backgroundColor: "var(--danger)", borderColor: "var(--danger)", color: "#ffffff" }}
                onClick={confirmDeleteTaskAction}
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
