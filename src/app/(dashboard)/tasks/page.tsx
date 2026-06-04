"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

import TaskTable from "@/components/TaskTable";
import CreateTaskModal from "@/components/CreateTaskModal";
import { Project, Task, User } from "@/types";
import { logActivity } from "@/utils/activityLogger";
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  mapBackendTaskStatusToFrontend,
  mapFrontendTaskStatusToBackend,
  mapBackendTaskPriorityToFrontend,
  mapFrontendTaskPriorityToBackend
} from "@/redux/api/taskApi";
import { useGetProjectsQuery, mapBackendProjectStatusToFrontend } from "@/redux/api/projectApi";

export default function TasksPage() {
  const { user, users } = useAuth();
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [validationError, setValidationError] = useState("");

  const todayDateString = new Date().toISOString().split("T")[0];

  // Fetch projects and tasks from the live backend
  const { data: projectsResponse, isLoading: projectsLoading, error: projectsError } = useGetProjectsQuery(undefined);
  const { data: tasksResponse, isLoading: tasksLoading, error: tasksError } = useGetTasksQuery(undefined);

  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

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

  // Convert backend projects array to frontend format
  const backendProjects = projectsResponse?.data?.data || [];
  const projects: Project[] = backendProjects.map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description || "",
    deadline: p.deadline ? p.deadline.split("T")[0] : "",
    status: mapBackendProjectStatusToFrontend(p.status),
  }));

  // Convert backend tasks array to frontend format
  const backendTasks = tasksResponse?.data?.data || [];
  const tasks: Task[] = backendTasks.map((t: any) => {
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

  // -- CRUD Operations: Tasks --
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

  const handleSaveTask = async (taskData: {
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
        t.projectId === taskData.projectId &&
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

    // Lookup assignee ID from email
    const matchedUser = users.find((u) => u.email === taskData.assignedTo);
    const assignedMemberId = matchedUser ? matchedUser.id : "";

    try {
      if (editingTask) {
        // Edit Task API call
        await updateTask({
          taskId: editingTask.id,
          taskData: {
            title: taskData.title,
            description: taskData.description,
            dueDate: new Date(taskData.dueDate).toISOString(),
            priority: mapFrontendTaskPriorityToBackend(taskData.priority),
            status: mapFrontendTaskStatusToBackend(taskData.status),
            projectId: taskData.projectId,
            assignedMemberId: assignedMemberId
          }
        }).unwrap();

        // Log update detail
        if (editingTask.status !== taskData.status) {
          logActivity(`Task "${taskData.title}" status was marked as "${taskData.status}" by ${user.name.split(" ")[0]}.`);
        } else if (editingTask.assignedTo !== taskData.assignedTo) {
          const shortEmail = taskData.assignedTo.split("@")[0];
          logActivity(`Task "${taskData.title}" was reassigned to ${shortEmail} by ${user.name.split(" ")[0]}.`);
        } else {
          logActivity(`Task "${taskData.title}" details were updated by ${user.name.split(" ")[0]}.`);
        }
      } else {
        // Create Task API call
        await createTask({
          title: taskData.title,
          description: taskData.description,
          dueDate: new Date(taskData.dueDate).toISOString(),
          priority: mapFrontendTaskPriorityToBackend(taskData.priority),
          status: mapFrontendTaskStatusToBackend(taskData.status),
          projectId: taskData.projectId,
          assignedMemberId: assignedMemberId
        }).unwrap();

        // Log creation
        const shortEmail = taskData.assignedTo.split("@")[0];
        logActivity(`Task "${taskData.title}" was created and assigned to ${shortEmail} by ${user.name.split(" ")[0]}.`);
      }

      setIsTaskModalOpen(false);
      setValidationError("");
    } catch (err: any) {
      console.error("Save task error:", err);
      setValidationError(err.data?.message || err.message || "Failed to save task.");
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!canManageTasks) return;
    const taskToDelete = tasks.find((t) => t.id === id);
    try {
      await deleteTask(id).unwrap();
      if (taskToDelete) {
        logActivity(`Task "${taskToDelete.title}" was deleted by ${user.name.split(" ")[0]}.`);
      }
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const handleQuickStatusChange = async (task: Task, newStatus: "Todo" | "In Progress" | "Completed") => {
    if (!canChangeTaskStatus(task)) return;

    try {
      await updateTask({
        taskId: task.id,
        taskData: {
          status: mapFrontendTaskStatusToBackend(newStatus)
        }
      }).unwrap();

      logActivity(`Task "${task.title}" status was updated to "${newStatus}" by ${user.name.split(" ")[0]}.`);
    } catch (err) {
      console.error("Failed to update status quickly:", err);
    }
  };

  if (projectsLoading || tasksLoading) {
    return (
      <div className="loader-container">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  return (
    <>
      <section className="welcome-section">
        <h2 className="welcome-title">Tasks Management</h2>
        <p className="welcome-subtitle">
          Track project workloads, filter task states, and update completion status.
        </p>
      </section>

      {(projectsError || tasksError) && (
        <div className="alert alert-danger" style={{ marginBottom: "20px" }}>
          Failed to load live backend data. Please refresh the page.
        </div>
      )}

      <TaskTable
        tasks={tasks}
        projects={projects}
        user={user}
        canManageTasks={canManageTasks}
        canChangeTaskStatus={canChangeTaskStatus}
        onQuickStatusChange={handleQuickStatusChange}
        onOpenCreateTask={handleOpenCreateTask}
        onOpenEditTask={handleOpenEditTask}
        onDeleteTask={handleDeleteTask}
        todayDateString={todayDateString}
      />

      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleSaveTask}
        editingTask={editingTask}
        projects={projects}
        users={users}
        canManageTasks={canManageTasks}
        validationError={validationError}
        setValidationError={setValidationError}
      />
    </>
  );
}
