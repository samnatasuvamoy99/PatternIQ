# DSA Pattern Learning Platform — Backend

A production-style backend for a DSA learning platform + technical article/community
system + admin panel, built with **Next.js (App Router) API routes, TypeScript, Prisma,
PostgreSQL/Neon, and Zod**.

Scope note (by request): **no realtime messaging system** and **no caching layer**
(no Redis) are implemented. All admin replies to comments are plain threaded comments
from an ADMIN-role user — no separate messaging table. Rate limiting, which the
original design doc pairs with Redis, is likewise left out; add it at the edge
(e.g. a proxy, or `@upstash/ratelimit` if you introduce Redis later) if needed.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, Route Handlers) |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Auth | Custom JWT (access + refresh tokens), bcrypt password hashing |
| Validation | Zod |

## Getting Started

```bash
cp .env.example .env
# fill in DATABASE_URL (Neon connection string) and JWT secrets

npm install          # also runs `prisma generate` via postinstall
npx prisma migrate dev --name init
npm run prisma:seed  # creates an admin user + one sample topic/pattern/problem
npm run dev
```

Seeded admin login: `admin@dsaplatform.com` / `Admin@12345` — change this immediately
in a real deployment.

## Project Structure

```
prisma/
  schema.prisma        # full data model (users, learning, articles, community, admin)
  seed.ts

src/
  lib/                 # cross-cutting infrastructure
    prisma.ts           # Prisma client singleton
    jwt.ts               # sign/verify access + refresh tokens
    password.ts          # bcrypt hash/compare
    auth.ts               # reads + verifies the request's JWT -> AuthContext
    handler.ts             # apiHandler() wrapper: central error handling,
                            # requireAuth()/requireAdmin() guards, pagination helpers
    api-response.ts          # ok() / created() / fail() standardized JSON shape
    errors.ts                 # ApiError with status/code/message + factory helpers
    slug.ts                    # slug generation + uniqueness checks
    validations/                # one Zod schema file per module

  services/             # business logic — the "service layer" from the design doc.
                         # Route handlers are thin; all Prisma calls and multi-step
                         # transactions (e.g. markProblemSolved, publishArticle) live here.
    auth.service.ts
    topic.service.ts
    pattern.service.ts
    problem.service.ts
    progress.service.ts    # markProblemSolved() — the core progress transaction
    revision.service.ts    # spaced-repetition scheduling (1/3/7/14/30 days)
    note.service.ts
    article.service.ts     # lifecycle: DRAFT -> SUBMITTED -> PUBLISHED/REJECTED/...
    comment.service.ts     # threaded comments, replies, admin moderation
    like-bookmark.service.ts
    notification.service.ts
    search.service.ts
    dashboard.service.ts
    admin-user.service.ts

  app/api/v1/            # route handlers, mirroring the API spec 1:1
    auth/...
    topics/...            patterns/...          problems/...
    progress/...          revision/...          notes/...
    articles/...          comments/...          bookmarks/...
    notifications/...     search/               dashboard/
    admin/
      dashboard/  topics/  patterns/  problems/
      articles/   users/   comments/  analytics/
```

## Request Flow

Every route follows the same pipeline (the Next.js equivalent of the
Express `route -> middleware -> controller -> service -> Prisma` chain):

```
Route Handler (app/api/.../route.ts)
   -> apiHandler()            centralized try/catch + response formatting
   -> getAuthContext()        reads & verifies JWT from Authorization header or cookie
   -> requireAuth/requireAdmin  throws ApiError.unauthorized/forbidden if needed
   -> zod schema.parse()      validates request body — never trusts the client
   -> service function        all business logic + Prisma calls
   -> ok()/created()/fail()   standardized { success, data|error } JSON response
```

Standard success response:
```json
{ "success": true, "message": "Article published successfully", "data": { } }
```

Standard error response:
```json
{ "success": false, "error": { "code": "ARTICLE_NOT_FOUND", "message": "Article not found" } }
```

## Authentication

- `POST /api/v1/auth/register` / `login` return `{ user, accessToken, refreshToken }`.
- Send the access token as `Authorization: Bearer <token>` on subsequent requests
  (or store it in an `accessToken` cookie — both are read by `getAuthContext`).
- `POST /api/v1/auth/refresh` exchanges a refresh token for a new token pair.
- Authorization is role-based (`STUDENT` / `ADMIN`), enforced server-side in every
  admin route via `requireAdmin()` — never trust a client-side role check.

## Key Business Logic

- **`markProblemSolved`** (`progress.service.ts`): a single Prisma transaction that
  upserts problem progress, recalculates every related pattern's completion
  percentage, flips a pattern to `COMPLETED` when all its problems are solved, and
  schedules the first spaced-repetition revision — so problem/pattern/revision state
  can never drift out of sync.
- **`publishArticle` / `rejectArticle` / `requestArticleChanges`**
  (`article.service.ts`): update article status and fire an in-app notification to
  the author.
- **Comment replies**: an ADMIN replying to a comment is just a comment authored by
  an ADMIN-role user (`isAdminReply` flag drives the notification type/label) — no
  separate messaging system, per the request scope.
- **Revision scheduling** (`revision.service.ts`): completing a revision schedules
  the next one at the next interval in `[1, 3, 7, 14, 30]` days.

## What's intentionally out of scope

- **Realtime**: no WebSockets/SSE. Notifications are pull-based (`GET /notifications`).
- **Caching**: no Redis, no cache invalidation logic. Every read hits PostgreSQL
  directly through Prisma. This keeps the system simpler to reason about; add a
  cache layer later if read volume demands it.
- **Rate limiting**: not implemented (it was specified as Redis-backed in the
  original design). Add `express-rate-limit`-equivalent middleware or an edge
  solution if you need it before going to production.
- A handful of the more repetitive analytics endpoints (`/admin/analytics/users`,
  `/topics`, `/patterns`, etc.) are consolidated into `/admin/analytics/overview`
  for now — follow the same `service function -> route handler` pattern in
  `dashboard.service.ts` to split them out if you need per-slice endpoints.

## Notes on Next.js route conventions used here

- Dynamic segments are shared where the spec's REST paths differ only by whether
  the identifier is a `slug` or an `id` — e.g. `articles/[id]/route.ts` handles both
  `GET /articles/:slug` (public read) and `PATCH/DELETE /articles/:id` (owner
  actions) by looking the article up with `OR: [{ slug }, { id }]`.
- Static path segments (`/articles/categories`, `/admin/topics/reorder`, etc.) are
  siblings of a dynamic `[id]` segment in the same directory — Next.js resolves the
  literal path first, so there's no ambiguity.
