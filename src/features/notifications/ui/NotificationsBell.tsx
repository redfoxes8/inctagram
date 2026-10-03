"use client"

import { useState } from "react"
import * as Popover from "@radix-ui/react-popover"
import { Icon } from "@/shared/ui/Icon"
import { useUnseenCountQuery } from "../api/notifications-api"
import { NotificationsDropdown } from "./NotificationsDropdown"
import s from "./NotificationsBell.module.css"

export const NotificationsBell = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { data } = useUnseenCountQuery()
  const count = data?.unseenCount ?? 0

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <button type="button" className={s.trigger} aria-label="Notifications">
          <Icon name="outline-bell" width={24} height={24} />
          {count > 0 && <span className={s.badge}>{count > 99 ? "99+" : count}</span>}
        </button>
      </Popover.Trigger>

      {isOpen && <NotificationsDropdown onClose={() => setIsOpen(false)} />}
    </Popover.Root>
  )
}
