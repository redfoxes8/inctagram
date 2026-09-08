import clsx from "clsx"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { Modal, RadioGroup, Checkbox, Button } from "@/shared/ui"
import s from "./AccountManagement.module.css"
import { useState, useEffect } from "react"
import { useCreateCheckoutSessionMutation, usePaymentsProductsQuery } from "../../api/subscriptions.api"
import { PaymentProviderType } from "../../types/type"

const accountOptions = [
  { label: "Personal", value: "personal" },
  { label: "Business", value: "business" },
]

export function AccountManagement() {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isAgreed, setIsAgreed] = useState<boolean>(false)

  const [paymentProvider, setPaymentProvider] = useState<PaymentProviderType | null>(null)

  const { data: productsData, isLoading: isLoadingProducts } = usePaymentsProductsQuery()

  const { mutate: createCheckoutSession, isPending: isCreatingSession } = useCreateCheckoutSessionMutation()

  const { watch, setValue } = useForm({
    defaultValues: {
      accountType: "personal",
      subscriptionType: "",
    },
  })

  const accountType = watch("accountType")
  const subscriptionType = watch("subscriptionType")

  const subscriptionOptions =
    productsData?.items?.map((item) => {
      const priceInDollars = item.amountMinor / 100
      return {
        label: `${priceInDollars}$ per ${item.billingIntervalCount} ${item.billingInterval}`,
        value: item.productId || "",
      }
    }) || []

  useEffect(() => {
    const firstOptionValue = subscriptionOptions?.[0]?.value
    if (firstOptionValue && !subscriptionType) {
      setValue("subscriptionType", firstOptionValue)
    }
  }, [subscriptionOptions, subscriptionType, setValue])

  const handleConfirm = () => {
    if (!paymentProvider || !subscriptionType) return

    createCheckoutSession({
      productId: subscriptionType,
      provider: paymentProvider,
      autoRenewConsent: isAgreed,
    })
  }

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
            {isLoadingProducts ? (
              <span className="regular_text_16">Loading subscriptions...</span>
            ) : (
              <RadioGroup
                options={subscriptionOptions}
                value={subscriptionType}
                onChange={(val) => setValue("subscriptionType", val)}
              />
            )}
          </div>

          <div className={s.payment_methods}>
            <button
              type="button"
              className={s.payment_btn}
              onClick={() => {
                setPaymentProvider("PAYPAL" as any)
                setIsOpen(true)
              }}
              disabled={isCreatingSession}
            >
              <Image src="/icons/paypal-svgrepo-com.svg" alt="PAYPAL" width={96} height={64} priority />
            </button>
            <span className={s.or_text}>Or</span>
            <button
              type="button"
              className={s.payment_btn}
              onClick={() => {
                setPaymentProvider("STRIPE" as any)
                setIsOpen(true)
              }}
              disabled={isCreatingSession}
            >
              <Image src="/icons/stripe-svgrepo-com.svg" alt="STRIPE" width={96} height={64} priority />
            </button>
          </div>

          <Modal
            isOpen={isOpen}
            onClose={() => !isCreatingSession && setIsOpen(false)}
            title="Create payment"
            showFooter={false}
            contentClassName={s.custom_modal_content}
            footer={
              <div className={s.custom_footer}>
                <Checkbox
                  id="terms-agreement"
                  label={<span className="regular_text_16">I agree</span>}
                  checked={isAgreed}
                  onCheckedChange={(val) => setIsAgreed(!!val)}
                  disabled={isCreatingSession}
                />
                <Button onClick={handleConfirm} disabled={!isAgreed || isCreatingSession} className={s.confirm_btn}>
                  {isCreatingSession ? "Loading..." : "OK"}
                </Button>
              </div>
            }
          >
            <p className={clsx("regular_text_16", s.modal_text)}>
              Auto-renewal will be enabled with this payment. You can disable it anytime in your profile settings.
            </p>
          </Modal>
        </>
      )}
    </div>
  )
}
