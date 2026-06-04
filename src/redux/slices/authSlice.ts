"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UserRole = "Admin" | "Project Manager" | "Team Member";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  token: string | null;
}

// Helper to map backend uppercase roles to frontend Title Case roles
export const mapBackendRoleToFrontend = (role: string): UserRole => {
  if (role === "ADMIN") return "Admin";
  if (role === "PROJECT_MANAGER") return "Project Manager";
  return "Team Member";
};

// Helper to map frontend Title Case roles to backend uppercase roles
export const mapFrontendRoleToBackend = (role: UserRole): string => {
  if (role === "Admin") return "ADMIN";
  if (role === "Project Manager") return "PROJECT_MANAGER";
  return "TEAM_MEMBER";
};

// Initial state, trying to load from localStorage if in browser environment
const getInitialState = (): AuthState => {
  if (typeof window === "undefined") {
    return { user: null, token: null };
  }
  try {
    const savedUser = localStorage.getItem("sptc-user");
    const savedToken = localStorage.getItem("sptc-token");
    return {
      user: savedUser ? JSON.parse(savedUser) : null,
      token: savedToken || null,
    };
  } catch (e) {
    return { user: null, token: null };
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      if (typeof window !== "undefined") {
        localStorage.setItem("sptc-user", JSON.stringify(user));
        localStorage.setItem("sptc-token", token);
      }
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("sptc-user");
        localStorage.removeItem("sptc-token");
      }
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
