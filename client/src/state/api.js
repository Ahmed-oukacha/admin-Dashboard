import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.REACT_APP_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Ajouter le token d'authentification aux en-têtes
      const token = getState().global.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  reducerPath: "adminApi",
  tagTypes: [
    "User",
    "Projects",
    "Files",
    "Transactions",
    "Geography",
    "Admins",
    "Performance",
    "Dashboard",
    "Auth",
  ],
  endpoints: (build) => ({
    getUser: build.query({
      query: (id) => `general/user/${id}`,
      providesTags: ["User"],
    }),
    getProjects: build.query({
      query: () => "client/projects",
      providesTags: ["Projects"],
    }),
    getFiles: build.query({
      query: () => "client/files",
      providesTags: ["Files"],
    }),
    getTransactions: build.query({
      query: ({ page, pageSize, sort, search }) => ({
        url: "client/transactions",
        method: "GET",
        params: { page, pageSize, sort, search },
      }),
      providesTags: ["Transactions"],
    }),
    getGeography: build.query({
      query: () => "client/geography",
      providesTags: ["Geography"],
    }),
    getDashboard: build.query({
      query: () => "general/dashboard",
      providesTags: ["Dashboard"],
    }),
    // Endpoint d'authentification
    login: build.mutation({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const {
  useGetUserQuery,
  useGetProjectsQuery,
  useGetFilesQuery,
  useGetTransactionsQuery,
  useGetGeographyQuery,
  useGetDashboardQuery,
  useLoginMutation,
} = api;
