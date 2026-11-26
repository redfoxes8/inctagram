# UC-3: General Payments list

Route: `/superadmin/payments`, linked from the existing superadmin Sidebar.
The active-section styling and shared superadmin session boundary are reused.
Work started on `main` with a clean tree; earlier Ban/Un-ban changes were already
in the branch. Their implementation, Users list, user details, authentication and
Apollo configuration are outside this change.

## Saved design

The one supplied Figma node `8924:12843` from file
`UehOuThHVruUR8jcC22FXS` was exported in one image-download request to
`design/superadmin-payments-list/payments-list.png`. Implementation uses that local
PNG; Figma was not fetched again.

The table combines the avatar and username in its first cell, followed by
payment date, amount, subscription and payment method. Columns are server-driven
and retain a scroll container on narrow screens. The guide supplies username,
not a full name; the header therefore says Username rather than Full Name.
The Amount header is currency-neutral, because the API does not promise USD.

The screenshot's 100-row selector is replaced with the contracted fixed six:
**Show 6 on page**. There is no unsupported size input. The screenshot's
Autoupdate control is not included: polling/realtime behavior was not requested,
and no Payments subscription is defined in the current runtime contract.

## Confirmed API

Sources: `GRAPHQL_SUPERADMIN_FRONTEND_API.md`, P2 (introduced in 1.5.0), and the
saved `graphql/superadmin/v1/runtime.graphql` (current contract 1.7.0).

```graphql
query SuperadminPaymentsList($input: SuperadminPaymentsInput!) {
  superadminPayments(input: $input) {
    items {
      transactionId
      userId
      username
      avatarUrl
      createdAt
      amountMinor
      currency
      productName
      billingInterval
      billingIntervalCount
      provider
      status
    }
    totalCount
    pageInfo {
      page
      pageSize
      pagesCount
      hasNextPage
    }
  }
}
```

Example variables:

```json
{
  "input": {
    "page": 1,
    "searchUsername": "example",
    "sort": "CREATED_AT_DESC"
  }
}
```

This is a separate root query, not `superadminUser.payments`. The input has
`page`, nullable `searchUsername`, and `sort`; there is **no pageSize argument**.
Backend page size is always 6, page bounds are 1–10000. Page count is read from
backend `pageInfo.pagesCount`, not calculated by slicing or counting loaded rows.

| UI sort        | Confirmed enum values                       |
| -------------- | ------------------------------------------- |
| Username       | `USERNAME_ASC`, `USERNAME_DESC`             |
| Date added     | `CREATED_AT_ASC`, `CREATED_AT_DESC`         |
| Amount         | `AMOUNT_ASC`, `AMOUNT_DESC`                 |
| Payment Method | `PAYMENT_METHOD_ASC`, `PAYMENT_METHOD_DESC` |

Default is `CREATED_AT_DESC`. Header buttons toggle the corresponding server
enum; no client-side row sorting is performed. Applying search via Enter, the
search icon or keyboard-accessible submit button trims the term and resets page
to 1, preserving sort. Sorting also resets page to 1 and preserves search.
Pagination preserves both. Search is a literal case-insensitive substring over
the whole projection, max 100 characters; empty search disables the filter.

## Rendering and limitations

- `createdAt` is the payment transaction creation date, formatted as UTC
  DD.MM.YYYY. It is not substituted with a user's registration date.
- `amountMinor` is displayed using the actual `currency` and that currency's
  minor-unit exponent. There is no FX conversion; AMOUNT sorting compares the
  backend numeric minor-unit amount, not economic value across currencies.
- Subscription shows current `productName`, `billingInterval` (WEEK/MONTH) and
  `billingIntervalCount`. Historical product-name snapshots and arbitrary day
  intervals are not part of this list contract.
- Method is `provider` STRIPE/PAYPAL, shown as Stripe/PayPal; card details are
  not available. All documented statuses remain included, without inventing
  a status filter or treating every payment as succeeded.
- Nullable/missing username is Unavailable. The Radix avatar fallback handles
  null/invalid/broken avatar URLs; no fixture name or photograph is substituted.
  Payments of missing/deleted users are retained.
- Usernames come from an eventually consistent Payment projection; avatar
  enrichment cannot correct already-applied stale search, ordering or counts.
- Before initial projection READY, or during outage/timeout/sync failure, the
  root can be null with UPSTREAM_UNAVAILABLE. This is a visible error with
  explicit Retry, not an empty list. Deployment/readiness of the target Gateway
  is not established by the local SDL or these checks.

Loading, error, null-result and successful empty-result states are distinct.
Loading/errors hide stale rows and pagination. Successful empty results show
**No payments found.**, with visible pagination and disabled arrows when
`pagesCount=0`. A valid offset beyond a nonempty result says **This page is empty.**
and offers a previous-page action. Retry refetches explicitly; if the requested
page vanished, the existing list pattern selects the last backend-supported
page (or 1 for a completely empty result) and loads it. There are no automatic
request retries or mutations.

## Reused components

Existing `Input`, `Button`, `Icon`, `Pagination`, Radix Avatar, superadmin layout,
Sidebar and Apollo Client/HTTP transport are used. There is no shared generic
table component; a native semantic `PaymentsTable` follows the Users list
pattern without importing its moderation UI or changing it. The shared
Pagination has an optional `fixedPageSize` flag (default false) to show six as
text; existing consumers retain their size selectors and behavior.

## Verification

`pnpm exec vitest run --config vitest.unit.config.ts` checks the query against
runtime SDL, all eight server sort values, exact variables without pageSize,
cookie credentials, HTTP 200/null/upstream error behavior, currency formatting,
subscription fields, search/reset/pagination state, fixed-size empty pagination,
server row order, nullable identity fields, loading and errors. All response
fixtures and API interception exist only in `.test.ts(x)` files. No mock data or
mock transport is connected to the application.

Additional checks: TypeScript, scoped ESLint/Stylelint and Prettier,
`git diff --check` and `pnpm build`. Existing Users, moderation, session and
details tests remain unchanged and run as regressions.

**No real query or mutation was sent to Gateway.** Checks are local mocks and
server-rendered UI tests, not live browser/Gateway acceptance. No user account
was created or modified. The saved API guide/SDL were not rewritten.
