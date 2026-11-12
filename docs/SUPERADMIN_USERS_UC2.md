# UC-2: Users list

Route: `/superadmin/users`.

Design reference: `design/superadmin-users-list.png`, exported once from Figma
node `376:8183`. Implementation uses this local reference.

## Contract used

The sources are `GRAPHQL_SUPERADMIN_FRONTEND_API.md`, contract 1.7.0, and
`graphql/superadmin/v1/runtime.graphql`: SA-GQL-03 (catalog), S1 (ban filter).
The user-supplied runtime SDL is saved without edits. No introspection or requests
to a real Gateway were used to infer additional operations.

| UI              | Documented operation/field                      |
| --------------- | ----------------------------------------------- |
| Users table     | `superadminUsers(input: SuperadminUsersInput!)` |
| Columns         | `userId`, `username`, `profileUrl`, `createdAt` |
| Block indicator | `state: ACTIVE / BLOCKED`                       |
| Pagination      | `page`, `pageSize`, `pageInfo`, `totalCount`    |
| Search          | `searchUsername`                                |
| Ban filter      | `banFilter: ALL / BLOCKED / NOT_BLOCKED`        |
| Sort            | `USERNAME_ASC/DESC`, `CREATED_AT_ASC/DESC`      |

The ellipsis menu contains **More information**, which opens
`/superadmin/users/[userId]` (UC-6), and **Delete**, which opens a confirmation
dialog (UC-3). Confirmed deletion uses the existing Apollo Client and refetches
the list, correcting an emptied last page while preserving list parameters.
See `SUPERADMIN_USER_DELETE_UC3.md` for the contract, error handling and safety
checks. **Ban in the system** and its reason dialog are implemented in UC-1;
see `SUPERADMIN_USER_BAN_UC1.md`. BLOCKED rows instead show **Un-ban**, documented
in `SUPERADMIN_USER_UNBAN_UC2.md`. Confirmed unblocking refetches the current
filtered result and corrects an emptied last page without resetting list parameters.

## Profile link and admin details

Current Users list behavior, reported by the user during this documentation
audit: the Profile link column displays nicknames, and clicking a link opens
the corresponding public Instagram profile. This is separate from
**⋯ → More information**, which opens the user's admin details page.

The code in `UsersTable.tsx` displays `username` as the link label (or View
profile when the username is missing) and uses the validated
`superadminUsers.items.profileUrl` as the destination. It does not construct an
Instagram URL from the nickname. Null or invalid URLs still render Unavailable.

The updated guide's Operations section still says the profile link is null,
while its list/detail section describes `/profile/{userId}` and shows URL values.
This contradiction must not be repeated as a blanket always-null description
of the currently observed list. The user has
also verified in the browser that clicking the nickname on the UC-6 details page
opens that user's public Instagram profile; that page uses the separate
`superadminUser.profileUrl` response. Both navigation paths are therefore
browser-confirmed by the user. This does not imply that every user, deployment
or GraphQL operation returns a non-null URL. The backend API guide is retained
as the supplied operation reference, with the inconsistency documented here.

## Pagination and list states

Page sizes are 4, 8 (default), and 10. Changing the size updates `input.pageSize`
and resets `page` to 1, preserving the search, filter and sort. Apollo refetches
with the updated variables. Page count comes from the backend's
`pageInfo.pagesCount`, without client-side calculation. The table caption and
pagination selector display the selected size. The documented backend bounds
are `pageSize` 1–50.

Loading, empty and error states remain distinct. Retry refetches the catalog;
if the requested page no longer exists, it moves to the last available page.

## Reused UI

`Input`, `Button`, `SelectBox`, `Pagination`, `Icon`, Next.js `Link`, and the
installed Radix dropdown menu primitive. There is no shared table
component: the existing payments table belongs to another feature. The Users
table is native semantic HTML with a scroll container on narrow screens.
The existing application sidebar has user-specific actions and logout, so this
shared superadmin layout renders `SuperadminSidebar`; unimplemented sections
are inactive rather than links to nonexistent routes. Sign-in has no sidebar.

## Backend limitations

- Profile URLs remain nullable. The user has confirmed working public Instagram
  links from both Users list and the details page; missing/invalid URL handling
  remains relevant for other records.
- Deployment of the documented schema, allowed frontend origin, cookies and
  CORS/CSRF response headers must be confirmed for the target Gateway. Source
  implementation and compilation do not establish production availability.
- List, deletion, blocking with a reason and unblocking use documented operations.
  Unblocking does not restore old user sessions or accept a ban reason.

## Verification scope

Earlier implementation checks covered TypeScript, scoped ESLint/Stylelint,
production build, and comparison of the list query and query options.

This documentation audit compared the current source with both frontend guides.
Checks are Markdown formatting, whitespace validation and production build; it
does not change application code or GraphQL operations. No new browser/Gateway
requests, login or moderation mutations are part of the audit. The Instagram
navigation confirmations for both Users list and the details page come from
the user's browser checks, not a new agent browser test. Other deployed behavior
is outside the scope of those confirmations.
