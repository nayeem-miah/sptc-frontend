"use client";

import { baseApi } from "./baseApi";

export const taskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query({
      query: (params) => ({
        url: "/tasks",
        method: "GET",
        params,
      }),
      providesTags: (result: any) =>
        result?.data?.data
          ? [
              ...result.data.data.map(({ id }: any) => ({ type: "Task" as const, id })),
              { type: "Task" as const, id: "LIST" },
            ]
          : [{ type: "Task" as const, id: "LIST" }],
    }),
    createTask: builder.mutation({
      query: (taskData) => ({
        url: "/tasks",
        method: "POST",
        body: taskData,
      }),
      invalidatesTags: [{ type: "Task", id: "LIST" }],
    }),
    updateTask: builder.mutation({
      query: ({ taskId, taskData }) => ({
        url: `/tasks/${taskId}`,
        method: "PATCH",
        body: taskData,
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Task", id: taskId },
        { type: "Task", id: "LIST" },
      ],
    }),
    deleteTask: builder.mutation({
      query: (taskId) => ({
        url: `/tasks/${taskId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, taskId) => [
        { type: "Task", id: taskId },
        { type: "Task", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = taskApi;

// Converters for Task Status
export const mapBackendTaskStatusToFrontend = (status: string): "Todo" | "In Progress" | "Completed" => {
  const normalized = status?.toUpperCase();
  if (normalized === "TODO") return "Todo";
  if (normalized === "IN_PROGRESS" || normalized === "PROGRESS") return "In Progress";
  return "Completed";
};

export const mapFrontendTaskStatusToBackend = (status: string): string => {
  if (status === "Todo") return "TODO";
  if (status === "In Progress") return "IN_PROGRESS";
  return "COMPLETED";
};

// Converters for Task Priority
export const mapBackendTaskPriorityToFrontend = (priority: string): "High" | "Medium" | "Low" => {
  const normalized = priority?.toUpperCase();
  if (normalized === "HIGH") return "High";
  if (normalized === "MEDIUM") return "Medium";
  return "Low";
};

export const mapFrontendTaskPriorityToBackend = (priority: string): string => {
  if (priority === "High") return "HIGH";
  if (priority === "Medium") return "MEDIUM";
  return "LOW";
};
