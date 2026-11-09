# UC-2: Users list

Route: `/superadmin/users`.

Design reference: `design/superadmin-users-list.png`, exported once from Figma
node `376:8183`. Implementation uses this local reference.

## Contract used

The source is `GRAPHQL_SUPERADMIN_FRONTEND_API.md`, contract 1.6.0:
SA-GQL-03 (catalog), S1 (ban filter). A separate runtime GraphQL SDL is referenced
by the guide but is not present in this frontend checkout. No introspection or
requests to a real Gateway were used to infer additional operations.

| UI              | Documented operation/field                      |
| --------------- | ----------------------------------------------- |
| Users table     | `superadminUsers(input: SuperadminUsersInput!)` |
| Columns         | `userId`, `username`, `profileUrl`, `createdAt` |
| Block indicator | `state: ACTIVE / BLOCKED`                       |
| Pagination      | `page`, `pageSize`, `pageInfo`, `totalCount`    |
| Search          | `searchUsername`                                |
| Ban filter      | `banFilter: ALL / BLOCKED / NOT_BLOCKED`        |
| Sort            | `USERNAME_ASC/DESC`, `CREATED_AT_ASC/DESC`      |

User moderation is deferred to a separate task. The last column retains a
disabled ellipsis button for the layout. It opens no menu and has no action
handler. The feature contains no moderation mutations, session bootstrap query,
confirmation dialog, block reasons, or mutation-result state.

Page sizes are 4, 8 (default), and 10. Changing the size updates `input.pageSize`
and resets `page` to 1, preserving the search, filter and sort. Apollo refetches
with the updated variables. Page count comes from the backend's
`pageInfo.pagesCount`, without client-side calculation. The table caption and
pagination selector display the selected size. The documented backend bounds
are `pageSize` 1–50.

Loading, empty and error states remain distinct. Retry refetches the catalog;
if the requested page no longer exists, it moves to the last available page.

## Reused UI

`Input`, `Button`, `SelectBox`, `Pagination`, `Icon`, and Next.js `Link`.
There is no shared table
component: the existing payments table belongs to another feature. The Users
table is native semantic HTML with a scroll container on narrow screens.
The existing application sidebar has user-specific actions and logout, so this
shared superadmin layout renders `SuperadminSidebar`; unimplemented sections
are inactive rather than links to nonexistent routes. Sign-in has no sidebar.

## Backend limitations

- The guide explicitly states that `profileUrl` currently returns `null` until
  the public profile route is agreed. The table shows **Unavailable**. Only
  a valid URL supplied by the backend can become a link; no route is invented.
- Deployment of the documented schema, allowed frontend origin, cookies and
  CORS/CSRF response headers must be confirmed for the target Gateway. Source
  implementation and compilation do not establish production availability.
- The list operations used here are documented. Moderation is intentionally
  deferred by frontend scope, rather than blocked by a missing backend operation.

## Verification scope

TypeScript, scoped ESLint/Stylelint, production build, and comparison of the
unchanged list query and query options. No real Gateway login, catalog
request or moderation mutation was executed. Browser and deployed API behavior
remain to be verified in the agreed environment with disposable accounts.
