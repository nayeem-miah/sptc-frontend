"use client";

import React, { useState } from "react";
import { Project, Task } from "@/types";

interface ProjectTableProps {
  projects: Project[];
  tasks: Task[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  canManageProjects: boolean;
  canDeleteProjects: boolean;
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
  onDeleteProject,
  onOpenCreateProject,
  todayDateString
}: ProjectTableProps) {
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
              {canDeleteProjects && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length === 0 ? (
              <tr>
                <td
                  colSpan={canDeleteProjects ? 5 : 4}
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
                  <tr key={proj.id}>
                    <td>
                      <div style={{ fontWeight: "500" }}>{proj.name}</div>
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
                    {canDeleteProjects && (
                      <td>
                        <button
                          onClick={() => onDeleteProject(proj.id)}
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
