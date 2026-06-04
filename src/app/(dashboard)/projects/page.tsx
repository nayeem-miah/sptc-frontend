"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

import ProjectTable from "@/components/ProjectTable";
import CreateProjectModal from "@/components/CreateProjectModal";
import { Project, Task } from "@/types";

const DEFAULT_PROJECTS: Project[] = [
  { id: "proj-1", name: "Website Redesign", description: "Revamp corporate landing page", deadline: "2026-06-25", status: "Active" },
  { id: "proj-2", name: "Mobile App Development", description: "Build iOS/Android task companion", deadline: "2026-06-30", status: "Active" },
  { id: "proj-3", name: "Admin Portal Panel", description: "Metrics dashboard layout integration", deadline: "2026-06-08", status: "On Hold" }
];

const DEFAULT_TASKS: Task[] = [
  { id: "task-1", title: "Setup API Gateway", description: "Proxy requests to serverless backends", projectId: "proj-1", assignedTo: "member@sptc.com", dueDate: "2026-06-15", priority: "High", status: "In Progress", createdAt: "2026-06-01T10:00:00.000Z" }
];

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectSearchQuery, setProjectSearchQuery] = useState("");
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
  const canManageProjects = user.role === "Admin" || user.role === "Project Manager";
  const canDeleteProjects = user.role === "Admin";

  const handleCreateProject = (projectData: {
    name: string;
    description: string;
    deadline: string;
    status: "Active" | "Completed" | "On Hold";
  }) => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      ...projectData
    };

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    localStorage.setItem("sptc-projects", JSON.stringify(updatedProjects));

    setValidationError("");
    setIsProjectModalOpen(false);
  };

  const handleDeleteProject = (id: string) => {
    if (!canDeleteProjects) return;
    const updatedProjects = projects.filter((p) => p.id !== id);
    const updatedTasks = tasks.filter((t) => t.projectId !== id); // clean tasks

    setProjects(updatedProjects);
    setTasks(updatedTasks);
    localStorage.setItem("sptc-projects", JSON.stringify(updatedProjects));
    localStorage.setItem("sptc-tasks", JSON.stringify(updatedTasks));
  };

  return (
    <>
      <section className="welcome-section">
        <h2 className="welcome-title">Projects Directory</h2>
        <p className="welcome-subtitle">
          Manage system projects, delivery deadlines, and tracking scopes.
        </p>
      </section>

      <ProjectTable
        projects={projects}
        tasks={tasks}
        searchQuery={projectSearchQuery}
        setSearchQuery={setProjectSearchQuery}
        canManageProjects={canManageProjects}
        canDeleteProjects={canDeleteProjects}
        onDeleteProject={handleDeleteProject}
        onOpenCreateProject={() => setIsProjectModalOpen(true)}
        todayDateString={todayDateString}
      />

      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSubmit={handleCreateProject}
        validationError={validationError}
        setValidationError={setValidationError}
      />
    </>
  );
}
