import { baseApi } from "@/shared/api/baseApi"
import { RegisterUserPayload, RegistrationResponse } from "./auth.type"

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    registration: builder.mutation<RegistrationResponse, RegisterUserPayload>({
      query: (body) => ({
        method: "POST",
        url: "/auth/registration",
        body,
      }),
    }),
    checkUsername: builder.query<{ available: boolean }, string>({
      query: (username) => ({
        url: `/users/check-username`,
        params: { username },
      }),
    }),
  }),
  overrideExisting: true,
})

export const { useRegistrationMutation, useLazyCheckUsernameQuery } = authApi
