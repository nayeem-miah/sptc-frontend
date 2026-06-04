"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

import TaskTable from "@/components/TaskTable";
import CreateTaskModal from "@/components/CreateTaskModal";
import { Project, Task } from "@/types";
import { logActivity } from "@/utils/activityLogger";

const DEFAULT_PROJECTS: Project[] = [
  { id: "proj-1", name: "Website Redesign", description: "Revamp corporate landing page", deadline: "2026-06-25", status: "Active" },
  { id: "proj-2", name: "Mobile App Development", description: "Build iOS/Android task companion", deadline: "2026-06-30", status: "Active" }
];

const DEFAULT_TASKS: Task[] = [
  { id: "task-1", title: "Setup API Gateway", description: "Proxy requests to serverless backends", projectId: "proj-1", assignedTo: "member@sptc.com", dueDate: "2026-06-15", priority: "High", status: "In Progress", createdAt: "2026-06-01T10:00:00.000Z" },
  { id: "task-2", title: "Homepage Layout Figma", description: "Design low fidelity wireframes", projectId: "proj-1", assignedTo: "member@sptc.com", dueDate: "2026-06-18", priority: "Medium", status: "Completed", createdAt: "2026-06-01T10:15:00.000Z" }
];

export default function TasksPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [validationError, setValidationError] = useState("");

  const todayDateString = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedProjects = localStorage.getItem("sptc-projects");
      setProjects(storedProjects ? JSON.parse(storedProjects) : DEFAULT_PROJECTS);

      const storedTasks = localStorage.getItem("sptc-tasks");
      setTasks(storedTasks ? JSON.parse(storedTasks) : DEFAULT_TASKS);
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

    if (editingTask) {
      // Edit
      const updatedTasks = tasks.map((t) => {
        if (t.id === editingTask.id) {
          return {
            ...t,
            ...taskData
          };
        }
        return t;
      });
      setTasks(updatedTasks);
      localStorage.setItem("sptc-tasks", JSON.stringify(updatedTasks));

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
      // Create
      const newTask: Task = {
        id: `task-${Date.now()}`,
        ...taskData,
        createdAt: new Date().toISOString()
      };
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      localStorage.setItem("sptc-tasks", JSON.stringify(updatedTasks));

      // Log creation
      const shortEmail = taskData.assignedTo.split("@")[0];
      logActivity(`Task "${taskData.title}" was created and assigned to ${shortEmail} by ${user.name.split(" ")[0]}.`);
    }

    setIsTaskModalOpen(false);
    setValidationError("");
  };

  const handleDeleteTask = (id: string) => {
    if (!canManageTasks) return;
    const taskToDelete = tasks.find((t) => t.id === id);
    const updatedTasks = tasks.filter((t) => t.id !== id);
    setTasks(updatedTasks);
    localStorage.setItem("sptc-tasks", JSON.stringify(updatedTasks));

    if (taskToDelete) {
      logActivity(`Task "${taskToDelete.title}" was deleted by ${user.name.split(" ")[0]}.`);
    }
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

  return (
    <>
      <section className="welcome-section">
        <h2 className="welcome-title">Tasks Management</h2>
        <p className="welcome-subtitle">
          Track project workloads, filter task states, and update completion status.
        </p>
      </section>

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
        canManageTasks={canManageTasks}
        validationError={validationError}
        setValidationError={setValidationError}
      />
    </>
  );
}
