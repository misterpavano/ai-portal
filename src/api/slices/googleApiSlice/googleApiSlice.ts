import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "https://script.google.com/macros/s",
});

export const googleApiSlice = createApi({
  reducerPath: "googleApi",
  baseQuery: baseQuery,
  tagTypes: Object.values([]),
  endpoints: () => ({}),
});
