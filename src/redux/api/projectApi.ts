"use client";

import { baseApi } from "./baseApi";

export const projectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query({
      query: () => "/projects",
      providesTags: (result: any) =>
        result?.data?.data
          ? [
              ...result.data.data.map(({ id }: any) => ({ type: "Project" as const, id })),
              { type: "Project" as const, id: "LIST" },
            ]
          : [{ type: "Project" as const, id: "LIST" }],
    }),
    createProject: builder.mutation({
      query: (projectData) => ({
        url: "/projects",
        method: "POST",
        body: projectData,
      }),
      invalidatesTags: [{ type: "Project", id: "LIST" }],
    }),
    updateProject: builder.mutation({
      query: ({ projectId, projectData }) => ({
        url: `/projects/${projectId}`,
        method: "PATCH",
        body: projectData,
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: "Project", id: projectId },
        { type: "Project", id: "LIST" },
      ],
    }),
    deleteProject: builder.mutation({
      query: (projectId) => ({
        url: `/projects/${projectId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, projectId) => [
        { type: "Project", id: projectId },
        { type: "Project", id: "LIST" },
        "Task",
      ],
    }),
    getProjectById: builder.query({
      query: (projectId) => `/projects/${projectId}`,
      providesTags: (result: any, error: any, projectId: string) => [
        { type: "Project" as const, id: projectId },
      ],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectByIdQuery,
} = projectApi;

export const mapBackendProjectStatusToFrontend = (status: string): "Active" | "Completed" | "On Hold" => {
  if (status === "ACTIVE") return "Active";
  if (status === "COMPLETED") return "Completed";
  return "On Hold";
};

export const mapFrontendProjectStatusToBackend = (status: string): string => {
  if (status === "Active") return "ACTIVE";
  if (status === "Completed") return "COMPLETED";
  return "ON_HOLD";
};
