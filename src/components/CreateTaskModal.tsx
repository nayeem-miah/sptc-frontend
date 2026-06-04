"use client";

import React, { useEffect, useState } from "react";
import { Project, Task, TEAM_MEMBERS } from "@/types";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    projectId: string;
    assignedTo: string;
    dueDate: string;
    priority: "High" | "Medium" | "Low";
    status: "Todo" | "In Progress" | "Completed";
  }) => void;
  editingTask: Task | null;
  projects: Project[];
  canManageTasks: boolean;
  validationError: string;
  setValidationError: (err: string) => void;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  onSubmit,
  editingTask,
  projects,
  canManageTasks,
  validationError,
  setValidationError
}: CreateTaskModalProps) {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskProjId, setTaskProjId] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskPriority, setTaskPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [taskStatus, setTaskStatus] = useState<"Todo" | "In Progress" | "Completed">("Todo");

  useEffect(() => {
    if (isOpen) {
      if (editingTask) {
        setTaskTitle(editingTask.title);
        setTaskDesc(editingTask.description);
        setTaskProjId(editingTask.projectId);
        setTaskAssignee(editingTask.assignedTo);
        setTaskDueDate(editingTask.dueDate);
        setTaskPriority(editingTask.priority);
        setTaskStatus(editingTask.status);
      } else {
        setTaskTitle("");
        setTaskDesc("");
        setTaskProjId(projects[0]?.id || "");
        setTaskAssignee(TEAM_MEMBERS[0]?.email || "");
        setTaskDueDate("");
        setTaskPriority("Medium");
        setTaskStatus("Todo");
      }
    }
  }, [editingTask, isOpen, projects]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskTitle.trim() || !taskProjId || !taskDueDate || !taskAssignee) {
      setValidationError("Please fill out all required fields.");
      return;
    }

    onSubmit({
      title: taskTitle,
      description: taskDesc,
      projectId: taskProjId,
      assignedTo: taskAssignee,
      dueDate: taskDueDate,
      priority: taskPriority,
      status: taskStatus
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">
            {editingTask
              ? canManageTasks
                ? "Edit Task"
                : "Edit Task Status Only"
              : "Create New Task"}
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {validationError && <div className="alert alert-danger">{validationError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="task-title">
              Task Title *
            </label>
            <input
              type="text"
              id="task-title"
              className="form-input"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              disabled={!canManageTasks}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-desc">
              Description
            </label>
            <textarea
              id="task-desc"
              className="form-input"
              rows={2}
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              disabled={!canManageTasks}
              style={{ resize: "none" }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-proj">
              Project *
            </label>
            <select
              id="task-proj"
              className="form-input form-select"
              value={taskProjId}
              onChange={(e) => setTaskProjId(e.target.value)}
              disabled={!canManageTasks}
              required
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-assignee">
              Assignee *
            </label>
            <select
              id="task-assignee"
              className="form-input form-select"
              value={taskAssignee}
              onChange={(e) => setTaskAssignee(e.target.value)}
              disabled={!canManageTasks}
              required
            >
              {TEAM_MEMBERS.map((m) => (
                <option key={m.email} value={m.email}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-due">
              Due Date *
            </label>
            <input
              type="date"
              id="task-due"
              className="form-input"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              disabled={!canManageTasks}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-priority">
              Priority
            </label>
            <select
              id="task-priority"
              className="form-input form-select"
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value as any)}
              disabled={!canManageTasks}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-status">
              Status
            </label>
            <select
              id="task-status"
              className="form-input form-select"
              value={taskStatus}
              onChange={(e) => setTaskStatus(e.target.value as any)}
            >
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: "auto" }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ width: "auto" }}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
