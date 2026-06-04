export type UserRole = "Admin" | "Project Manager" | "Team Member";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  deadline: string;
  status: "Active" | "Completed" | "On Hold";
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assignedTo: string; // email of the team member
  dueDate: string;
  priority: "High" | "Medium" | "Low";
  status: "Todo" | "In Progress" | "Completed";
  createdAt: string;
}

export interface TeamMember {
  name: string;
  email: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  { name: "Alex Carter (Admin)", email: "admin@sptc.com" },
  { name: "Sarah Miller (PM)", email: "manager@sptc.com" },
  { name: "John Doe (Developer)", email: "member@sptc.com" }
];
