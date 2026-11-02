import { getOperationAST, Kind, OperationTypeNode, parse } from "graphql"

const CSRF_HEADER = "X-Superadmin-CSRF"

// Owned by one Apollo client; never persist this value or read HttpOnly cookies.
export function createSuperadminTransport(): typeof fetch {
  let csrfNonce: string | undefined

  return async (uri, options) => {
    if (typeof window === "undefined") {
      throw new Error("Superadmin GraphQL requests are only supported in the browser")
    }
    if (typeof options?.body !== "string") {
      throw new Error("Superadmin GraphQL requires a single JSON request body")
    }

    const payload = JSON.parse(options.body)
    if (Array.isArray(payload) || typeof payload?.query !== "string") {
      throw new Error("Superadmin GraphQL requires a single GraphQL operation")
    }
    const operation = getOperationAST(parse(payload.query), payload.operationName)
    if (!operation || operation.operation === OperationTypeNode.SUBSCRIPTION) {
      throw new Error("Choose one HTTP GraphQL query or mutation")
    }

    const first = operation.selectionSet.selections[0]
    const loginOnly =
      operation.operation === OperationTypeNode.MUTATION &&
      operation.selectionSet.selections.length === 1 &&
      first?.kind === Kind.FIELD &&
      first.name.value === "superadminLogin"

    const headers = new Headers(options.headers)
    headers.set("Content-Type", "application/json")
    headers.delete(CSRF_HEADER)
    if (operation.operation === OperationTypeNode.MUTATION && !loginOnly && csrfNonce) {
      headers.set(CSRF_HEADER, csrfNonce)
    }

    const response = await fetch(uri, {
      ...options,
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers,
    })
    const nonce = response.headers.get(CSRF_HEADER)
    if (nonce) csrfNonce = nonce

    // Preserve the response, including partial data and GraphQL errors.
    return response
  }
}
