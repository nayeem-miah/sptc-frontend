"use client";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_API = process.env.NEXT_PUBLIC_BASE_API || "https://sptc-system-backend.vercel.app/api/v1";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_API,
    prepareHeaders: (headers, { getState }) => {
      // Get the token from state or local storage
      const state = getState() as any;
      const token = state.auth?.token || (typeof window !== "undefined" ? localStorage.getItem("sptc-token") : null);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["User", "Project", "Task", "Activity"],
  endpoints: () => ({}),
});
