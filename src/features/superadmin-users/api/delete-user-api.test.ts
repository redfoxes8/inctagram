import { readFileSync } from "node:fs"
import { ApolloClient, HttpLink, InMemoryCache, gql } from "@apollo/client"
import { buildSchema, validate } from "graphql"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createSuperadminTransport } from "@/shared/api/apollo/transport"
import { USERS_QUERY } from "@/features/superadmin-users/api/users-api"
import { DELETE_USER, deleteSuperadminUser } from "@/features/superadmin-users/api/delete-user-api"

// Synthetic fixtures only. No real user is provisioned or contacted.
const userId = "00000000-0000-4000-8000-00000000d003"
const endpoint = "https://mock.invalid/api/v1/graphql"
const nonce = "uc3-mock-nonce"
const clients: ApolloClient[] = []
const fetchMock = vi.fn<typeof fetch>()
const SESSION_QUERY = gql`
  query ExistingSession {
    superadminSession {
      authenticated
    }
  }
`

function response(body: unknown, session = false) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json", ...(session ? { "X-Superadmin-CSRF": nonce } : {}) },
  })
}

function client() {
  const instance = new ApolloClient({
    devtools: { enabled: false },
    defaultOptions: {
      query: { fetchPolicy: "no-cache", errorPolicy: "all" },
      watchQuery: { fetchPolicy: "no-cache", errorPolicy: "all" },
      mutate: { errorPolicy: "all" },
    },
    cache: new InMemoryCache(),
    link: new HttpLink({ uri: endpoint, fetch: createSuperadminTransport() }),
  })
  clients.push(instance)
  return instance
}

function mockDelete(outcome: string, returnedId = userId, errors?: unknown[]) {
  fetchMock.mockResolvedValueOnce(response({ data: { superadminDeleteUser: { userId: returnedId, outcome } }, errors }))
}

beforeEach(() => {
  fetchMock.mockReset()
  // The real transport is browser-only; only its browser guard is supplied here.
  vi.stubGlobal("window", {})
  vi.stubGlobal("fetch", fetchMock)
})

afterEach(() => {
  clients.splice(0).forEach((instance) => instance.stop())
  vi.unstubAllGlobals()
})

describe("superadmin user deletion via mocked HTTP responses", () => {
  it("uses documents accepted by the saved runtime SDL", () => {
    const schema = buildSchema(readFileSync("docs/graphql/superadmin/v1/runtime.graphql", "utf8"))
    expect(validate(schema, DELETE_USER)).toEqual([])
    const mutation = DELETE_USER.definitions[0]
    expect(mutation?.kind).toBe("OperationDefinition")
  })

  it.each(["DELETED", "ALREADY_DELETED", "NOT_FOUND"])("preserves the documented %s outcome", async (outcome) => {
    mockDelete(outcome)
    await expect(deleteSuperadminUser(client(), userId)).resolves.toEqual({ userId, outcome })
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [deleteUri, deleteOptions] = fetchMock.mock.calls[0] ?? []
    expect(deleteUri).toBe(endpoint)
    const deleteBody = JSON.parse(String(deleteOptions?.body))
    expect(deleteBody.operationName).toBe("SuperadminDeleteUser")
    expect(deleteBody.variables).toEqual({ input: { userId } })
    expect(deleteOptions?.credentials).toBe("include")
    expect(deleteOptions?.method).toBe("POST")
  })

  it("rejects partial success accompanied by GraphQL errors", async () => {
    mockDelete("DELETED", userId, [{ message: "Failure", extensions: { code: "INTERNAL_SERVER_ERROR" } }])
    await expect(deleteSuperadminUser(client(), userId)).rejects.toThrow()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it.each(["UNKNOWN", "", "toString"])("rejects unconfirmed outcome %s", async (outcome) => {
    mockDelete(outcome)
    await expect(deleteSuperadminUser(client(), userId)).rejects.toThrow("Deletion result not confirmed")
  })

  it("rejects a response for another user", async () => {
    mockDelete("DELETED", "00000000-0000-4000-8000-00000000d004")
    await expect(deleteSuperadminUser(client(), userId)).rejects.toThrow("Deletion result not confirmed")
  })

  it("preserves authentication and CSRF errors without bootstrap or automatic retry", async () => {
    fetchMock.mockResolvedValueOnce(
      response({ errors: [{ message: "Access denied", extensions: { code: "FORBIDDEN" } }] }),
    )
    // The mocked GraphQL envelope is an error even though HTTP status is 200.
    await expect(deleteSuperadminUser(client(), userId)).rejects.toMatchObject({
      errors: [{ extensions: { code: "FORBIDDEN" } }],
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0]?.[1]?.credentials).toBe("include")
    expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).has("X-Superadmin-CSRF")).toBe(false)
  })

  it("sends only delete and catalog refresh after clearing pre-existing requests", async () => {
    const instance = client()
    // Simulate an already authenticated transport; never contact a real endpoint.
    fetchMock.mockResolvedValueOnce(response({ data: { superadminSession: { authenticated: true } } }, true))
    await instance.query({ query: SESSION_QUERY })
    fetchMock.mockClear()
    mockDelete("DELETED")
    fetchMock.mockResolvedValueOnce(
      response({
        data: {
          superadminUsers: {
            items: [],
            totalCount: 0,
            pageInfo: { page: 1, pageSize: 8, pagesCount: 0, hasNextPage: false },
          },
        },
      }),
    )
    await deleteSuperadminUser(instance, userId)
    await instance.query({
      query: USERS_QUERY,
      variables: {
        input: {
          page: 1,
          pageSize: 8,
          searchUsername: "",
          sort: "CREATED_AT_DESC",
          banFilter: "ALL",
        },
      },
    })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls.map(([, options]) => JSON.parse(String(options?.body)).operationName)).toEqual([
      "SuperadminDeleteUser",
      "SuperadminUsersList",
    ])
    expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get("X-Superadmin-CSRF")).toBe(nonce)
  })

  it("loses the in-memory nonce in a new client and cannot restore it from a successful catalog read", async () => {
    const beforeReload = client()
    fetchMock.mockResolvedValueOnce(response({ data: { superadminSession: { authenticated: true } } }, true))
    await beforeReload.query({ query: SESSION_QUERY })

    // Model a reload: a new client/transport, without manually reading HttpOnly cookies.
    // This Node test does not emulate the browser cookie jar or prove a live session.
    const afterReload = client()
    fetchMock.mockResolvedValueOnce(
      response({
        data: {
          superadminUsers: {
            items: [],
            totalCount: 0,
            pageInfo: { page: 1, pageSize: 8, pagesCount: 0, hasNextPage: false },
          },
        },
      }),
    )
    await afterReload.query({
      query: USERS_QUERY,
      variables: {
        input: {
          page: 1,
          pageSize: 8,
          searchUsername: "",
          sort: "CREATED_AT_DESC",
          banFilter: "ALL",
        },
      },
    })
    fetchMock.mockClear()
    fetchMock.mockResolvedValueOnce(
      response({ errors: [{ message: "Access denied", extensions: { code: "FORBIDDEN" } }] }),
    )
    await expect(deleteSuperadminUser(afterReload, userId)).rejects.toMatchObject({
      errors: [{ extensions: { code: "FORBIDDEN" } }],
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0]?.[1]?.credentials).toBe("include")
    expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).has("X-Superadmin-CSRF")).toBe(false)
  })

  it("does not automatically retry an uncertain network failure", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Mock connection lost"))
    await expect(deleteSuperadminUser(client(), userId)).rejects.toThrow()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
