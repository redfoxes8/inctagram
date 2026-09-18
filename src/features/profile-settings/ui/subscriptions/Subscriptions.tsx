"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import Image from "next/image"
import clsx from "clsx"

import { Modal, RadioGroup, Checkbox, Button } from "@/shared/ui"
import { formatDate } from "@/shared/lib/utils/dateFormatters"

import {
  useCurrentSubscriptionQuery,
  useToggleAutoRenewMutation,
  usePaymentsProductsQuery,
  useCreateCheckoutSessionMutation,
  useCheckoutStatusQuery,
  subscriptionsQueryKeys,
} from "../../api/subscriptions-api"
import { PaymentProviderType } from "../../types/type"
import { GetCheckoutSessionStatusResponseDtoStatus } from "@/shared/api/schema"
import s from "./Subscriptions.module.css"
import { useMeQuery } from "@/features/auth"

const accountOptions = [
  { label: "Personal", value: "personal" },
  { label: "Business", value: "business" },
]

// PayPal пока не поддерживается бэком — прячем за флагом.
// Когда бэк включит — поменяй на true (предупреждение уже показывается в модалке).
const PAYPAL_ENABLED = false

type FeedbackState = { kind: "success"; text: string } | { kind: "error"; text: string } | null

export const Subscriptions = () => {
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")

  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false)
  const [isAgreed, setIsAgreed] = useState(false)
  const [paymentProvider, setPaymentProvider] = useState<PaymentProviderType | null>(null)
  const [feedback, setFeedback] = useState<FeedbackState>(null)

  const { data: userData } = useMeQuery()
  const { data: subData, isLoading: isLoadingSub } = useCurrentSubscriptionQuery()
  const { data: productsData, isError: isProductsError, isLoading: isLoadingProducts } = usePaymentsProductsQuery()

  const {
    mutate: toggleAutoRenew,
    isPending: isUpdatingAutoRenew,
    isError: isUpdateError,
    error: updateError,
  } = useToggleAutoRenewMutation()

  const {
    mutate: createCheckoutSession,
    isPending: isCreatingSession,
    resetIdempotencyKey,
  } = useCreateCheckoutSessionMutation()

  const { data: sessionStatus, isLoading: isCheckingPaymentStatus } = useCheckoutStatusQuery(sessionId)

  const { watch, setValue } = useForm({
    defaultValues: {
      accountType: "personal",
      subscriptionType: "",
    },
  })

  const accountType = watch("accountType")
  const subscriptionType = watch("subscriptionType")

  const currentSubscription = subData?.current ?? null
  const queuedSubscriptions = subData?.queued ?? []

  // UC-3 шаг 8: новая подписка отображается вслед за текущей.
  // Единый список: [current, ...queued], отсортированный по sequence.
  const allSubscriptions = useMemo(() => {
    const list = []
    if (currentSubscription) list.push(currentSubscription)
    const sortedQueued = [...queuedSubscriptions].sort((a, b) => a.sequence - b.sequence)
    list.push(...sortedQueued)
    return list
  }, [currentSubscription, queuedSubscriptions])

  // По ТЗ UC-3: единственный чекбокс Auto-Renewal управляет
  // самой последней подпиской (queued имеет приоритет над current).
  const lastSubscription = useMemo(() => {
    if (queuedSubscriptions.length > 0) {
      const sorted = [...queuedSubscriptions].sort((a, b) => a.sequence - b.sequence)
      return sorted[sorted.length - 1]
    }
    return currentSubscription
  }, [queuedSubscriptions, currentSubscription])
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

  /* ---------------------------------------------------------------- */
  /*  Реакция на статус checkout после возврата от провайдера          */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (!sessionStatus) return

    const clearSessionFromUrl = () => {
      const url = new URL(window.location.href)
      url.searchParams.delete("session_id")
      window.history.replaceState({}, "", url.toString())
    }

    if (sessionStatus.status === GetCheckoutSessionStatusResponseDtoStatus.COMPLETED) {
      queryClient.invalidateQueries({ queryKey: ["me"] })
      queryClient.invalidateQueries({ queryKey: subscriptionsQueryKeys.current() })
      setFeedback({
        kind: "success",
        text: "Payment was successful!",
      })
      clearSessionFromUrl()
      return
    }

    if (
      sessionStatus.status === GetCheckoutSessionStatusResponseDtoStatus.FAILED ||
      sessionStatus.status === GetCheckoutSessionStatusResponseDtoStatus.EXPIRED
    ) {
      setFeedback({
        kind: "error",
        text: "Transaction failed, please try again.",
      })
      clearSessionFromUrl()
    }
  }, [sessionStatus, queryClient])

  /* ---------------------------------------------------------------- */
  /*  Handlers                                                         */
  /* ---------------------------------------------------------------- */

  const handleAutoRenewChange = (value: boolean | "indeterminate") => {
    if (!lastSubscription || value === "indeterminate") return
    if (lastSubscription.status !== "ACTIVE" && lastSubscription.status !== "QUEUED") return

    toggleAutoRenew({
      subscriptionId: lastSubscription.id,
      enabled: value,
    })
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
    if (!paymentProvider || !subscriptionType || !isAgreed) return
    createCheckoutSession({
      productId: subscriptionType,
      provider: paymentProvider,
      autoRenewConsent: isAgreed,
    })
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

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

      {/* ---------- Subscriptions list (UC-1 / UC-2 / UC-3) ---------- */}
      {/* Единый блок: текущая + все queued подписки. */}
      {/* Если подписок нет — блок не показывается. */}
      {allSubscriptions.length > 0 && (
        <section className={s.section}>
          <h3 className={clsx(s.sectionTitle, "h3")}>Current Subscription:</h3>

          <div className={s.subscriptionList}>
            {allSubscriptions.map((item, index) => {
              const isCurrent = index === 0

              return (
                <div key={item.id} className={clsx(s.subscriptionInfo, !isCurrent && s.subscriptionInfoQueued)}>
                  {isCurrent ? (
                    <>
                      <div className={s.infoRow}>
                        <span className={clsx(s.label, "regular_text_14")}>Expire at</span>
                        <span className={clsx(s.value, "medium_text_14")}>{formatDate(item.endsAt)}</span>
                      </div>
                      <div className={s.infoRow}>
                        <span className={clsx(s.label, "regular_text_14")}>Next payment</span>
                        <span className={clsx(s.value, "medium_text_14")}>
                          {item.nextBillingAt ? formatDate(item.nextBillingAt) : "—"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={s.infoRow}>
                        <span className={clsx(s.label, "regular_text_14")}>Starts at</span>
                        <span className={clsx(s.value, "medium_text_14")}>{formatDate(item.startsAt)}</span>
                      </div>
                      <div className={s.infoRow}>
                        <span className={clsx(s.label, "regular_text_14")}>Ends at</span>
                        <span className={clsx(s.value, "medium_text_14")}>{formatDate(item.endsAt)}</span>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ---------- Auto-renew (UC-2) ---------- */}
      {lastSubscription && (
        <section className={s.section}>
          <div className={s.autoRenewRow}>
            <Checkbox
              id="auto-renewal"
              checked={autoRenewChecked}
              disabled={autoRenewDisabled}
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

      {/* ---------- Account type + purchase (UC-1 / UC-3) ---------- */}
      <section className={s.section}>
        <h3 className={clsx(s.sectionTitle, "h3")}>Account type:</h3>
        <div className={s.account_type}>
          <RadioGroup options={accountOptions} value={accountType} onChange={(val) => setValue("accountType", val)} />
        </div>

        {accountType === "business" && (
          <>
            {/* UC-1: первый раз — "Your subscription costs". */}
            {/* UC-3: если уже есть подписка — "Change your subscription". */}
            <h3 className={clsx("h3", s.subTitle)}>
              {currentSubscription ? "Change your subscription:" : "Your subscription costs:"}
            </h3>
            <div className={s.account_type}>
              {isLoadingProducts ? (
                <span className="regular_text_16">Loading subscriptions...</span>
              ) : isProductsError ? (
                <span className="regular_text_16">Failed to load subscription plans. Please refresh the page.</span>
              ) : subscriptionOptions.length === 0 ? (
                <span className="regular_text_16">
                  No subscription plans available at the moment. Please try again later.
                </span>
              ) : (
                <RadioGroup
                  options={subscriptionOptions}
                  value={subscriptionType}
                  onChange={(val) => setValue("subscriptionType", val)}
                />
              )}
            </div>

            <div className={s.payment_methods}>
              {PAYPAL_ENABLED && (
                <>
                  <button
                    type="button"
                    className={s.payment_btn}
                    onClick={() => handleOpenBuyModal("PAYPAL" as PaymentProviderType)}
                    disabled={isCreatingSession || !subscriptionType}
                  >
                    <Image src="/icons/paypal-svgrepo-com.svg" alt="PAYPAL" width={96} height={64} priority />
                  </button>
                  <span className={s.or_text}>Or</span>
                </>
              )}
              <button
                type="button"
                className={s.payment_btn}
                onClick={() => handleOpenBuyModal("STRIPE" as PaymentProviderType)}
                disabled={isCreatingSession || !subscriptionType}
              >
                <Image src="/icons/stripe-svgrepo-com.svg" alt="STRIPE" width={96} height={64} priority />
              </button>
            </div>
          </>
        )}
      </section>

      {/* ---------- Модалка подтверждения покупки (UC-1) ---------- */}
      <Modal
        isOpen={isBuyModalOpen}
        onClose={handleCloseBuyModal}
        title="Create payment"
        isCloseDisabled={isCreatingSession}
        showFooter
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
            <Button
              type="button"
              onClick={handleConfirmPurchase}
              disabled={!isAgreed || isCreatingSession}
              className={s.confirm_btn}
            >
              {isCreatingSession ? "Loading..." : "OK"}
            </Button>
          </div>
        }
      >
        {paymentProvider === "PAYPAL" && (
          <p className={clsx("regular_text_16", s.modal_text, s.modalWarning)}>
            ⚠️ To enable auto-renewal via PayPal, you need a registered PayPal account with the appropriate auto-payment
            permission. Without it, the automatic renewal of your subscription will not work.
          </p>
        )}

        <p className={clsx("regular_text_16", s.modal_text)}>
          Auto-renewal will be enabled with this payment. You can disable it anytime in your profile settings.
        </p>
      </Modal>

      {/* ---------- Модалка результата (UC-1: success / error) ---------- */}

      <Modal
        isOpen={feedback !== null}
        onClose={() => setFeedback(null)}
        title={feedback?.kind === "success" ? "Success" : "Error"}
        showFooter
        footer={
          <div className={s.feedbackFooter}>
            <Button type="button" onClick={() => setFeedback(null)} className={s.feedbackBtn}>
              {feedback?.kind === "success" ? "OK" : "Back to payment"}
            </Button>
          </div>
        }
      >
        <p className="regular_text_16">{feedback?.text}</p>
      </Modal>
    </div>
  )
}
