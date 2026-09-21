import clsx from "clsx"
import { formatDate } from "@/shared/lib/utils/dateFormatters"
import s from "../Subscriptions.module.css"
import { SchemaSubscriptionResponseDto } from "@/shared/api/schema"

type Props = { subscriptions: SchemaSubscriptionResponseDto[] }

export const SubscriptionList = ({ subscriptions }: Props) => {
  if (subscriptions.length === 0) return null

  return (
    <section className={s.section}>
      <h3 className={clsx(s.sectionTitle, "h3")}>Current Subscription:</h3>
      <div className={s.subscriptionList}>
        {subscriptions.map((item, index) => {
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
  )
}
