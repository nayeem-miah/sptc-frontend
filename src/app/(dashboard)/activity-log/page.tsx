"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Activity } from "@/utils/activityLogger";
import { useAuth } from "@/context/AuthContext";

const DEFAULT_ACTIVITIES: Activity[] = [
  { id: "act-1", time: "10:00 AM", message: 'Project "E-Commerce App" created' },
  { id: "act-2", time: "10:15 AM", message: 'Task "Setup API" assigned to John' },
  { id: "act-3", time: "10:30 AM", message: 'Task "Homepage Design" marked as Completed' }
];

export default function ActivityLogPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLogs = localStorage.getItem("sptc-activity-log");
      if (storedLogs) {
        setActivities(JSON.parse(storedLogs));
      } else {
        setActivities(DEFAULT_ACTIVITIES);
        localStorage.setItem("sptc-activity-log", JSON.stringify(DEFAULT_ACTIVITIES));
      }
    }
  }, []);

  if (!user) return null;

  const handleClearLogs = () => {
    setActivities([]);
    localStorage.setItem("sptc-activity-log", JSON.stringify([]));
  };

  return (
    <>
      <section className="welcome-section" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 className="welcome-title">Activity Log</h2>
          <p className="welcome-subtitle">
            Track recent workspace updates, task assignments, and progress indicators.
          </p>
        </div>
        {activities.length > 0 && (
          <button className="btn btn-secondary" onClick={handleClearLogs} style={{ width: "auto" }}>
            Clear Logs
          </button>
        )}
      </section>

      <div className="dashboard-panel" style={{ marginTop: "24px" }}>
        <div className="panel-header">
          <h3 className="panel-title">Recent System Events</h3>
        </div>
        
        {activities.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--muted)", padding: "40px" }}>
            No activities recorded in the system yet.
          </div>
        ) : (
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "16px" }}>
            {activities.map((act) => (
              <li 
                key={act.id} 
                style={{ 
                  display: "flex", 
                  gap: "16px", 
                  fontSize: "14px", 
                  paddingBottom: "12px", 
                  borderBottom: "1px solid var(--border)"
                }}
              >
                <span style={{ color: "var(--primary)", fontWeight: "600", minWidth: "70px" }}>
                  {act.time}
                </span>
                <span style={{ color: "var(--foreground)" }}>
                  {act.message}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
