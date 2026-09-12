"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import Image from "next/image"
import clsx from "clsx"

import { Modal, RadioGroup, Checkbox, Button } from "@/shared/ui"
import { formatDate } from "@/shared/lib/utils/dateFormatters"
import { useMeQuery } from "@/features/auth/api/use-me"

import {
  useCurrentSubscriptionQuery,
  useToggleAutoRenewMutation,
  usePaymentsProductsQuery,
  useCreateCheckoutSessionMutation,
  useCheckoutStatusQuery,
  subscriptionsQueryKeys,
} from "../../api/subscriptions-api"
import { PaymentProviderType } from "../../types/type"

import s from "./Subscriptions.module.css"
import { GetCheckoutSessionStatusResponseDtoStatus } from "@/shared/api/schema"

const accountOptions = [
  { label: "Personal", value: "personal" },
  { label: "Business", value: "business" },
]

export const Subscriptions = () => {
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")

  const [isBuyModalOpen, setIsBuyModalOpen] = useState<boolean>(false)
  const [isAgreed, setIsAgreed] = useState<boolean>(false)
  const [paymentProvider, setPaymentProvider] = useState<PaymentProviderType | null>(null)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false)

  const { data: userData } = useMeQuery()
  const { data: subData, isLoading: isLoadingSub } = useCurrentSubscriptionQuery()
  const { data: productsData, isLoading: isLoadingProducts } = usePaymentsProductsQuery()

  const {
    mutate: toggleAutoRenew,
    isPending: isUpdatingAutoRenew,
    isError: isUpdateError,
    error: updateError,
  } = useToggleAutoRenewMutation()
  const { mutate: createCheckoutSession, isPending: isCreatingSession } = useCreateCheckoutSessionMutation()

  const { data: sessionStatus, isLoading: isCheckingPaymentStatus } = useCheckoutStatusQuery(sessionId)

  const { watch, setValue } = useForm({
    defaultValues: {
      accountType: "personal",
      subscriptionType: "",
    },
  })

  const accountType = watch("accountType")
  const subscriptionType = watch("subscriptionType")

  const subscription = subData?.current
  const currentAccountType = userData?.accountType?.toLowerCase() || "personal"

  useEffect(() => {
    if (userData?.accountType) {
      setValue("accountType", currentAccountType)
    }
  }, [userData, currentAccountType, setValue])

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

  useEffect(() => {
    if (sessionStatus?.status === GetCheckoutSessionStatusResponseDtoStatus.COMPLETED) {
      setIsSuccessModalOpen(true)

      queryClient.invalidateQueries({ queryKey: ["me"] })
      queryClient.invalidateQueries({ queryKey: subscriptionsQueryKeys.current() })

      const url = new URL(window.location.href)
      url.searchParams.delete("session_id")
      window.history.replaceState({}, "", url.toString())
    }
  }, [sessionStatus, queryClient])

  const handleAutoRenewChange = (value: boolean | "indeterminate") => {
    if (!subscription || value === "indeterminate") return

    toggleAutoRenew({
      subscriptionId: subscription.id,
      enabled: value,
    })
  }

  const handleConfirmPurchase = () => {
    if (!paymentProvider || !subscriptionType) return

    createCheckoutSession({
      productId: subscriptionType,
      provider: paymentProvider,
      autoRenewConsent: isAgreed,
    })
  }

  if (isLoadingSub) {
    return (
      <div className={s.container}>
        <p>Loading...</p>
      </div>
    )
  }
  const isAutoRenewChecked = subscription ? (subscription.autoRenew ?? true) : false

  return (
    <div className={clsx(s.container, s.account_container)}>
      {isCheckingPaymentStatus && (
        <div className={s.statusBanner}>
          <p>Checking payment status, please wait...</p>
        </div>
      )}

      {subscription && (
        <section className={s.section}>
          <h3 className={clsx(s.sectionTitle, "h3")}>Current Subscription:</h3>
          <div className={s.subscriptionInfo}>
            <div className={s.infoRow}>
              <span className={clsx(s.label, "regular_text_14")}>Expire at</span>
              <span className={clsx(s.value, "medium_text_14")}>{formatDate(subscription.endsAt)}</span>
            </div>
            <div className={s.infoRow}>
              <span className={clsx(s.label, "regular_text_14")}>Next payment</span>
              <span className={clsx(s.value, "medium_text_14")}>
                {subscription.nextBillingAt ? formatDate(subscription.nextBillingAt) : "—"}
              </span>
            </div>
          </div>

          <div className={s.autoRenewRow}>
            <Checkbox
              id="auto-renewal"
              checked={!!subscription?.autoRenew}
              disabled={isUpdatingAutoRenew}
              onCheckedChange={handleAutoRenewChange}
            />
            <label htmlFor="auto-renewal" className={clsx(s.autoRenewLabel, "regular_text_14")}>
              Auto-Renewal
            </label>
          </div>

          {isUpdateError && (
            <p className={s.error}>
              {updateError instanceof Error ? updateError.message : "Failed to update auto-renewal"}
            </p>
          )}
        </section>
      )}

      <section className={s.section}>
        <h3 className={clsx(s.sectionTitle, "h3")}>Account type:</h3>
        <div className={s.account_type}>
          <RadioGroup options={accountOptions} value={accountType} onChange={(val) => setValue("accountType", val)} />
        </div>

        {accountType === "business" && (
          <>
            <h3 className={clsx("h3", s.subTitle)}>Your subscription costs:</h3>
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
                  setPaymentProvider("PAYPAL" as PaymentProviderType)
                  setIsBuyModalOpen(true)
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
                  setPaymentProvider("STRIPE" as PaymentProviderType)
                  setIsBuyModalOpen(true)
                }}
                disabled={isCreatingSession}
              >
                <Image src="/icons/stripe-svgrepo-com.svg" alt="STRIPE" width={96} height={64} priority />
              </button>
            </div>
          </>
        )}
      </section>

      <Modal
        isOpen={isBuyModalOpen}
        onClose={() => !isCreatingSession && setIsBuyModalOpen(false)}
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
            <Button onClick={handleConfirmPurchase} disabled={!isAgreed || isCreatingSession} className={s.confirm_btn}>
              {isCreatingSession ? "Loading..." : "OK"}
            </Button>
          </div>
        }
      >
        <p className={clsx("regular_text_16", s.modal_text)}>
          Auto-renewal will be enabled with this payment. You can disable it anytime in your profile settings.
        </p>
      </Modal>

      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Payment Successful"
        showFooter={true}
        onConfirm={() => setIsSuccessModalOpen(false)}
      >
        <p className="regular_text_16">
          Thank you! Your transaction was successful, and your Business subscription is now active.
        </p>
      </Modal>
    </div>
  )
}
