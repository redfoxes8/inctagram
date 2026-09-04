"use client"

import { Checkbox } from "@/shared/ui"
import s from "./AccountManagement.module.css"
import { useCurrentSubscription, useToggleAutoRenew } from "../../api/subscriptions-api"
import { formatDate } from "@/shared/lib/utils/dateFormatters"
import clsx from "clsx"
import { useMeQuery } from "@/features/auth/api/use-me"

export const AccountManagement = () => {
  const { data: userData } = useMeQuery()

  const { data, isLoading, isError } = useCurrentSubscription()

  const {
    mutate: toggleAutoRenew,
    isPending: isUpdating,
    isError: isUpdateError,
    error: updateError,
  } = useToggleAutoRenew()

  const subscription = data?.current
  const accountType = userData?.accountType?.toLowerCase()

  const handleAutoRenewChange = (value: boolean | "indeterminate") => {
    if (!subscription || value === "indeterminate") {
      return
    }
    toggleAutoRenew({
      subscriptionId: subscription.id,
      enabled: value,
    })
  }

  if (isLoading) {
    return (
      <div className={s.container}>
        <p>Loading subscription...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className={s.container}>
        <p className={s.error}>Failed to load subscription</p>
      </div>
    )
  }

  return (
    <div className={s.container}>
      <section className={s.section}>
        <h3 className={clsx(s.sectionTitle, "h3")}>Current Subscription:</h3>

        {subscription ? (
          <>
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
                checked={subscription.autoRenew}
                disabled={isUpdating}
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
          </>
        ) : (
          <p className={s.noSubscription}>You don&apos;t have an active subscription</p>
        )}
      </section>

      <section className={s.section}>
        <h3 className={clsx(s.sectionTitle, "h3")}>Account type:</h3>

        <div className={s.accountTypeOptions}>
          <label className={clsx(s.radioLabel, "regular_text_14", accountType !== "personal" && s.inactive)}>
            <input type="radio" name="accountType" value="personal" checked={accountType === "personal"} readOnly />
            Personal
          </label>

          <label className={clsx(s.radioLabel, "regular_text_14", accountType !== "business" && s.inactive)}>
            <input type="radio" name="accountType" value="business" checked={accountType === "business"} readOnly />
            Business
          </label>
        </div>
      </section>
    </div>
  )
}
