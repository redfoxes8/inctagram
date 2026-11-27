import { ApolloLink, Observable } from "@apollo/client"
import { GraphQLWsLink } from "@apollo/client/link/subscriptions"
import { createClient } from "graphql-ws"

// Resolve configuration and create sockets only when a browser subscribes.
// Each operation owns its socket; unsubscribe also disposes it on search/unmount.
export function createSuperadminSubscriptionLink(getEndpoint: () => string) {
  return new ApolloLink(
    (operation) =>
      new Observable((observer) => {
        if (typeof window === "undefined") {
          observer.error(new Error("Superadmin GraphQL requests are only supported in the browser"))
          return
        }
        const url = new URL(getEndpoint())
        url.protocol = url.protocol === "https:" ? "wss:" : "ws:"
        const ws = createClient({
          url: url.href,
          lazy: true,
          retryAttempts: 0,
          keepAlive: 0,
          connectionAckWaitTimeout: 15000,
          on: {
            closed: (event) => {
              const code = (event as CloseEvent).code
              observer.error(Object.assign(new Error("Posts connection closed"), { code }))
            },
          },
          // Cookie and Origin are supplied by the browser. No connectionParams/CSRF.
        })
        const subscription = new GraphQLWsLink(ws).request(operation).subscribe(observer)
        return () => {
          subscription.unsubscribe()
          void ws.dispose()
        }
      }),
  )
}
