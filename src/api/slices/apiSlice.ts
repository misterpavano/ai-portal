import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { fetchAuthSession } from "@aws-amplify/auth";
import { getBaseUrl } from "../../utils/baseUrl";

const baseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  prepareHeaders: async (headers) => {
    const { tokens } = await fetchAuthSession();
    const idToken = tokens?.idToken?.toString();

    if (idToken) {
      headers.set("Authorization", `Bearer ${idToken}`);
    }

    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: [
    "Auth",
    "Models",
    "Tools",
    "OpenAI",
    "Folders",
    "Conversations",
    "Messages",
    "Content",
  ],
  refetchOnFocus: false,
  refetchOnReconnect: true,
  endpoints: () => ({}),
});