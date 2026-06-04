"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logActivity } from "@/utils/activityLogger";

export type UserRole = "Admin" | "Project Manager" | "Team Member";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  demoLogin: (role: UserRole) => void;
  logout: () => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<UserRole, User & { passwordHash: string }> = {
  Admin: {
    id: "demo-admin-id",
    name: "Alex Carter (Admin)",
    email: "admin@sptc.com",
    role: "Admin",
    passwordHash: "admin123"
  },
  "Project Manager": {
    id: "demo-pm-id",
    name: "Sarah Miller (PM)",
    email: "manager@sptc.com",
    role: "Project Manager",
    passwordHash: "manager123"
  },
  "Team Member": {
    id: "demo-member-id",
    name: "John Doe (Developer)",
    email: "member@sptc.com",
    role: "Team Member",
    passwordHash: "member123"
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load user session from localStorage
    const savedUser = localStorage.getItem("sptc-user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("sptc-user");
      }
    }
    
    // Load registered users if not exists (seed default accounts)
    const storedUsers = localStorage.getItem("sptc-registered-users");
    let usersList = [];
    if (!storedUsers) {
      const seeded = Object.values(DEMO_USERS);
      localStorage.setItem("sptc-registered-users", JSON.stringify(seeded));
      usersList = seeded;
    } else {
      try {
        usersList = JSON.parse(storedUsers);
      } catch (e) {
        usersList = Object.values(DEMO_USERS);
        localStorage.setItem("sptc-registered-users", JSON.stringify(usersList));
      }
    }

    // Set users list in state (excluding sensitive fields like passwordHash if present)
    setUsers(usersList.map(({ passwordHash, ...u }: any) => u));
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Read from stored users in localStorage
    const storedUsersJson = localStorage.getItem("sptc-registered-users");
    let usersList = storedUsersJson ? JSON.parse(storedUsersJson) : Object.values(DEMO_USERS);
    
    const matchedUser = usersList.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    
    if (!matchedUser) {
      return { success: false, error: "Invalid email or password." };
    }
    
    // For demo purposes, we match against seeded passwordHash, or default to "password" if they registered.
    const expectedPassword = matchedUser.passwordHash || "password123";
    if (password !== expectedPassword) {
      return { success: false, error: "Invalid email or password." };
    }
    
    // Exclude passwordHash from state
    const { passwordHash, ...userSession } = matchedUser;
    setUser(userSession);
    localStorage.setItem("sptc-user", JSON.stringify(userSession));
    router.push("/");
    return { success: true };
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<{ success: boolean; error?: string }> => {
    const storedUsersJson = localStorage.getItem("sptc-registered-users");
    let usersList = storedUsersJson ? JSON.parse(storedUsersJson) : Object.values(DEMO_USERS);
    
    const exists = usersList.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { success: false, error: "Email already registered." };
    }
    
    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      passwordHash: password // Mock hashing by saving plain password
    };
    
    usersList.push(newUser);
    localStorage.setItem("sptc-registered-users", JSON.stringify(usersList));
    
    // Sync state
    setUsers(usersList.map(({ passwordHash, ...u }: any) => u));
    
    // Automatically log in
    const { passwordHash, ...userSession } = newUser;
    setUser(userSession);
    localStorage.setItem("sptc-user", JSON.stringify(userSession));
    router.push("/");
    return { success: true };
  };

  const demoLogin = (role: UserRole) => {
    const demoUser = DEMO_USERS[role];
    if (demoUser) {
      const { passwordHash, ...userSession } = demoUser;
      setUser(userSession);
      localStorage.setItem("sptc-user", JSON.stringify(userSession));
      router.push("/");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sptc-user");
    router.push("/login");
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    const storedUsersJson = localStorage.getItem("sptc-registered-users");
    let usersList = storedUsersJson ? JSON.parse(storedUsersJson) : Object.values(DEMO_USERS);
    
    const targetUserIdx = usersList.findIndex((u: any) => u.id === userId);
    if (targetUserIdx === -1) return;
    
    const oldRole = usersList[targetUserIdx].role;
    usersList[targetUserIdx].role = newRole;
    
    localStorage.setItem("sptc-registered-users", JSON.stringify(usersList));
    setUsers(usersList.map(({ passwordHash, ...u }: any) => u));
    
    // If the updated user is the currently logged in user, update the state and session
    if (user && user.id === userId) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      localStorage.setItem("sptc-user", JSON.stringify(updatedUser));
    }
    
    // Log the role change
    logActivity(`Admin changed role of ${usersList[targetUserIdx].name} (${usersList[targetUserIdx].email}) from ${oldRole} to ${newRole}`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        demoLogin,
        logout,
        updateUserRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
