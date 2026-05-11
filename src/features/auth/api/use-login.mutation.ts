import { useMutation } from "@tanstack/react-query"

import { localStorageKeys, type LoginRequestPayload, LoginResponse } from "../types/auth-api.types"

async function login(payload: LoginRequestPayload): Promise<LoginResponse> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("Login failed")
  }

  return response.json()
}

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: login,

    onSuccess: async (data) => {
      localStorage.setItem(localStorageKeys.accessToken, data.accessToken)
    },
  })
}
