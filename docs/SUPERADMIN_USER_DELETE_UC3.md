# UC-3: Delete user

Route: `/superadmin/users`, row menu **⋯ → Delete**. **More information** is
preserved; Ban with reasons is documented in `SUPERADMIN_USER_BAN_UC1.md`.
Unban is not implemented in the UI.

## Confirmed contract

Sources: `GRAPHQL_SUPERADMIN_FRONTEND_API.md` (SA-GQL-05) and the saved runtime
SDL `graphql/superadmin/v1/runtime.graphql`, contract 1.7.0.

```graphql
mutation SuperadminDeleteUser($input: SuperadminUserIdInput!) {
  superadminDeleteUser(input: $input) {
    userId
    outcome
  }
}
```

Variables: `{ "input": { "userId": "<selected user's UUID>" } }`.
This is backend soft deletion. No client-side optimistic removal is used.

| Outcome           | UI behavior                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| `DELETED`         | Close the dialog and refetch the catalog without a success message.                               |
| `ALREADY_DELETED` | Close the dialog and refetch without a success message (idempotent success).                      |
| `NOT_FOUND`       | Keep the dialog with an explanation and refresh the authoritative catalog; do not claim deletion. |

A missing payload, mismatched user ID, unknown outcome, GraphQL errors (including
errors alongside data), network or session errors are failures. The dialog
stays open, shows an error, and does not remove the row or refresh it as a
successful deletion. A failed catalog refresh after confirmed deletion is
reported separately; the mutation is not repeated.

## Confirmation and refresh

The existing shared `Modal`, `Button` and `Icon` components are reused.
The question is **Are you sure you want to delete {username}?**; if username is
null, the ID identifies the selected user. No and the close icon dismiss the
dialog without any request. Escape/overlay follow the shared Modal behavior.

Only Yes sends one deletion mutation through the existing Apollo Client. It does
not run an additional session query. On entering the protected superadmin layout,
`SuperadminSessionBoundary` first calls the confirmed `superadminSession` query
with `fetchPolicy: no-cache`. The unchanged transport captures its response nonce
in memory. Protected page content mounts only after successful bootstrap. The
sign-in route is excluded. Missing or stale session/CSRF errors remain visible;
deletion itself does not retry or bootstrap a session automatically.

With a nonce already captured by the same transport, after clearing requests
from earlier page/auth loading, a normal successful
deletion produces two GraphQL requests: `SuperadminDeleteUser` and one
`SuperadminUsersList` refetch. If that refetch proves the page no longer exists,
loading the available page requires an additional list query. This pagination
correction is retained, not treated as a redundant retry. CORS preflight is not a
GraphQL operation. No separate success text is rendered in the dialog or page;
loading is shown only in the confirmation button.

### CSRF bootstrap lifecycle and the earlier diagnosis

The removed `SuperadminDeleteUserSession` was a frontend operation name for the
confirmed `superadminSession { authenticated }` query, not a new backend API.
It read an existing session and refreshed the nonce; it did not log in or create
a session. Removing that call before providing a bootstrap lifecycle exposed a
frontend gap after reload, because the nonce exists only in transport memory.

The fix performs `RestoreSuperadminSession` once per protected-layout entry,
before mounting Users list or detail content. A promise held in a component ref
is shared across effect replay (Strict Mode) and rerenders. Protected-route
navigation retains the same boundary. Leaving for sign-in unmounts it; a new
entry or a new Apollo client starts one new attempt. There is no session query
before each mutation, no automatic retry after failure, and no persistent nonce
storage. The existing login and transport implementations are unchanged.

A confirmed `UNAUTHENTICATED` redirects to `/superadmin/sign-in`. A technical or
other GraphQL failure displays an error without treating it as logout; protected
content remains unavailable until a new page load/entry. Only a successful
`authenticated: true` response releases the boundary. Browser cookie acceptance
and the CSRF response header must still be supplied by Gateway/proxy; this fix
does not bypass cookie, Origin or CSRF checks.

Local tests validate the query against runtime SDL and use real Apollo/transport
with mocked fetch: the initial session request has no CSRF header, its response
provides a nonce, and the next mock mutation sends that nonce with credentials.
Mocked lifecycle tests prove one bootstrap call across effect replay/rerenders,
no retry on failure, conditional redirect, and ignored completion after unmount.
These checks do not emulate browser cookie storage or a live Gateway.

HTTP 200 does not make `errors[]` a successful deletion. The displayed Access
denied message maps to GraphQL `extensions.code: FORBIDDEN`; a missing/stale
nonce, rotated by another tab, or an unreadable response header still requires
inspection of existing Network evidence. No mutation is automatically repeated.

For a Gateway investigation, share the failed request's time/timezone, endpoint,
frontend Origin, operation name, HTTP status, and sanitized `errors[].message`,
`path`, `extensions.code` and `data` shape. Include only presence/absence of
`superadminSession`, `superadminCsrf` cookies and `X-Superadmin-CSRF`, whether the
header/cookie match locally, cookie Path/SameSite/Secure/expiry and browser blocked
cookie reasons. Check the earlier login/session response for `X-Superadmin-CSRF`,
`Access-Control-Expose-Headers`, exact `Access-Control-Allow-Origin` and
`Access-Control-Allow-Credentials`. Include a request/correlation ID if supplied
by the environment. Do not share raw cookies, nonce, credentials, or an
unredacted HAR/cURL export. These observations can be collected from the already
failed request; do not repeat deletion for diagnosis.
A synchronous in-flight guard prevents double confirmation; buttons and closing
are disabled while pending, with a Deleting state. No automatic mutation retries
are performed, including after an uncertain network result.

The existing Apollo list query is refetched with its current search, ban filter,
sort, page size (4/8/10, default 8) and page. If that page no longer exists, the
parent sets the last available page from backend `pageInfo.pagesCount` and loads
it; a completely empty catalog stays on page 1. No local count decrement or
invented success is used.

The saved `design/superadmin-users-list.png` is the local list reference. No
deletion-specific frame is saved locally; the dialog follows existing shared
UI styles. Figma was not contacted again.

## Verification and safety

Run the isolated tests with `pnpm exec vitest run --config vitest.unit.config.ts`.
API tests use the real Apollo HttpLink and CSRF transport with fully replaced
fetch responses and a synthetic UUID. The mutation validates against the saved SDL. They cover the three outcomes, partial GraphQL errors, unknown
outcomes, wrong IDs, authentication/CSRF errors and uncertain network failure without retry.
The request-count test clears earlier mocked session traffic, then checks exactly
one mutation and one catalog query, including the existing CSRF header.
Parent handler tests use mocked hooks to check cancellation, repeated
confirmation, pending controls, failures, refresh, pagination correction and
preservation of list filters. These are local unit checks, not a browser or
deployed Gateway integration test.

Additional checks: TypeScript, scoped ESLint and Stylelint, formatting,
`git diff --check`, and `pnpm build`.

**No real deletion request was sent, and no backend test user was created.**
Verification was limited to synthetic mock data; no student account from the
real list was used. The user subsequently confirmed deletion in the browser; the agent has not
performed a live deletion. Browser Network was not inspected during the request
cleanup because backend requests were prohibited; counts are established locally
with mocked fetch responses. A future live check must
create a unique disposable user through Swagger, verify its ID and username,
and delete only that user.
