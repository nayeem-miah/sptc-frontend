"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Project, Task } from "@/types";

interface ProjectTableProps {
  projects: Project[];
  tasks: Task[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  canManageProjects: boolean;
  canDeleteProjects: boolean;
  onEditProject?: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onOpenCreateProject: () => void;
  todayDateString: string;
}

export default function ProjectTable({
  projects,
  tasks,
  searchQuery,
  setSearchQuery,
  canManageProjects,
  canDeleteProjects,
  onEditProject,
  onDeleteProject,
  onOpenCreateProject,
  todayDateString
}: ProjectTableProps) {
  const router = useRouter();
  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="filters-row" style={{ justifyContent: "space-between" }}>
        <div className="search-input-wrapper" style={{ maxWidth: "360px" }}>
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
            placeholder="Search projects..."
            className="form-input search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {canManageProjects && (
          <button className="btn btn-primary" onClick={onOpenCreateProject} style={{ width: "auto" }}>
            + New Project
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Project Details</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>Team Tasks</th>
              {(canDeleteProjects || canManageProjects) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length === 0 ? (
              <tr>
                <td
                  colSpan={canDeleteProjects || canManageProjects ? 5 : 4}
                  style={{ textAlign: "center", color: "var(--muted)", padding: "24px" }}
                >
                  No projects found.
                </td>
              </tr>
            ) : (
              filteredProjects.map((proj) => {
                const projTasks = tasks.filter((t) => t.projectId === proj.id);
                const completedCount = projTasks.filter((t) => t.status === "Completed").length;

                return (
                  <tr
                    key={proj.id}
                    className="clickable-row"
                    onClick={() => router.push(`/projects/${proj.id}`)}
                  >
                    <td>
                      <span
                        style={{
                          fontWeight: "500",
                          color: "var(--foreground)",
                        }}
                      >
                        {proj.name}
                      </span>
                      <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>
                        {proj.description}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          color:
                            proj.deadline < todayDateString && proj.status !== "Completed"
                              ? "var(--danger)"
                              : "inherit"
                        }}
                      >
                        {proj.deadline}
                      </span>
                    </td>
                    <td>
                      <span className={`tag tag-status-${proj.status.toLowerCase().replace(" ", "-")}`}>
                        {proj.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: "500" }}>
                        {projTasks.length === 0
                          ? "0 tasks"
                          : `${completedCount}/${projTasks.length} Completed`}
                      </span>
                    </td>
                    {(canDeleteProjects || canManageProjects) && (
                      <td>
                        <div className="action-btn-group">
                          {canManageProjects && onEditProject && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditProject(proj);
                              }}
                              className="action-btn"
                              title="Edit Project"
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
                          )}
                          {canDeleteProjects && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteProject(proj.id);
                              }}
                              className="action-btn action-btn-danger"
                              title="Delete Project"
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
                          )}
                        </div>
                      </td>
                    )}
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
