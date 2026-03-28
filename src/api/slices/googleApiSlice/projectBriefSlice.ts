import { googleApiSlice } from "./googleApiSlice";

export const projectBriefSlice = googleApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDataFromSheet: builder.query<Record<string, string>, string>({
      query: (params) => ({
        url: params,
      }),
    }),
  }),
});
