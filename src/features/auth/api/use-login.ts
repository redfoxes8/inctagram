import { useMutation } from "@tanstack/react-query"

export const useRegister = () => {
  return useMutation({
    mutationFn: async (credentials) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/registration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Ошибка регистрации")
      }

      return response.json()
    },
    onSuccess: (data) => {
      console.log("Успех: ", data)
    },
    onError: (error) => {
      console.error("Ошибка: ", error)
    },
  })
}
