import { HttpLink } from "@apollo/client"
import { ApolloClient, InMemoryCache } from "@apollo/client-integration-nextjs"
import { createSuperadminTransport } from "@/shared/api/apollo/transport"

function getEndpoint() {
  const endpoint = process.env.NEXT_PUBLIC_SUPERADMIN_GRAPHQL_URL?.trim()
  if (!endpoint) {
    throw new Error("Set NEXT_PUBLIC_SUPERADMIN_GRAPHQL_URL to the confirmed Gateway endpoint")
  }

  const url = new URL(endpoint)
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.pathname !== "/api/v1/graphql" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error("NEXT_PUBLIC_SUPERADMIN_GRAPHQL_URL must be an HTTP(S) Gateway /api/v1/graphql URL")
  }
  return endpoint
}

// ApolloNextAppProvider retains one browser client and creates isolated SSR clients.
// The transport rejects SSR requests; no server cookies or shared auth state are used.
export function makeApolloClient() {
  const transportFetch = createSuperadminTransport()

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      // Resolve lazily: mounting the provider does not require an endpoint or send requests.
      uri: getEndpoint,
      credentials: "include",
      useGETForQueries: false,
      fetchOptions: { method: "POST", cache: "no-store" },
      fetch: transportFetch,
    }),
    defaultOptions: {
      query: { fetchPolicy: "no-cache", errorPolicy: "all" },
      watchQuery: { fetchPolicy: "no-cache", errorPolicy: "all" },
      mutate: { errorPolicy: "all" },
    },
  })
}
