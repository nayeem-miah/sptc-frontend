"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Secure route protection
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated || !user) {
    return (
      <div className="loader-container">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  const avatarLetter = user.name ? user.name.charAt(0).toUpperCase() : "U";

  // Check if link is active
  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="sidebar-layout">
      {/* Persistent Left Sidebar */}
      <aside className="sidebar">
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          {/* Logo Section */}
          <div className="sidebar-brand">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--primary)" }}
            >
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span>SPTC Workspace</span>
          </div>

          {/* Navigation Links */}
          <nav>
            <ul className="sidebar-menu">
              <li>
                <Link
                  href="/"
                  className={`sidebar-link ${isActive("/") ? "sidebar-link-active" : ""}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className={`sidebar-link ${isActive("/projects") ? "sidebar-link-active" : ""}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
                  <span>Projects</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/tasks"
                  className={`sidebar-link ${isActive("/tasks") ? "sidebar-link-active" : ""}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                  <span>Tasks</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Footer Area with Profile & Logout */}
        <div className="sidebar-footer">
          {/* Theme switcher control in the sidebar footer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "500" }}>Theme</span>
            <ThemeToggle />
          </div>

          <div className="sidebar-profile">
            <div className="sidebar-avatar">{avatarLetter}</div>
            <div className="sidebar-meta">
              <span className="sidebar-name">{user.name}</span>
              <span className="sidebar-role">{user.role}</span>
            </div>
          </div>

          <button onClick={logout} className="sidebar-btn-logout" title="Log out">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-content">{children}</main>
    </div>
  );
}
