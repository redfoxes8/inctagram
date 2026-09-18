import { useRef } from "react"
import { useCreateCheckoutSessionMutation } from "../api/subscriptions-api"
import { PaymentProviderType } from "../model/types"

type Args = {
  provider: PaymentProviderType | null
  productId: string
  isAgreed: boolean
}

export const useConfirmPurchase = () => {
  const { mutate: createCheckoutSession, isPending, resetIdempotencyKey } = useCreateCheckoutSessionMutation()

  const isSubmittingRef = useRef(false)

  const confirmPurchase = ({ provider, productId, isAgreed }: Args) => {
    if (isSubmittingRef.current) return
    if (!provider || !productId || !isAgreed) return

    isSubmittingRef.current = true
    createCheckoutSession(
      { productId, provider, autoRenewConsent: isAgreed },
      {
        onSettled: () => {
          isSubmittingRef.current = false
        },
      },
    )
  }

  return { confirmPurchase, isCreatingSession: isPending, resetIdempotencyKey }
}
