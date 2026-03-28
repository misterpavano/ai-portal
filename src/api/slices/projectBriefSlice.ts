import { apiSlice } from "./apiSlice";

export const projectBriefSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getDataFromSheet: builder.query<Record<string, string>, string>({
            query: (params) => ({
                url: params
            }),
        })
    })
})