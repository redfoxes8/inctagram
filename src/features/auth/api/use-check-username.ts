import { useMutation } from "@tanstack/react-query"

export const useCheckUsernameLazy = () => {
  return useMutation({
    mutationFn: async (username: string) => {
      const params = new URLSearchParams({ username })
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/users/check-username?${params}`)
      return response.json() as Promise<{ available: boolean }>
    },
  })
}
