# UC-1: Ban user

Implemented on `/superadmin/users`. Work started on branch `main` with a clean
working tree. No reset, checkout or commit was performed.

## Local design references

All three supplied Figma nodes were exported as PNG in one batch request from
file `UehOuThHVruUR8jcC22FXS`, then inspected locally. No subsequent Figma fetch
was used:

| Node       | PNG                                            | Content                                               |
| ---------- | ---------------------------------------------- | ----------------------------------------------------- |
| `376:8604` | `design/superadmin-user-ban/users-actions.png` | Row menu: Delete, Ban in the system, More information |
| `376:8746` | `design/superadmin-user-ban/ban-user.png`      | Ban user confirmation dialog                          |
| `376:9289` | `design/superadmin-user-ban/ban-reasons.png`   | Open reason selector with all three reasons           |

The requested question takes precedence over the shorter design wording:
**Are you sure you want to ban {username}?** A missing username falls back to
the selected ID. The screenshots do not contain a custom-text or pending view;
the required custom field reuses `TextArea`, and pending confirmation shows
**Banning…** in the disabled Yes button. No is primary and Yes is outlined,
matching the supplied dialog.

## Confirmed GraphQL contract

Sources: `GRAPHQL_SUPERADMIN_FRONTEND_API.md`, SA-GQL-04B + S3, and
`graphql/superadmin/v1/runtime.graphql`, current saved contract 1.7.0.
The optional reason input was introduced in 1.4.0. No SDL or guide changes were
needed, no introspection was performed and no unsupported operation was added.

```graphql
mutation SuperadminBanUser($input: SuperadminUserIdInput!, $reason: SuperadminBanReasonInput) {
  superadminBlockUser(input: $input, reason: $reason) {
    userId
    outcome
  }
}
```

| UI label              | Code                    | Sent text                                      |
| --------------------- | ----------------------- | ---------------------------------------------- |
| Bad behavior          | `BAD_BEHAVIOR`          | Omitted                                        |
| Advertising placement | `ADVERTISING_PLACEMENT` | Omitted                                        |
| Another reason        | `ANOTHER_REASON`        | Required after trim, 1–500 Unicode code points |

Selection is explicit. Empty/whitespace custom reasons and more than 500 code
points are rejected locally before mutation; Unicode characters are counted as
code points, not UTF-16 units. Changing the reason clears old custom text and
validation errors. Standard reasons never send hidden custom text. Backend
validation remains authoritative.

## Behavior and shared UI

The row menu retains Delete and More information and adds **Ban in the system**
with the existing `Block` icon, in the design order. Already BLOCKED rows have
the ban item disabled. There is no Unban action.

`BanUserDialog` reuses `Modal`, `Button`, `SelectBox` and `TextArea`. SelectBox
has an optional `contentClassName` for this dialog's reason portal to appear
above the modal; unrelated callers keep their default styles and behavior.
No new SVG or duplicated field/dropdown implementation was added.

No, the close icon and shared Modal dismissal close without a mutation. Yes
submits once; a synchronous shared in-flight guard prevents double confirmation
or overlapping delete/ban actions. While pending, closing, buttons and fields
are disabled. No automatic retry, optimistic state update or success message
is used.

| Outcome           | UI behavior                                                                           |
| ----------------- | ------------------------------------------------------------------------------------- |
| `BLOCKED`         | Close dialog and refetch the authoritative Users list.                                |
| `ALREADY_BLOCKED` | Idempotent result: close and refetch; do not claim a new reason was stored.           |
| `NOT_FOUND`       | Keep an explanation in the dialog and refresh the list; no successful ban is claimed. |
| `USER_DELETED`    | Keep an explanation in the dialog and refresh the list; no successful ban is claimed. |

GraphQL errors, including HTTP 200 with errors alongside data, a missing payload,
unexpected outcome, mismatched user ID or network failure keep the dialog open
with an error and do not remove/change the row locally. A refresh failure after
confirmed success is shown separately without repeating the mutation.

The existing Apollo Client and transport handle credentials and CSRF. The
existing protected-layout session bootstrap is unchanged; there is no session
query before each ban. The normal successful action sends one mutation and one
list refetch. If the current page no longer exists after a NOT_BLOCKED filter
excludes the banned user, the existing correction loads the backend's last
available page. Search, sort, filter and selected 4/8/10 size are preserved.

Comments/reactions are not changed or hidden by this frontend. Their visibility
is explicitly deferred in the guide and requires backend/domain policy; this
implementation does not claim to implement those effects. Ban reasons are not
returned by the list/detail contract and are not fabricated for existing bans.

## Verification and safety

Local tests use synthetic users and replaced fetch responses only:

- No/close cancellation, all three reasons, custom field visibility, trim,
  whitespace rejection, 500/501 Unicode code-point bounds and reset on selection.
- Pending controls and synchronous duplicate-submit protection.
- Confirmed outcomes, failure with the original row/dialog preserved, no retry,
  list refresh, filtered pagination correction, and unchanged list parameters.
- Mutation validation against the saved SDL, exact variables, HTTP 200 GraphQL
  errors, mismatched/unknown results, network failure, and existing CSRF transport.
- Existing deletion, session bootstrap and details pagination regression tests.

Run `pnpm exec vitest run --config vitest.unit.config.ts`, TypeScript, scoped
ESLint/Stylelint and formatting checks, `git diff --check`, and `pnpm build`.
These are local checks, not browser/Gateway acceptance.

**No backend test account was created, no real ban mutation was sent, and no
student account was used.** No verified disposable Swagger fixture was available
for a live check, so verification was limited to mocks. Any future live check
must first create a unique disposable user through Swagger and verify both its
ID and username; only that account may be blocked.
