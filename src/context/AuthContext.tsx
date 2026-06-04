"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type UserRole = "Admin" | "Project Manager" | "Team Member";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  demoLogin: (role: UserRole) => void;
  logout: () => void;
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
    if (!storedUsers) {
      localStorage.setItem("sptc-registered-users", JSON.stringify(Object.values(DEMO_USERS)));
    }
    
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        demoLogin,
        logout
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
