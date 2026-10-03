"use client"

import { useEffect, useMemo, useRef } from "react"
import * as Popover from "@radix-ui/react-popover"
import { useMarkSeenMutation, useNotificationsHistoryQuery } from "../api/notifications-api"
import { NotificationItem } from "./NotificationItem"
import s from "./NotificationsDropdown.module.css"
import clsx from "clsx"

type Props = { onClose: () => void }

export const NotificationsDropdown = ({ onClose }: Props) => {
  const { data, fetchNextPage, hasNextPage, isLoading, isError, isFetchingNextPage } = useNotificationsHistoryQuery()

  const { mutate: markSeen } = useMarkSeenMutation()
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const items = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data])

  useEffect(() => {
    markSeen()
  }, [markSeen])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { root: null, rootMargin: "80px" },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <Popover.Portal>
      <Popover.Content
        className={s.content}
        side="bottom"
        align="end"
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={onClose}
      >
        <div className={s.header}>
          <h3 className={clsx(s.title, "h3")}>Notifications</h3>
        </div>

        <div className={s.list}>
          {isLoading && items.length === 0 && <p className={clsx(s.state, "regular_text_14")}>Loading...</p>}

          {isError && <p className={clsx(s.state, "regular_text_14")}>Failed to load notifications.</p>}

          {!isLoading && !isError && items.length === 0 && (
            <p className={clsx(s.state, "regular_text_14")}>No notifications</p>
          )}

          {items.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}

          {isFetchingNextPage && <p className={clsx(s.state, "regular_text_14")}>Loading more...</p>}
          <div ref={sentinelRef} />
        </div>

        <Popover.Arrow className={s.arrow} />
      </Popover.Content>
    </Popover.Portal>
  )
}
