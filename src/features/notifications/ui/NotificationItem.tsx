"use client"

import clsx from "clsx"
import { formatDistanceToNow } from "date-fns"
import { enUS } from "date-fns/locale"
import { formatDate } from "@/shared/lib/utils/dateFormatters"
import type { NotificationItem as NotificationItemType } from "../model/types"
import s from "./NotificationItem.module.css"

type Props = {
  notification: NotificationItemType
}

const formatMessage = (n: NotificationItemType): string => {
  switch (n.type) {
    case "SUBSCRIPTION_ACTIVATED":
      return `Your subscription is active until ${formatDate(n.subscriptionEndsAt ?? "")}`
    case "SUBSCRIPTION_EXTENDED":
      return `Your subscription has been extended until ${formatDate(n.subscriptionEndsAt ?? "")}`
    case "UPCOMING_PAYMENT":
      return "Your next payment will be charged in 1 day"
    case "SUBSCRIPTION_EXPIRING": {
      const days = n.reasonCode === "EXPIRES_IN_7_DAYS" ? 7 : 1
      return `Your subscription expires in ${days} ${days === 1 ? "day" : "days"}`
    }
    case "PAYMENT_FAILED":
      return "Payment failed. Please check your payment method."
    case "PAYMENT_RECOVERED":
      return "Payment recovered. Your subscription is active."
    case "SUBSCRIPTION_CANCELLED":
      return "Subscription cancelled."
    default:
      return "New notification"
  }
}

export const NotificationItem = ({ notification }: Props) => {
  const isUnread = notification.seenAt === null

  return (
    <div className={clsx(s.item, isUnread && s.unread)}>
      <div className={s.dot} aria-hidden />

      <div className={s.body}>
        <p className={clsx(s.text, "regular_text_14")}>{formatMessage(notification)}</p>
        <time className={s.date} dateTime={notification.createdAt}>
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
            locale: enUS,
          })}
        </time>
      </div>
    </div>
  )
}
