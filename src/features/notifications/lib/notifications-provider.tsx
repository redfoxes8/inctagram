"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { InfiniteData, useQueryClient } from "@tanstack/react-query"
import { localStorageKeys } from "@/features/auth/types"
import { NotificationSocket } from "./notification-socket"
import { notificationsQueryKeys } from "../api/notifications-api"
import type { GetNotificationsResponse } from "../model/types"

type NotificationsInfiniteData = InfiniteData<GetNotificationsResponse>

type Props = { children: ReactNode }

export const NotificationsProvider = ({ children }: Props) => {
  const queryClient = useQueryClient()

  const [accessToken, setAccessToken] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem(localStorageKeys.accessToken) : null,
  )

  const socketRef = useRef<NotificationSocket | null>(null)

  useEffect(() => {
    const handler = () => setAccessToken(localStorage.getItem(localStorageKeys.accessToken))

    window.addEventListener("storage", handler)
    window.addEventListener("auth-changed", handler)
    return () => {
      window.removeEventListener("storage", handler)
      window.removeEventListener("auth-changed", handler)
    }
  }, [])

  useEffect(() => {
    const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL
    if (!gatewayUrl || !accessToken) {
      socketRef.current?.disconnect()
      socketRef.current = null
      return
    }

    const socket = new NotificationSocket(gatewayUrl, {
      onNotification: ({ notification, unseenCount }) => {
        queryClient.setQueryData(notificationsQueryKeys.unseenCount(), {
          unseenCount,
        })
        queryClient.setQueryData<NotificationsInfiniteData>(notificationsQueryKeys.history(), (old) => {
          if (!old?.pages?.length) return old
          const firstPage = old.pages[0]
          if (!firstPage) return old
          const alreadyExists = firstPage.items.some((n) => n.id === notification.id)
          if (alreadyExists) return old
          return {
            ...old,
            pages: [{ ...firstPage, items: [notification, ...firstPage.items] }, ...old.pages.slice(1)],
          }
        })
      },
      onUnseenCount: ({ unseenCount }) => {
        queryClient.setQueryData(notificationsQueryKeys.unseenCount(), {
          unseenCount,
        })
      },
      onResyncRequired: () => {
        queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.history() })
        queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.unseenCount() })
      },
      onUnauthorized: () => {
        socketRef.current?.disconnect()
        socketRef.current = null
      },
    })

    socketRef.current = socket
    socket.connect(accessToken)

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [accessToken, queryClient])

  return <>{children}</>
}
