"use client";

import React from "react";
import { Task, TEAM_MEMBERS } from "@/types";

interface WorkloadSummaryProps {
  tasks: Task[];
}

export default function WorkloadSummary({ tasks }: WorkloadSummaryProps) {
  const getMemberWorkload = (email: string) => {
    const memberTasks = tasks.filter((t) => t.assignedTo === email);
    return {
      total: memberTasks.length,
      completed: memberTasks.filter((t) => t.status === "Completed").length,
      pending: memberTasks.filter((t) => t.status !== "Completed").length
    };
  };

  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <h3 className="panel-title">Team Workload Summary</h3>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {TEAM_MEMBERS.map((member) => {
          const workload = getMemberWorkload(member.email);
          return (
            <div key={member.email} className="workload-item">
              <div>
                <div style={{ fontWeight: "500", fontSize: "13px" }}>{member.name.split(" ")[0]}</div>
                <div style={{ fontSize: "11px", color: "var(--muted)" }}>{member.email}</div>
              </div>
              <div className="workload-details">
                <span>Total: <strong>{workload.total}</strong></span>
                <span>Pending: <strong style={{ color: workload.pending > 0 ? "var(--warning)" : "inherit" }}>{workload.pending}</strong></span>
                <span>Completed: <strong style={{ color: "var(--success)" }}>{workload.completed}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
