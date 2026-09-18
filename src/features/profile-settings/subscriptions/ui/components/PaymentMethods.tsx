import Image from "next/image"
import { PaymentProviderType } from "../../model/types"
import s from "../Subscriptions.module.css"

type Props = {
  isCreatingSession: boolean
  subscriptionType: string
  paypalEnabled?: boolean
  onSelect: (provider: PaymentProviderType) => void
}

export const PaymentMethods = ({ isCreatingSession, subscriptionType, paypalEnabled = false, onSelect }: Props) => {
  const disabled = isCreatingSession || !subscriptionType
  return (
    <div className={s.payment_methods}>
      {paypalEnabled && (
        <>
          <button
            type="button"
            className={s.payment_btn}
            onClick={() => onSelect("PAYPAL" as PaymentProviderType)}
            disabled={disabled}
          >
            <Image src="/icons/paypal-svgrepo-com.svg" alt="PAYPAL" width={96} height={64} priority />
          </button>
          <span className={s.or_text}>Or</span>
        </>
      )}
      <button
        type="button"
        className={s.payment_btn}
        onClick={() => onSelect("STRIPE" as PaymentProviderType)}
        disabled={disabled}
      >
        <Image src="/icons/stripe-svgrepo-com.svg" alt="STRIPE" width={96} height={64} priority />
      </button>
    </div>
  )
}
