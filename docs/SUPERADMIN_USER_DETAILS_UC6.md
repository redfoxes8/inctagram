# UC-6: User details

Route: `/superadmin/users/[userId]`. Open it with **⋯ → More information** in
Users list. This menu entry uses the selected row's user ID. The Profile link
column instead opens the public profile URL and is not the admin-details entry.
Existing list search, ban filter, sorting and page size 4/8/10 (default 8) remain unchanged. The common
superadmin layout and sidebar are reused; there are no moderation actions.

## Design references

All four frames were exported in a single Figma tool request and then used
locally:

- `design/superadmin-user-details/overview.png` — node `9012:12771`.
- `design/superadmin-user-details/payments.png` — node `9012:13460`.
- `design/superadmin-user-details/followers.png` — node `9012:13793`.
- `design/superadmin-user-details/following.png` — node `9012:14097`.

The first tab is **Uploaded photos**, selected initially, as named in the active
gallery frame `overview.png`. The other three frames use the inconsistent label
Uploaded files for that same first position; the gallery frame's label is used.
Payments, Followers and Following retain their own pagination and state handling.

## Contract

Source: `GRAPHQL_SUPERADMIN_FRONTEND_API.md`, runtime contract 1.7.0,
and `graphql/superadmin/v1/runtime.graphql`. The updated instruction and SDL
were supplied by the user after the downloaded files could not be found locally.
The SDL was saved without reformatting or schema edits; the photo query and the
existing detail/list queries are validated against it. User-reported runtime
observations are recorded separately below.

- Overview: `superadminUser(userId: ID!)` with `userId`, `username`, `avatarUrl`,
  `profileUrl`, `createdAt`, `state`.
- Uploaded photos: `superadminUser.uploadedPhotos(input: PageInput!)`, selecting
  `items { imageId postId url }`, `totalCount` and the same page metadata as the
  other connections. Each item is one PostImage, not one post.
- Payments: `superadminUser.payments(input: PageInput!)`; fields are
  `transactionId`, `createdAt`, `paidAt`, `subscriptionEndsAt`, `amountMinor`,
  `currency`, `billingInterval`, `billingIntervalCount`, `provider`.
- Followers and Following: `followers(input: PageInput!)` and
  `following(input: PageInput!)`, selecting only `items { userId }`.
- Every connection selects `totalCount` and `pageInfo { page pageSize pagesCount
hasNextPage }`. A local `connection` alias gives the tabs a common response
  shape; it is not a new schema field.

Only the active tab is requested. Each tab keeps its own page and page size;
default 8, options 4/8/10, size changes reset only that tab to page 1. Counts and
pages come from the server. Changing the user resets all tab state. Loading,
errors, null connection, missing/deleted parent and successful empty lists are
handled separately. A tab failure preserves the independently loaded overview.
Retry repeats only reads; no mutations or auth/session changes are introduced.

## Display and limitations

- Uploaded photos displays a four-column grid from published, undeleted posts
  belonging to the selected user, in backend order. Each `imageId` identifies a
  tile, so multiple images from one `postId` stay separate. Counts and page sizes
  refer to images. The avatar remains a separate overview field and is never
  inserted into the gallery. Narrow screens use two columns, then one.
- A successful photo connection with `items=[]` shows **No photos yet.** when
  `totalCount=0`, or **This page is empty.** for an offset past a nonempty result.
  `uploadedPhotos=null` and `UPSTREAM_UNAVAILABLE` display an error with Retry,
  preserving the overview. Errors never become successful empty galleries.
- A photo with `url=null`, an invalid URL, or an image loading failure keeps its
  tile and displays **Image unavailable**. No replacement/example photos are used.
  Backend does not check browser/S3 availability, so URL success is not assumed.
  Retry from a later page resets photo pagination to the first page. The empty
  offset state also provides a first-page action for a list shifted by concurrent
  publication/deletion. There is no automatic retry or global Posts feed scan.
- `username`, `avatarUrl`, `profileUrl` can be null. An unavailable avatar uses
  the existing Radix avatar fallback pattern. Missing profile URLs are shown as
  unavailable; routes are not guessed.
- Detail profile links use the separate `superadminUser.profileUrl` response:
  `SuperadminUserDetails.tsx` passes it through `getProfileHref`, renders a link
  labelled with `username` (or View profile) for a valid URL, and shows Profile
  link unavailable otherwise. The user has verified in the browser that clicking
  the nickname on the **user details page** opens that user's public Instagram
  profile. This confirms the detail-page link behavior using
  `superadminUser.profileUrl`, in addition to the previously checked Users list
  links using `superadminUsers.items.profileUrl`. The confirmation covers the
  checked behavior; nullable-field handling still applies. The updated guide is
  internally inconsistent: Operations still says the profile link is null,
  while list/detail describes `${FRONTEND_URL}/profile/{userId}` and shows a URL.
  The frontend continues to use the returned `profileUrl` unchanged, including
  the links already browser-verified by the user. This source contradiction is
  documented here rather than resolved by rewriting the backend contract.
- Payments use actual currency minor units and Intl currency fraction digits;
  there is no hardcoded dollar conversion. The Amount header is currency-neutral.
  Date of payment uses `paidAt`, falling back to `createdAt` with a tooltip when
  payment date is absent. Null subscription end dates show Unavailable.
- Subscription periods are the documented WEEK/MONTH plus count, rather than
  invented day-based products from the illustrative design. Providers are the
  documented STRIPE/PAYPAL.
- Followers/Following currently have the documented temporary FOLLOW-ZERO-1
  behavior, consistent with the reported empty tabs: `items=[]`,
  `totalCount=0`, `pagesCount=0`. As agreed, these responses show an empty table
  with **No data to display.** and the pagination controls from the design,
  including the page-size selector with options 4/8/10. No Followers/Following
  count labels, Total label or temporary
  unavailability message. When `pagesCount=0`, the current requested page is
  displayed as an inactive indicator; page navigation is disabled. The backend's
  zero metadata is preserved without inventing extra pages. All four detail tabs
  now opt into pagination for successful empty responses; unrelated pagination
  consumers retain their behavior. These are placeholder
  responses, not real social-graph data. Request errors remain a separate error
  state. No fictional people or dates are
  added. If records become available, only their confirmed user ID can be shown;
  the remaining design columns stay Unavailable.
- Backend follow-up: real social connections, username, public profile URL,
  subscription date and corresponding item-field contract are needed to fill
  the Followers/Following design. Sorting these tabs is not documented and is
  not offered.
- A successful empty Payments response shows **No payments yet.** Request errors
  remain separate from empty results. A page beyond a nonempty result still
  shows This page is empty. Empty Payments and Uploaded photos keep visible
  pagination with the enabled 4/8/10 size selector; zero-page responses disable
  navigation arrows. Loading and error states do not show pagination. Nonempty
  tables/gallery and server pagination keep their previous behavior.
- Target deployment, allowed origins and cookie/CORS setup remain environment
  prerequisites; local validation does not establish production availability.

## Reuse and verification

Reused `Tabs`/Radix tab panels, `Pagination`, `Button`, `Icon`, Next.js `Link`,
the existing Radix avatar/dropdown primitives and list date/URL/error helpers.
Tables use native semantic HTML, as there is no shared table component.

Earlier implementation checks covered TypeScript, scoped ESLint/Stylelint,
production build and offline checks of query selections, currency/date
formatting, empty/error rendering, and independent tab pagination.

The Uploaded photos update checks the supplied SDL, read-only query selections,
the image count (including multiple images from one post), nullable/error/empty
states, image fallback and separate tab pagination. TypeScript, scoped linters
and production build are run. Offline checks do not establish a deployed 1.7.0
Gateway or browser/S3 availability. No mutations are part of verification.
Existing profile navigation was browser-verified by the user and is preserved.
