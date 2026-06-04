"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  setCredentials,
  clearCredentials,
  User,
  UserRole,
  mapBackendRoleToFrontend,
  mapFrontendRoleToBackend
} from "@/redux/slices/authSlice";
import {
  useLoginMutation,
  useRegisterMutation,
  useGetAllUsersQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation
} from "@/redux/api/authApi";

const BASE_API = process.env.NEXT_PUBLIC_BASE_API || "https://sptc-system-backend.vercel.app/api/v1";

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
  deleteUser: (userId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const router = useRouter();
  
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);

  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();
  const [updateUserRoleMutation] = useUpdateUserRoleMutation();
  const [deleteUserMutation] = useDeleteUserMutation();

  // RTK Query hook retrieves user list and automatically invalidates/refetches
  const { data: usersResponse } = useGetAllUsersQuery(undefined, {
    skip: !token || user?.role !== "Admin",
  });

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await loginMutation({ email, password }).unwrap();
      const { accessToken } = response.data.result;
      
      // Fetch user profile
      const meResponse = await fetch(`${BASE_API}/users/me`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      });
      
      const meData = await meResponse.json();
      if (!meResponse.ok || !meData.success) {
        return { success: false, error: "Failed to retrieve user profile." };
      }
      
      const profile = meData.data;
      const loggedUser: User = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: mapBackendRoleToFrontend(profile.role)
      };
      
      dispatch(setCredentials({ user: loggedUser, token: accessToken }));
      router.push("/");
      return { success: true };
    } catch (err: any) {
      console.error("Login error:", err);
      return { success: false, error: err.data?.message || err.message || "Invalid email or password." };
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<{ success: boolean; error?: string }> => {
    try {
      const backendRole = mapFrontendRoleToBackend(role);
      const response = await registerMutation({
        name,
        email,
        password,
        role: backendRole
      }).unwrap();
      
      if (response.success) {
        return { success: true };
      }
      return { success: false, error: response.message || "Registration failed." };
    } catch (err: any) {
      console.error("Registration error:", err);
      return { success: false, error: err.data?.message || err.message || "Registration failed." };
    }
  };

  const demoLogin = async (role: UserRole) => {
    let email = "member@gmail.com";
    if (role === "Admin") email = "admin@gmail.com";
    else if (role === "Project Manager") email = "pm@gmail.com";
    
    await login(email, "123456");
  };

  const logout = () => {
    dispatch(clearCredentials());
    router.push("/login");
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const backendRole = mapFrontendRoleToBackend(newRole);
      await updateUserRoleMutation({ userId, role: backendRole }).unwrap();
      
      // If the updated user is the currently logged in user, update the store credentials
      if (user && user.id === userId) {
        const updatedUser = { ...user, role: newRole };
        dispatch(setCredentials({ user: updatedUser, token: token! }));
      }
    } catch (err) {
      console.error("Failed to update user role:", err);
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      const response = await deleteUserMutation(userId).unwrap();
      return !!response?.success;
    } catch (err) {
      console.error("Failed to delete user:", err);
      return false;
    }
  };

  // Map users list from the backend structure to frontend structure
  const backendUsers = usersResponse?.data?.data || [];
  const mappedUsers: User[] = backendUsers.map((u: any) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: mapBackendRoleToFrontend(u.role)
  }));

  return (
    <AuthContext.Provider
      value={{
        user,
        users: mappedUsers,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        demoLogin,
        logout,
        updateUserRole,
        deleteUser
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
export type { UserRole };
