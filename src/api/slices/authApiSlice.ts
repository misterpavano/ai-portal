import {
  TUpdateUserProfileRequest,
  TUpdateUserRoleRequest,
  TUpdateUserStatusRequest,
} from "../../types/request/auth";
import {
  TGetAuthStatusResponse,
  TGetUserProfileResponse,
  TLogoutResponse,
  TGetAllUsersResponse,
  TUpdateUserProfileResponse,
  TUpdateUserStatusResponse,
  TUpdateUserRoleResponse,
} from "../../types/response/auth";
import { apiSlice } from "./apiSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAuthStatus: builder.query<TGetAuthStatusResponse, void>({
      query: () => ({ url: "/auth/status" }),
    }),

    getUserProfile: builder.query<TGetUserProfileResponse, void>({
      query: () => ({ url: "/api/users/me" }),
      providesTags: ["Auth"],
    }),

    logout: builder.mutation<TLogoutResponse, void>({
      query: () => ({ url: "/auth/microsoft/logout", method: "POST" }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Clear JWT token from localStorage
          localStorage.removeItem('mkg_auth_token');
          // Clear interview summary assistant data from localStorage
          localStorage.removeItem('assistantIdMeetingSummary');
          localStorage.removeItem('vectorStoreIdMeetingSummary');
          localStorage.removeItem('assistantModelMeetingSummary');
        } catch (error) {
          // Clear token even if API call fails
          localStorage.removeItem('mkg_auth_token');
          // Clear interview summary assistant data from localStorage
          localStorage.removeItem('assistantIdMeetingSummary');
          localStorage.removeItem('vectorStoreIdMeetingSummary');
          localStorage.removeItem('assistantModelMeetingSummary');
        }
      },
    }),

    getAllUsers: builder.query<TGetAllUsersResponse, void>({
      query: () => ({ url: "/api/users" }),
      providesTags: ["Auth"],
    }),

    updateUserProfile: builder.mutation<
      TUpdateUserProfileResponse,
      TUpdateUserProfileRequest
    >({
      query: (data) => ({
        url: `/api/users/${data.userId}/profile`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),

    updateUserStatus: builder.mutation<
      TUpdateUserStatusResponse,
      TUpdateUserStatusRequest
    >({
      query: (data) => ({
        url: `/api/users/${data.userId}/status`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),

    updateUserRole: builder.mutation<
      TUpdateUserRoleResponse,
      TUpdateUserRoleRequest
    >({
      query: (data) => ({
        url: `/api/users/${data.userId}/role`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const {
  useGetAuthStatusQuery,
  useGetUserProfileQuery,
  useLogoutMutation,
  useGetAllUsersQuery,
  useUpdateUserProfileMutation,
  useUpdateUserStatusMutation,
  useUpdateUserRoleMutation,
} = authApi;
