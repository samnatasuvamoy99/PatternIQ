# DSA Pattern Learning Platform — Frontend Integration Guide

This guide provides everything you need to build a modern, high-performance frontend for the **DSA Pattern Learning Platform Backend**.

---

## 1. Overview & Architecture

- **Backend Protocol**: REST API (JSON responses over HTTP/HTTPS)
- **Base URL**: `http://localhost:3000/api/v1` (or your deployed server URL)
- **Authentication**: JWT Bearer Tokens (`Authorization: Bearer <access_token>`)
- **Roles**: `STUDENT` and `ADMIN`

---

## 2. API Response & Error Contract

All API endpoints return a standardized JSON structure.

### Success Response Format
```json
{
  "success": true,
  "message": "Operation description (optional)",
  "data": { ... }
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED | NOT_FOUND | VALIDATION_ERROR | FORBIDDEN | BAD_REQUEST",
    "message": "Human readable error message",
    "details": [ ... ]
  }
}
```

---

## 3. Authentication & Authorization Strategy

### 🔑 Authentication Lifecycle
1. **Register / Login**:
   - `POST /api/v1/auth/register` or `POST /api/v1/auth/login`
   - Returns `{ user, accessToken, refreshToken }`
2. **Attaching Tokens**:
   - Send `Authorization: Bearer <accessToken>` header on all protected requests.
3. **Token Refresh Flow**:
   - When an API returns `401 Unauthorized`, send `POST /api/v1/auth/refresh` with `{ refreshToken }` to get a new `accessToken`.

### 🛡️ User Roles
- `STUDENT`: Access to learning topics, patterns, problem solving, notes, revisions, community articles, comments, bookmarks.
- `ADMIN`: Access to everything `STUDENT` has, **plus** `/api/v1/admin/*` endpoints to create/edit topics, patterns, problems, manage users, and moderate articles/comments.

---

## 4. Complete API Endpoint Reference

### 🔐 1. Authentication (`/api/v1/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register new student (`name`, `email`, `password`) |
| `POST` | `/auth/login` | Public | Login user/admin (`email`, `password`) |
| `POST` | `/auth/refresh` | Public | Refresh expired access token (`refreshToken`) |
| `POST` | `/auth/logout` | Auth | Revoke refresh token |
| `GET` | `/auth/me` | Auth | Get current logged-in user profile |

---

### 📚 2. Topics & Learning Paths (`/api/v1/topics`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/topics` | Public | Get all published topics (e.g., Arrays, Two Pointer, Dynamic Programming) |
| `GET` | `/topics/:slug` | Public | Get single topic details by slug |

---

### 🧩 3. Patterns (`/api/v1/patterns`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/patterns` | Public | Get all published patterns (with optional query `?topicSlug=array&difficulty=EASY`) |
| `GET` | `/patterns/:slug` | Public / Auth | Get pattern details including **pseudocode**, intuition, templates (C++, Java, JS), and attached problems. If auth header provided, includes user progress. |

---

### 💡 4. Problems (`/api/v1/problems`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/problems` | Public | List problems (filterable by `difficulty`, `search`) |
| `GET` | `/problems/:slug` | Public / Auth | Get problem details, solve URL (e.g., LeetCode link), and attached patterns |

---

### 📈 5. User Progress & Revision System (`/api/v1/progress` & `/api/v1/revision`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/progress/problem` | Student | **Core Action**: Mark a problem as `SOLVED` / `ATTEMPTED`. Automatically recalculates pattern completion & schedules spaced repetition. |
| `GET` | `/revision` | Student | Get user's pending revisions scheduled for today |
| `POST` | `/revision/:id/complete` | Student | Mark a revision session as completed (updates spaced repetition interval) |

---

### 📝 6. Notes (`/api/v1/notes`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/notes` | Student | Get all user notes (filter by `?patternId=...`) |
| `POST` | `/notes` | Student | Create a personal study note for a pattern |
| `PUT` | `/notes/:id` | Student | Update a note |
| `DELETE` | `/notes/:id` | Student | Delete a note |

---

### 📰 7. Community Articles & Comments (`/api/v1/articles` & `/api/v1/comments`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/articles` | Public | List published community articles (`?category=DSA`) |
| `GET` | `/articles/:slug` | Public | Get article details and full content |
| `POST` | `/articles` | Student / Admin | Draft/Submit a new technical article |
| `PUT` | `/articles/:id` | Author / Admin | Update article content |
| `POST` | `/articles/:id/like` | Student | Like / Unlike an article |
| `POST` | `/bookmarks` | Student | Bookmark an article |
| `GET` | `/bookmarks` | Student | List user's bookmarked articles |
| `GET` | `/comments?articleId=...` | Public | Fetch threaded comments for an article |
| `POST` | `/comments` | Student | Add a comment or reply (`parentId` for replies) |

---

### 📊 8. Dashboard & Notifications (`/api/v1/dashboard` & `/api/v1/notifications`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/dashboard` | Student | Get user learning stats (solved counts, streak, pattern completion %) |
| `GET` | `/notifications` | Student | List user notifications (comment replies, article approvals) |
| `PATCH` | `/notifications/:id/read` | Student | Mark notification as read |

---

### 🛠️ 9. Admin Management Panel (`/api/v1/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/admin/dashboard` | Admin | Overall platform statistics |
| `GET/POST` | `/admin/topics` | Admin | List / Create topics |
| `PUT/DELETE` | `/admin/topics/:id` | Admin | Edit / Delete topic |
| `GET/POST` | `/admin/patterns` | Admin | List / Create patterns (with **pseudocode**, intuition, templates) |
| `PUT/DELETE` | `/admin/patterns/:id` | Admin | Edit / Delete pattern |
| `POST` | `/admin/patterns/:id/duplicate` | Admin | Duplicate a pattern |
| `POST` | `/admin/patterns/:id/attach-problem` | Admin | Link a problem to a pattern |
| `GET/POST` | `/admin/articles` | Admin | Review pending submitted articles |
| `PATCH` | `/admin/articles/:id/status` | Admin | Approve (`PUBLISHED`) or Reject article |

---

## 5. Recommended Frontend Pages & Components

To build a complete UI, implement the following pages:

1. **Auth Pages**:
   - Login (`/login`)
   - Register (`/register`)

2. **Student Learning Portal**:
   - **Dashboard** (`/dashboard`): Streak counter, patterns mastered, due revisions widget.
   - **Topic Explorer** (`/topics`): Topic cards (Arrays, Trees, Graphs, DP).
   - **Pattern Detail View** (`/patterns/:slug`):
     - Interactive Tabs: *Intuition*, *Core Idea*, *Pseudocode*, *Code Templates (C++, Java, JS)*.
     - Attached Problem List (Solve links + "Mark as Solved" checkbox).
     - Personal Notes widget.
   - **Spaced Repetition View** (`/revision`): Daily flashcard-style pattern review.

3. **Community & Articles**:
   - Article Feed (`/articles`)
   - Article Reader (`/articles/:slug`) + Threaded Comment section with Like/Bookmark buttons.
   - Article Editor (`/articles/new`) using a Markdown/Rich Text Editor.

4. **Admin Dashboard** (`/admin`):
   - Pattern Creator / Editor (Form fields for `name`, `pseudocode`, templates, attached problems).
   - Article Moderation Queue.
