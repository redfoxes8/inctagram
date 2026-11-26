import { readFileSync } from "node:fs"
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client"
import { buildSchema, validate } from "graphql"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createSuperadminTransport } from "@/shared/api/apollo/transport"
import { getPaymentsErrorMessage, PAYMENTS_QUERY } from "@/features/superadmin-payments/api/payments-api"
import {
  formatListAmount,
  formatListSubscription,
  nextPaymentsSort,
  type PaymentsInput,
  type PaymentListItem,
  type PaymentsSort,
} from "@/features/superadmin-payments/model/types"

const fetchMock = vi.fn<typeof fetch>()
const clients: ApolloClient[] = []
function client() {
  const instance = new ApolloClient({
    devtools: { enabled: false },
    cache: new InMemoryCache(),
    link: new HttpLink({ uri: "https://mock.invalid/api/v1/graphql", fetch: createSuperadminTransport() }),
    defaultOptions: {
      query: { fetchPolicy: "no-cache", errorPolicy: "all" },
      watchQuery: { fetchPolicy: "no-cache", errorPolicy: "all" },
      mutate: { errorPolicy: "all" },
    },
  })
  clients.push(instance)
  return instance
}
const sorts: PaymentsSort[] = [
  "USERNAME_ASC",
  "USERNAME_DESC",
  "CREATED_AT_ASC",
  "CREATED_AT_DESC",
  "AMOUNT_ASC",
  "AMOUNT_DESC",
  "PAYMENT_METHOD_ASC",
  "PAYMENT_METHOD_DESC",
]
beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal("window", {})
  vi.stubGlobal("fetch", fetchMock)
})
afterEach(() => {
  clients.splice(0).forEach((item) => item.stop())
  vi.unstubAllGlobals()
})

describe("general payments query through mocked HTTP (no real Gateway)", () => {
  it("matches the saved runtime schema and its sort/input contract", () => {
    const schema = buildSchema(readFileSync("docs/graphql/superadmin/v1/runtime.graphql", "utf8"))
    expect(validate(schema, PAYMENTS_QUERY)).toEqual([])
    expect(String(schema.getQueryType()?.getFields().superadminPayments?.args[0]?.type)).toBe(
      "SuperadminPaymentsInput!",
    )
    const input = schema.getType("SuperadminPaymentsInput")
    if (!input || !("getFields" in input)) throw new Error("Missing input")
    expect(Object.keys(input.getFields())).toEqual(["page", "searchUsername", "sort"])
    const sort = schema.getType("SuperadminPaymentsSort")
    if (!sort || !("getValues" in sort)) throw new Error("Missing sort")
    expect(
      sort
        .getValues()
        .map((value) => value.name)
        .sort(),
    ).toEqual([...sorts].sort())
  })
  it.each(sorts)("sends server sort %s, page and search without an unsupported pageSize", async (sort) => {
    const input: PaymentsInput = { page: 2, searchUsername: "mock", sort }
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: {
            superadminPayments: {
              items: [],
              totalCount: 0,
              pageInfo: { page: 2, pageSize: 6, pagesCount: 0, hasNextPage: false },
            },
          },
        }),
        { headers: { "Content-Type": "application/json" } },
      ),
    )
    const result = await client().query({ query: PAYMENTS_QUERY, variables: { input } })
    expect(result.data?.superadminPayments?.pageInfo.pageSize).toBe(6)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const options = fetchMock.mock.calls[0]?.[1]
    expect(options?.credentials).toBe("include")
    expect(options?.method).toBe("POST")
    const body = JSON.parse(String(options?.body))
    expect(body.operationName).toBe("SuperadminPaymentsList")
    expect(body.variables).toEqual({ input })
    expect(body.variables.input).not.toHaveProperty("pageSize")
  })
  it("preserves HTTP 200/null/UPSTREAM_UNAVAILABLE as an error, without retry", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: { superadminPayments: null },
          errors: [
            {
              message: "Service unavailable",
              path: ["superadminPayments"],
              extensions: { code: "UPSTREAM_UNAVAILABLE" },
            },
          ],
        }),
        { headers: { "Content-Type": "application/json" } },
      ),
    )
    const result = await client().query({
      query: PAYMENTS_QUERY,
      variables: { input: { page: 1, searchUsername: "", sort: "CREATED_AT_DESC" } },
    })
    expect(result.data?.superadminPayments).toBeNull()
    expect(getPaymentsErrorMessage(result.error)).toContain("temporarily unavailable")
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe("payment list formatting", () => {
  it("uses each currency's minor units without currency conversion", () => {
    expect(formatListAmount(1234, "USD")).toBe("$12.34")
    expect(formatListAmount(1234, "JPY")).toContain("1,234")
    expect(formatListAmount(1234, "KWD")).toContain("1.234")
    expect(formatListAmount(1234, "invalid")).toBe("1234 minor units (invalid)")
  })
  it("uses product name and the confirmed billing interval", () => {
    expect(
      formatListSubscription({
        productName: "Mock plan",
        billingInterval: "WEEK",
        billingIntervalCount: 2,
      } as PaymentListItem),
    ).toBe("Mock plan · 2 weeks")
  })
  it("toggles only the chosen server sort", () => {
    expect(nextPaymentsSort("CREATED_AT_DESC", "CREATED_AT")).toBe("CREATED_AT_ASC")
    expect(nextPaymentsSort("USERNAME_ASC", "USERNAME")).toBe("USERNAME_DESC")
    expect(nextPaymentsSort("USERNAME_DESC", "PAYMENT_METHOD")).toBe("PAYMENT_METHOD_ASC")
  })
})
