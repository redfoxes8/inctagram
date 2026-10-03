import { io, Socket } from "socket.io-client"
import type { NotificationCreatedWebSocketPayload, NotificationsUnseenCountWebSocketPayload } from "../model/types"

type Handlers = {
  onNotification: (payload: NotificationCreatedWebSocketPayload) => void
  onUnseenCount: (payload: NotificationsUnseenCountWebSocketPayload) => void
  onResyncRequired: () => void
  onUnauthorized: () => void
}

export class NotificationSocket {
  private socket: Socket | null = null

  constructor(
    private readonly gatewayUrl: string,
    private readonly handlers: Handlers,
  ) {}

  connect(accessToken: string) {
    this.disconnect()

    this.socket = io(`${this.gatewayUrl}/notifications`, {
      path: "/socket.io",
      transports: ["websocket"],
      auth: { accessToken },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })

    this.socket.on("connect", () => {
      this.handlers.onResyncRequired()
    })

    this.socket.on("connect_error", (error) => {
      if (error.message === "Unauthorized") {
        this.handlers.onUnauthorized()
      }
    })

    this.socket.on("notification.created", (payload: NotificationCreatedWebSocketPayload) => {
      this.handlers.onNotification(payload)
    })

    this.socket.on("notifications.unseen-count", (payload: NotificationsUnseenCountWebSocketPayload) => {
      this.handlers.onUnseenCount(payload)
    })
  }

  updateToken(newAccessToken: string) {
    if (!this.socket) return
    this.socket.auth = { accessToken: newAccessToken }
    if (!this.socket.connected) this.socket.connect()
  }

  disconnect() {
    if (!this.socket) return
    this.socket.removeAllListeners()
    this.socket.disconnect()
    this.socket = null
  }
}
