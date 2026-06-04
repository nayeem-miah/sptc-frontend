"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

import ProjectTable from "@/components/ProjectTable";
import CreateProjectModal from "@/components/CreateProjectModal";
import { Project, Task } from "@/types";
import { logActivity } from "@/utils/activityLogger";
import {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  mapBackendProjectStatusToFrontend,
  mapFrontendProjectStatusToBackend,
} from "@/redux/api/projectApi";

const DEFAULT_TASKS: Task[] = [
  { id: "task-1", title: "Setup API Gateway", description: "Proxy requests to serverless backends", projectId: "proj-1", assignedTo: "member@sptc.com", dueDate: "2026-06-15", priority: "High", status: "In Progress", createdAt: "2026-06-01T10:00:00.000Z" }
];

export default function ProjectsPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectSearchQuery, setProjectSearchQuery] = useState("");
  const [validationError, setValidationError] = useState("");
  
  // Custom Notification states
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Custom Delete Modal states
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);

  const todayDateString = new Date().toISOString().split("T")[0];

  // Fetch projects from RTK Query live backend API
  const { data: projectsResponse, isLoading: projectsLoading, error: projectsError } = useGetProjectsQuery(undefined);
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTasks = localStorage.getItem("sptc-tasks");
      setTasks(storedTasks ? JSON.parse(storedTasks) : DEFAULT_TASKS);
    }
  }, []);

  if (!user) return null;

  // Permissions
  const canManageProjects = user.role === "Admin" || user.role === "Project Manager";
  const canDeleteProjects = user.role === "Admin";

  // Map backend response array to local frontend Project interface format
  const backendProjectsList = projectsResponse?.data?.data || [];
  const projects: Project[] = backendProjectsList.map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description || "",
    deadline: p.deadline ? p.deadline.split("T")[0] : "",
    status: mapBackendProjectStatusToFrontend(p.status),
  }));

  const handleSaveProject = async (projectData: {
    name: string;
    description: string;
    deadline: string;
    status: "Active" | "Completed" | "On Hold";
  }) => {
    try {
      const backendStatus = mapFrontendProjectStatusToBackend(projectData.status);
      const isoDeadline = new Date(projectData.deadline).toISOString();

      if (editingProject) {
        // Update Project
        const response = await updateProject({
          projectId: editingProject.id,
          projectData: {
            name: projectData.name,
            description: projectData.description,
            deadline: isoDeadline,
            status: backendStatus
          }
        }).unwrap();

        if (response.success) {
          logActivity(`Project "${projectData.name}" details were updated by ${user.name.split(" ")[0]}.`);
          setValidationError("");
          setIsProjectModalOpen(false);
          setSuccessMessage(`Successfully updated project "${projectData.name}"`);
          setTimeout(() => setSuccessMessage(""), 4000);
        } else {
          setValidationError(response.message || "Failed to update project.");
        }
      } else {
        // Create Project
        const response = await createProject({
          name: projectData.name,
          description: projectData.description,
          deadline: isoDeadline,
          status: backendStatus,
          memberIds: [],
        }).unwrap();

        if (response.success) {
          logActivity(`Project "${projectData.name}" was created by ${user.name.split(" ")[0]}.`);
          setValidationError("");
          setIsProjectModalOpen(false);
          setSuccessMessage(`Successfully created project "${projectData.name}"`);
          setTimeout(() => setSuccessMessage(""), 4000);
        } else {
          setValidationError(response.message || "Failed to create project.");
        }
      }
    } catch (err: any) {
      console.error("Save project error:", err);
      setValidationError(err.data?.message || err.message || "An unexpected error occurred.");
    }
  };

  const handleDeleteProject = (id: string) => {
    if (!canDeleteProjects) return;
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    setProjectToDelete({ id, name: project.name });
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteAction = async () => {
    if (!projectToDelete) return;
    try {
      const response = await deleteProject(projectToDelete.id).unwrap();
      setIsConfirmModalOpen(false);
      if (response.success) {
        logActivity(`Project "${projectToDelete.name}" was deleted by ${user.name.split(" ")[0]}.`);
        setSuccessMessage(`Successfully deleted project "${projectToDelete.name}"`);
        setTimeout(() => setSuccessMessage(""), 4000);
        
        // Clear any local mock tasks for the deleted project from localStorage if they exist
        const updatedTasks = tasks.filter((t) => t.projectId !== projectToDelete.id);
        setTasks(updatedTasks);
        localStorage.setItem("sptc-tasks", JSON.stringify(updatedTasks));
      } else {
        setErrorMessage(response.message || "Failed to delete project.");
        setTimeout(() => setErrorMessage(""), 4000);
      }
    } catch (err: any) {
      console.error("Delete project error:", err);
      setErrorMessage(err.data?.message || err.message || "Failed to delete project.");
      setTimeout(() => setErrorMessage(""), 4000);
      setIsConfirmModalOpen(false);
    }
    setProjectToDelete(null);
  };

  if (projectsLoading) {
    return (
      <div className="loader-container">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  return (
    <>
      <section className="welcome-section">
        <h2 className="welcome-title">Projects Directory</h2>
        <p className="welcome-subtitle">
          Manage system projects, delivery deadlines, and tracking scopes.
        </p>
      </section>

      {projectsError && (
        <div className="alert alert-danger" style={{ marginBottom: "20px" }}>
          Failed to load projects from live backend. Please refresh the page.
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="alert alert-success" style={{ marginBottom: "20px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span style={{ fontSize: "13px", fontWeight: "500" }}>{successMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="alert alert-danger" style={{ marginBottom: "20px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          <span style={{ fontSize: "13px", fontWeight: "500" }}>{errorMessage}</span>
        </div>
      )}

      <ProjectTable
        projects={projects}
        tasks={tasks}
        searchQuery={projectSearchQuery}
        setSearchQuery={setProjectSearchQuery}
        canManageProjects={canManageProjects}
        canDeleteProjects={canDeleteProjects}
        onEditProject={(project) => {
          setEditingProject(project);
          setValidationError("");
          setIsProjectModalOpen(true);
        }}
        onDeleteProject={handleDeleteProject}
        onOpenCreateProject={() => {
          setEditingProject(null);
          setValidationError("");
          setIsProjectModalOpen(true);
        }}
        todayDateString={todayDateString}
      />

      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
          setValidationError("");
        }}
        onSubmit={handleSaveProject}
        editingProject={editingProject}
        validationError={validationError}
        setValidationError={setValidationError}
      />

      {/* Custom Delete Confirmation Modal */}
      {isConfirmModalOpen && projectToDelete && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "400px" }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: "var(--danger)" }}>Confirm Delete Project</h3>
              <button
                className="modal-close-btn"
                onClick={() => { setIsConfirmModalOpen(false); setProjectToDelete(null); }}
                disabled={isDeleting}
              >
                ✕
              </button>
            </div>
            
            <div style={{ margin: "16px 0", fontSize: "14px", color: "var(--foreground)" }}>
              <p>Are you sure you want to permanently delete project <strong>{projectToDelete.name}</strong>?</p>
              <p style={{ marginTop: "8px", fontSize: "12px", color: "var(--muted)" }}>Deleting this project will automatically remove all associated tasks. This action cannot be undone.</p>
            </div>

            <div className="modal-footer" style={{ gap: "10px" }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: "auto" }}
                onClick={() => { setIsConfirmModalOpen(false); setProjectToDelete(null); }}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: "auto", backgroundColor: "var(--danger)", borderColor: "var(--danger)", color: "#ffffff" }}
                onClick={confirmDeleteAction}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
