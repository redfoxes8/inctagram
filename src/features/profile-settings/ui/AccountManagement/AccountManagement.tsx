import clsx from "clsx"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { RadioGroup } from "@/shared/ui"
import s from "./AccountManagement.module.css"

const accountOptions = [
  { label: "Personal", value: "personal" },
  { label: "Business", value: "business" },
]

const subscriptionOptions = [
  { label: "10$ per 1 Day", value: "10" },
  { label: "50$ per 7 day", value: "50" },
  { label: "100$ per month", value: "100" },
]

export function AccountManagement() {
  const { watch, setValue } = useForm({
    defaultValues: {
      accountType: "personal",
      subscriptionType: "10",
    },
  })

  const accountType = watch("accountType")
  const subscriptionType = watch("subscriptionType")

  return (
    <div className={s.account_container}>
      <h3 className={clsx("h3")}>Account Type:</h3>
      <div className={s.account_type}>
        <RadioGroup options={accountOptions} value={accountType} onChange={(val) => setValue("accountType", val)} />
      </div>

      {accountType === "business" && (
        <>
          <h3 className={clsx("h3")}>Your subscription costs:</h3>
          <div className={s.account_type}>
            <RadioGroup
              options={subscriptionOptions}
              value={subscriptionType}
              onChange={(val) => setValue("subscriptionType", val)}
            />
          </div>

          <div className={s.payment_methods}>
            <button type="button" className={s.payment_btn}>
              <Image src="/icons/paypal-svgrepo-com.svg" alt="PayPal" width={96} height={64} priority />
            </button>
            <span className={s.or_text}>Or</span>
            <button type="button" className={s.payment_btn}>
              <Image src="/icons/stripe-svgrepo-com.svg" alt="Stripe" width={96} height={64} priority />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
