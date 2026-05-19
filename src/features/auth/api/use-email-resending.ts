import { client } from "@/shared/api/client"
import { useMutation } from "@tanstack/react-query"
import { RegistrationEmailResendingPayload } from "./auth.type"

export const useEmailResendMutation = () => {
  return useMutation({
    mutationFn: async (email: RegistrationEmailResendingPayload) => {
      const clientData = await client.POST("/api/v1/auth/registration-email-resending", {
        body: email,
      })

      if (clientData.error) {
        throw new Error("Resend Error")
      }

      return clientData.data
    },
  })
}
