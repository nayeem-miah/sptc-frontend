"use client";

import React, { useState } from "react";
import { Project, Task, TEAM_MEMBERS, User } from "@/types";

interface TaskTableProps {
  tasks: Task[];
  projects: Project[];
  user: User;
  canManageTasks: boolean;
  canChangeTaskStatus: (task: Task) => boolean;
  onQuickStatusChange: (task: Task, newStatus: "Todo" | "In Progress" | "Completed") => void;
  onOpenCreateTask: () => void;
  onOpenEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  todayDateString: string;
}

export default function TaskTable({
  tasks,
  projects,
  user,
  canManageTasks,
  canChangeTaskStatus,
  onQuickStatusChange,
  onOpenCreateTask,
  onOpenEditTask,
  onDeleteTask,
  todayDateString
}: TaskTableProps) {
  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [deadlineFilter, setDeadlineFilter] = useState("all"); // "all" | "upcoming" | "overdue"
  const [sortBy, setSortBy] = useState("latest"); // "latest" | "deadline" | "priority"

  // Filter Logic
  const filteredTasks = tasks.filter((t) => {
    // 1. Search Query
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Project Filter
    const matchesProject = projectFilter === "all" || t.projectId === projectFilter;

    // 3. Status Filter
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;

    // 4. Priority Filter
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;

    // 5. Assignee Filter (Only available to Admin / PM)
    const matchesAssignee = assigneeFilter === "all" || t.assignedTo === assigneeFilter;

    // 6. Deadline Filter
    let matchesDeadline = true;
    if (deadlineFilter === "upcoming") {
      matchesDeadline = t.dueDate >= todayDateString && t.status !== "Completed";
    } else if (deadlineFilter === "overdue") {
      matchesDeadline = t.dueDate < todayDateString && t.status !== "Completed";
    }

    return (
      matchesSearch &&
      matchesProject &&
      matchesStatus &&
      matchesPriority &&
      matchesAssignee &&
      matchesDeadline
    );
  });

  // Sort Tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "deadline") {
      return a.dueDate.localeCompare(b.dueDate);
    }
    if (sortBy === "priority") {
      const priorityWeight = { High: 3, Medium: 2, Low: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    }
    // Default: latest created
    return b.createdAt.localeCompare(a.createdAt);
  });

  return (
    <div>
      {/* Filters row */}
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
            placeholder="Search tasks..."
            className="form-input search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-item">
          <select
            className="form-input form-select"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <select
            className="form-input form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {user.role !== "Team Member" && (
          <div className="filter-item">
            <select
              className="form-input form-select"
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
            >
              <option value="all">All Assignees</option>
              {TEAM_MEMBERS.map((m) => (
                <option key={m.email} value={m.email}>
                  {m.name.split(" ")[0]}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="filter-item">
          <select
            className="form-input form-select"
            value={deadlineFilter}
            onChange={(e) => setDeadlineFilter(e.target.value)}
          >
            <option value="all">All Deadlines</option>
            <option value="upcoming">Upcoming</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div className="filter-item">
          <select
            className="form-input form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="latest">Sort: Latest Created</option>
            <option value="deadline">Sort: Nearest Deadline</option>
            <option value="priority">Sort: Highest Priority</option>
          </select>
        </div>

        {canManageTasks && (
          <div style={{ marginLeft: "auto" }}>
            <button className="btn btn-primary" onClick={onOpenCreateTask} style={{ width: "auto" }}>
              + New Task
            </button>
          </div>
        )}
      </div>

      {/* Task table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Task Title</th>
              <th>Project</th>
              <th>Assignee</th>
              <th>Due Date</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTasks.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "var(--muted)", padding: "24px" }}>
                  No tasks found.
                </td>
              </tr>
            ) : (
              sortedTasks.map((task) => {
                const taskProject = projects.find((p) => p.id === task.projectId);
                const isOwner = task.assignedTo === user.email;
                const hasStatusTogglePermission = canChangeTaskStatus(task);

                return (
                  <tr key={task.id}>
                    <td>
                      <div style={{ fontWeight: "500" }}>{task.title}</div>
                      <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>
                        {task.description}
                      </div>
                    </td>
                    <td>{taskProject ? taskProject.name : "Unknown"}</td>
                    <td>
                      <span style={{ fontSize: "12px" }}>
                        {TEAM_MEMBERS.find((m) => m.email === task.assignedTo)?.name.split(" ")[0] ||
                          task.assignedTo}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          color:
                            task.dueDate < todayDateString && task.status !== "Completed"
                              ? "var(--danger)"
                              : "inherit"
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
                          onChange={(e) => onQuickStatusChange(task, e.target.value as any)}
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
                              onClick={() => onOpenEditTask(task)}
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
                              onClick={() => onDeleteTask(task.id)}
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
                            onClick={() => onOpenEditTask(task)}
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
    </div>
  );
}
