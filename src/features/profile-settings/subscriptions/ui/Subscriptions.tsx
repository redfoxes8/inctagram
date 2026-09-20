"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import clsx from "clsx"
import { useMeQuery } from "@/features/auth"
import {
  useCurrentSubscriptionQuery,
  useToggleAutoRenewMutation,
  usePaymentsProductsQuery,
  useCheckoutStatusQuery,
} from "../api/subscriptions-api"
import { PaymentProviderType } from "../model/types"
import { useSubscriptionsView } from "../model/hooks/use-subscriptions-view"
import { useSubscriptionOptions } from "../model/hooks/use-subscription-options"
import { useCheckoutFeedback } from "../model/hooks/use-checkout-feedback"
import { useConfirmPurchase } from "../lib/use-confirm-purchase"
import { SubscriptionList } from "./components/SubscriptionList"
import { AutoRenewToggle } from "./components/AutoRenewToggle"
import { SubscriptionPlanSelector } from "./components/SubscriptionPlanSelector"
import { PaymentMethods } from "./components/PaymentMethods"
import { CreatePaymentModal } from "./components/CreatePaymentModal"
import { FeedbackModal } from "./components/FeedbackModal"
import s from "./Subscriptions.module.css"
import { AccountTypeSelector } from "./components/AccountTypeSelector"

const PAYPAL_ENABLED = false

export const Subscriptions = () => {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")

  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false)
  const [isAgreed, setIsAgreed] = useState(false)
  const [paymentProvider, setPaymentProvider] = useState<PaymentProviderType | null>(null)

  const { data: userData } = useMeQuery()
  const { data: subData, isLoading: isLoadingSub } = useCurrentSubscriptionQuery()
  const { data: productsData, isError: isProductsError, isLoading: isLoadingProducts } = usePaymentsProductsQuery()

  const {
    mutate: toggleAutoRenew,
    isPending: isUpdatingAutoRenew,
    isError: isUpdateError,
    error: updateError,
  } = useToggleAutoRenewMutation()
  const { confirmPurchase, isCreatingSession, resetIdempotencyKey } = useConfirmPurchase()
  const { data: sessionStatus, isLoading: isCheckingPaymentStatus } = useCheckoutStatusQuery(sessionId)
  const { currentSubscription, allSubscriptions, lastSubscription } = useSubscriptionsView(subData)
  const subscriptionOptions = useSubscriptionOptions(productsData)
  const { feedback, clearFeedback } = useCheckoutFeedback(sessionStatus)

  const { watch, setValue } = useForm({
    defaultValues: { accountType: "personal", subscriptionType: "" },
  })
  const accountType = watch("accountType")
  const subscriptionType = watch("subscriptionType")

  useEffect(() => {
    if (userData?.accountType) {
      setValue("accountType", userData.accountType.toLowerCase())
    }
  }, [userData, setValue])

  useEffect(() => {
    const first = subscriptionOptions[0]?.value
    if (first && !subscriptionType) setValue("subscriptionType", first)
  }, [subscriptionOptions, subscriptionType, setValue])

  const handleAutoRenewChange = (value: boolean | "indeterminate") => {
    if (!lastSubscription || value === "indeterminate") return
    if (lastSubscription.status !== "ACTIVE" && lastSubscription.status !== "QUEUED") return
    toggleAutoRenew({ subscriptionId: lastSubscription.id, enabled: value })
  }

  const handleOpenBuyModal = (provider: PaymentProviderType) => {
    setPaymentProvider(provider)
    setIsAgreed(false)
    setIsBuyModalOpen(true)
  }

  const handleCloseBuyModal = () => {
    if (isCreatingSession) return
    setIsBuyModalOpen(false)
    setIsAgreed(false)
    resetIdempotencyKey()
  }

  const handleConfirmPurchase = () => {
    confirmPurchase({ provider: paymentProvider, productId: subscriptionType, isAgreed })
  }

  if (isLoadingSub) {
    return (
      <div className={s.container}>
        <p>Loading...</p>
      </div>
    )
  }

  const autoRenewChecked = lastSubscription ? !!lastSubscription.autoRenew : false
  const autoRenewDisabled =
    isUpdatingAutoRenew ||
    !lastSubscription ||
    (lastSubscription.status !== "ACTIVE" && lastSubscription.status !== "QUEUED")

  return (
    <div className={clsx(s.container, s.account_container)}>
      {isCheckingPaymentStatus && (
        <div className={s.statusBanner}>
          <p>Checking payment status, please wait...</p>
        </div>
      )}

      <SubscriptionList subscriptions={allSubscriptions} />

      {lastSubscription && (
        <AutoRenewToggle
          checked={autoRenewChecked}
          disabled={autoRenewDisabled}
          isError={isUpdateError}
          errorMessage={updateError instanceof Error ? updateError.message : undefined}
          onChange={handleAutoRenewChange}
        />
      )}

      <AccountTypeSelector value={accountType} onChange={(val) => setValue("accountType", val)} />

      {accountType === "business" && (
        <section className={s.section}>
          <SubscriptionPlanSelector
            title={currentSubscription ? "Change your subscription:" : "Your subscription costs:"}
            options={subscriptionOptions}
            value={subscriptionType}
            isLoading={isLoadingProducts}
            isError={isProductsError}
            onChange={(val) => setValue("subscriptionType", val)}
          />

          <PaymentMethods
            paypalEnabled={PAYPAL_ENABLED}
            isCreatingSession={isCreatingSession}
            subscriptionType={subscriptionType}
            onSelect={handleOpenBuyModal}
          />
        </section>
      )}

      <CreatePaymentModal
        isOpen={isBuyModalOpen}
        isAgreed={isAgreed}
        isCreatingSession={isCreatingSession}
        provider={paymentProvider}
        onClose={handleCloseBuyModal}
        onAgreeChange={setIsAgreed}
        onConfirm={handleConfirmPurchase}
      />

      <FeedbackModal feedback={feedback} onClose={clearFeedback} />
    </div>
  )
}
