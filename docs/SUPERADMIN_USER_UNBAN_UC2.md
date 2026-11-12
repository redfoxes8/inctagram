# UC-2: Un-ban user

Route: `/superadmin/users`, row menu **Un-ban** for a `BLOCKED` user. An
`ACTIVE` row keeps **Ban in the system**. Both retain Delete and More information.
The existing catalog guide remains `SUPERADMIN_USERS_UC2.md`.

## Confirmed contract

Sources: `GRAPHQL_SUPERADMIN_FRONTEND_API.md`, SA-GQL-04B, and
`graphql/superadmin/v1/runtime.graphql`. No contract changes were made.

```graphql
mutation SuperadminUnbanUser($input: SuperadminUserIdInput!) {
  superadminUnblockUser(input: $input) {
    userId
    outcome
  }
}
```

Variables: `{ "input": { "userId": "<selected user's UUID>" } }`.
Unblock does not accept a reason. The existing Apollo Client and transport send
cookies with `credentials: include` and the existing in-memory CSRF nonce. The
protected-layout session bootstrap, authentication and Apollo settings are
unchanged. No session query is added before the mutation, and mutations are
never automatically retried.

## Confirmation and results

The dialog reuses the shared Modal and Button and the existing Ban dialog CSS:
primary No, outlined Yes, backdrop and content spacing. Existing local PNGs in
`design/superadmin-user-ban/` are the style references. No Figma request was made.

The question is exactly **Are you sure want to un-ban {username}?**. If username
is absent, show the selected ID. No/close dismiss without a request. Yes sends
one mutation; the shared synchronous in-flight guard prevents repeated Yes or
overlapping Ban/Delete/Un-ban actions. Buttons and closing are disabled while
pending; Yes displays **Un-banning…**. No reason field is shown.

| Outcome          | Behavior                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| `UNBLOCKED`      | Close dialog and refetch Users list.                                                                   |
| `ALREADY_ACTIVE` | Idempotent success: close and refetch without claiming a new state change.                             |
| `NOT_FOUND`      | Keep an explanation in the dialog, refresh the authoritative list, do not claim successful unblocking. |
| `USER_DELETED`   | Keep an explanation in the dialog, refresh, do not claim success or restore a deleted user.            |

Network/GraphQL errors, including errors accompanying data over HTTP 200,
unknown outcomes, missing payloads and mismatched user IDs keep the dialog and
original row visible with an error. No optimistic user state or success message
is inserted. A failed refetch after confirmed success is reported separately;
the mutation is not repeated.

Refetch preserves `banFilter`, `searchUsername`, `sort`, `pageSize` (4/8/10) and
the current page. The backend applies the `BLOCKED` predicate before count and
pagination, so an unblocked user disappears from that refreshed result. The
frontend does not manually remove/decrement rows. If the page no longer exists,
the existing refresh handler selects the last available page from backend
`pageInfo.pagesCount` and the list query loads it. A completely empty result
stays on page 1. This correction can require an additional list query.

Backend unblock clears the stored ban reason but does not restore old user
sessions/tokens: the user needs a new login. No user authorization, comment,
reaction, payment or details behavior was changed by this frontend task.

## Local checks and safety

Run `pnpm exec vitest run --config vitest.unit.config.ts`. Synthetic mock tests
cover the state-dependent row menu, exact question, confirmation and cancellation,
pending controls/double-submit prevention, failures, all documented outcomes,
filtered list refresh, pagination correction and preservation of list parameters.
The mutation validates against the saved SDL. Real Apollo HttpLink/transport with
replaced fetch checks exact variables, credentials/CSRF and no extra session
query or mutation retry. Existing Ban/Delete/session/details tests remain intact.

Additional checks: TypeScript, scoped ESLint/Stylelint, formatting,
`git diff --check` and `pnpm build`.

**Gateway/browser mutation acceptance was not performed. No test account was
created through Swagger, and no real user was blocked or unblocked.** Validation
uses mocks only; there was no verified disposable account for a live check.
Any future live check must create a separate unique test user through Swagger,
verify its ID and username, and block/unblock only that account.
