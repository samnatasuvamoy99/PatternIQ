# 🚀 DSA Pattern Learning Platform — Complete API & Postman Documentation

Welcome to the complete API reference for the **DSA Pattern Learning Platform Backend**. 

This document contains a comprehensive breakdown of all **60+ REST API endpoints**, request body schemas, headers, authentication flows, and instructions for importing the pre-configured Postman Collection into Postman.

---

## 📑 Table of Contents

- [1. Quick Start & Postman Setup](#1-quick-start--postman-setup)
- [2. Authentication & Authorization Strategy](#2-authentication--authorization-strategy)
- [3. Complete API Endpoint Reference](#3-complete-api-endpoint-reference)
  - [🔐 Authentication (`/api/v1/auth`)](#-1-authentication-apiv1auth)
  - [📚 Topics (`/api/v1/topics`)](#-2-topics-apiv1topics)
  - [🧩 Patterns (`/api/v1/patterns`)](#-3-patterns-apiv1patterns)
  - [💡 Problems (`/api/v1/problems`)](#-4-problems-apiv1problems)
  - [📈 User Progress (`/api/v1/progress`)](#-5-user-progress-apiv1progress)
  - [🔄 Revision & Spaced Repetition (`/api/v1/revision`)](#-6-revision--spaced-repetition-apiv1revision)
  - [📝 Personal Notes (`/api/v1/notes`)](#-7-personal-notes-apiv1notes)
  - [📰 Community Articles & Bookmarks (`/api/v1/articles` & `/api/v1/bookmarks`)](#-8-community-articles--bookmarks-apiv1articles--apiv1bookmarks)
  - [💬 Comments & Threaded Discussions (`/api/v1/comments`)](#-9-comments--threaded-discussions-apiv1comments)
  - [🔔 Dashboard & Notifications (`/api/v1/dashboard` & `/api/v1/notifications`)](#-10-dashboard--notifications-apiv1dashboard--apiv1notifications)
  - [🔍 Search (`/api/v1/search`)](#-11-search-apiv1search)
  - [👑 Admin Management Panel (`/api/v1/admin`)](#-12-admin-management-panel-apiv1admin)
- [4. How to Promote a User to Admin](#4-how-to-promote-a-user-to-admin)

---

## 1. Quick Start & Postman Setup

A ready-to-import Postman Collection file is available in the repository root:
📄 [`postman_collection.json`](./postman_collection.json)

### 📥 Importing into Postman
1. Open **Postman**.
2. Click **Import** (top left).
3. Select the file `postman_collection.json` from the repository root.
4. Click **Import**.

### ⚙️ Pre-configured Collection Variables
The collection uses Postman variables for seamless testing:
| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `baseUrl` | `http://localhost:3000/api/v1` | Base URL for backend server |
| `accessToken` | `""` | Bearer token returned after login |
| `refreshToken` | `""` | Refresh token returned after login |

---

## 2. Authentication & Authorization Strategy

- **Protocol**: Standard REST JSON responses over HTTP.
- **Base URL**: `http://localhost:3000/api/v1`
- **Tokens**: JWT Bearer Tokens attached via Header:
  ```http
  Authorization: Bearer <accessToken>
  ```
- **Roles**:
  - `STUDENT`: Access to learning topics, patterns, problem solving, personal notes, revisions, community articles, comments, and bookmarks.
  - `ADMIN`: Access to student features **plus** all `/api/v1/admin/*` management routes (topic/pattern/problem creation, article moderation, user management, and role promotion).

### 🔑 Default Pre-seeded Test Accounts
The database seed script (`npx prisma db seed`) creates the following default credentials:



---

## 3. Complete API Endpoint Reference

---

### 🔐 1. Authentication (`/api/v1/auth`)

All user registration and login operations use standard auth routes.

| Method | Full Endpoint Link | Access | Description / Request Body & Headers |
| :--- | :--- | :--- | :--- |
| `POST` | `http://localhost:3000/api/v1/auth/register` | Public | **Body**: `{"name":"John Doe","email":"john@example.com","password":"Password123!"}` |
| `POST` | `http://localhost:3000/api/v1/auth/login` | Public | **Body**: `{"email":"john@example.com","password":"Password123!"}` |
| `GET` | `http://localhost:3000/api/v1/auth/me` | Auth | **Header**: `Authorization: Bearer <accessToken>` *(Returns current user profile)* |
| `POST` | `http://localhost:3000/api/v1/auth/refresh` | Public | **Body**: `{"refreshToken":"<token>"}` *(Returns new accessToken)* |
| `PATCH` | `http://localhost:3000/api/v1/auth/profile` | Auth | **Header**: `Authorization: Bearer <accessToken>`<br>**Body**: `{"name":"John Updated","bio":"DSA Enthusiast","avatar":"https://..."}` |
| `PATCH` | `http://localhost:3000/api/v1/auth/password` | Auth | **Header**: `Authorization: Bearer <accessToken>`<br>**Body**: `{"currentPassword":"Password123!","newPassword":"NewPassword123!"}` |
| `POST` | `http://localhost:3000/api/v1/auth/logout` | Auth | **Header**: `Authorization: Bearer <accessToken>` |

---

### 📚 2. Topics (`/api/v1/topics`)

| Method | Full Endpoint Link | Access | Description / Query Params |
| :--- | :--- | :--- | :--- |
| `GET` | `http://localhost:3000/api/v1/topics` | Public | List all published topics (e.g., Arrays, Two Pointer, Dynamic Programming) |
| `GET` | `http://localhost:3000/api/v1/topics/:slug` | Public | E.g. `http://localhost:3000/api/v1/topics/array` |
| `GET` | `http://localhost:3000/api/v1/topics/:slug/patterns` | Public | Get all patterns under a specific topic by slug |

---

### 🧩 3. Patterns (`/api/v1/patterns`)

| Method | Full Endpoint Link | Access | Description / Query Params |
| :--- | :--- | :--- | :--- |
| `GET` | `http://localhost:3000/api/v1/patterns` | Public | List patterns.<br>Query params: `?topicSlug=array&difficulty=EASY&page=1&limit=10` |
| `GET` | `http://localhost:3000/api/v1/patterns/:slug` | Public / Auth | Get pattern details including pseudocode, intuition, templates (C++, Java, JS), attached problems, and progress state if Auth token provided. |

---

### 💡 4. Problems (`/api/v1/problems`)

| Method | Full Endpoint Link | Access | Description / Query Params |
| :--- | :--- | :--- | :--- |
| `GET` | `http://localhost:3000/api/v1/problems` | Public | List problems.<br>Query params: `?difficulty=EASY&search=two+sum` |
| `GET` | `http://localhost:3000/api/v1/problems/:id` | Public / Auth | Get problem details by ID |

---

### 📈 5. User Progress (`/api/v1/progress`)

| Method | Full Endpoint Link | Access | Description / Request Body & Headers |
| :--- | :--- | :--- | :--- |
| `GET` | `http://localhost:3000/api/v1/progress` | Student | **Header**: `Authorization: Bearer <accessToken>` *(Overall user progress metrics)* |
| `GET` | `http://localhost:3000/api/v1/progress/patterns` | Student | **Header**: `Authorization: Bearer <accessToken>` *(Pattern completion list)* |
| `GET` | `http://localhost:3000/api/v1/progress/patterns/:id` | Student | **Header**: `Authorization: Bearer <accessToken>` *(Progress for single pattern ID)* |
| `POST` | `http://localhost:3000/api/v1/progress/patterns/:id/start` | Student | **Header**: `Authorization: Bearer <accessToken>` *(Start studying a pattern)* |
| `PATCH` | `http://localhost:3000/api/v1/progress/patterns/:id/status` | Student | **Header**: `Authorization: Bearer <accessToken>`<br>**Body**: `{"status":"COMPLETED"}` (`NOT_STARTED` \| `IN_PROGRESS` \| `COMPLETED` \| `MASTERED`) |
| `POST` | `http://localhost:3000/api/v1/progress/problems/:id/solved` | Student | **Header**: `Authorization: Bearer <accessToken>`<br>**Body**: `{"hintsUsed": 0}` *(Mark problem as solved & recalculate spaced repetition)* |

---

### 🔄 6. Revision & Spaced Repetition (`/api/v1/revision`)

| Method | Full Endpoint Link | Access | Description / Headers |
| :--- | :--- | :--- | :--- |
| `GET` | `http://localhost:3000/api/v1/revision/today` | Student | **Header**: `Authorization: Bearer <accessToken>` *(Get revisions scheduled for today)* |
| `GET` | `http://localhost:3000/api/v1/revision/upcoming` | Student | **Header**: `Authorization: Bearer <accessToken>` *(Get upcoming revisions)* |
| `GET` | `http://localhost:3000/api/v1/revision/history` | Student | **Header**: `Authorization: Bearer <accessToken>` *(Get revision completion history)* |
| `POST` | `http://localhost:3000/api/v1/revision/:id/start` | Student | **Header**: `Authorization: Bearer <accessToken>` *(Start revision session)* |
| `POST` | `http://localhost:3000/api/v1/revision/:id/complete` | Student | **Header**: `Authorization: Bearer <accessToken>` *(Complete revision session & update interval)* |
| `POST` | `http://localhost:3000/api/v1/revision/:id/skip` | Student | **Header**: `Authorization: Bearer <accessToken>` *(Skip revision session)* |

---

### 📝 7. Personal Notes (`/api/v1/notes`)

| Method | Full Endpoint Link | Access | Description / Request Body & Headers |
| :--- | :--- | :--- | :--- |
| `GET` | `http://localhost:3000/api/v1/notes` | Student | **Header**: `Authorization: Bearer <accessToken>`<br>Query param: `?patternId=<id>` |
| `POST` | `http://localhost:3000/api/v1/notes` | Student | **Header**: `Authorization: Bearer <accessToken>`<br>**Body**: `{"content":"My note","patternId":"<patternId>"}` |
| `PATCH` | `http://localhost:3000/api/v1/notes/:id` | Student | **Header**: `Authorization: Bearer <accessToken>`<br>**Body**: `{"content":"Updated note content"}` |
| `DELETE` | `http://localhost:3000/api/v1/notes/:id` | Student | **Header**: `Authorization: Bearer <accessToken>` *(Delete note)* |

---

### 📰 8. Community Articles & Bookmarks (`/api/v1/articles` & `/api/v1/bookmarks`)

| Method | Full Endpoint Link | Access | Description / Request Body & Headers |
| :--- | :--- | :--- | :--- |
| `GET` | `http://localhost:3000/api/v1/articles` | Public | Query params: `?category=DSA&page=1&limit=10` |
| `GET` | `http://localhost:3000/api/v1/articles/trending` | Public | Get top trending community articles |
| `GET` | `http://localhost:3000/api/v1/articles/:id` | Public | Get article details |
| `PATCH` | `http://localhost:3000/api/v1/articles/:id` | Author/Admin | **Header**: `Authorization: Bearer <accessToken>`<br>**Body**: `{"title":"Updated Title","content":"Updated content..."}` |
| `DELETE` | `http://localhost:3000/api/v1/articles/:id` | Author/Admin | **Header**: `Authorization: Bearer <accessToken>` *(Delete article)* |
| `POST` | `http://localhost:3000/api/v1/articles/:id/submit` | Student | **Header**: `Authorization: Bearer <accessToken>` *(Submit draft article for moderation)* |
| `POST` | `http://localhost:3000/api/v1/articles/:id/like` | Student | **Header**: `Authorization: Bearer <accessToken>` *(Like article)* |
| `DELETE` | `http://localhost:3000/api/v1/articles/:id/like` | Student | **Header**: `Authorization: Bearer <accessToken>` *(Unlike article)* |
| `POST` | `http://localhost:3000/api/v1/articles/:id/bookmark` | Student | **Header**: `Authorization: Bearer <accessToken>` *(Bookmark article)* |
| `DELETE` | `http://localhost:3000/api/v1/articles/:id/bookmark` | Student | **Header**: `Authorization: Bearer <accessToken>` *(Remove bookmark)* |
| `GET` | `http://localhost:3000/api/v1/bookmarks/articles` | Student | **Header**: `Authorization: Bearer <accessToken>` *(List user bookmarked articles)* |

---

### 💬 9. Comments & Threaded Discussions (`/api/v1/comments`)

| Method | Full Endpoint Link | Access | Description / Request Body & Headers |
| :--- | :--- | :--- | :--- |
| `GET` | `http://localhost:3000/api/v1/articles/:id/comments` | Public | Fetch threaded comments for an article |
| `POST` | `http://localhost:3000/api/v1/articles/:id/comments` | Student | **Header**: `Authorization: Bearer <accessToken>`<br>**Body**: `{"content":"Great article!"}` |
| `PATCH` | `http://localhost:3000/api/v1/comments/:id` | Author/Admin | **Header**: `Authorization: Bearer <accessToken>`<br>**Body**: `{"content":"Updated comment text"}` |
| `DELETE` | `http://localhost:3000/api/v1/comments/:id` | Author/Admin | **Header**: `Authorization: Bearer <accessToken>` *(Delete comment)* |
| `POST` | `http://localhost:3000/api/v1/comments/:id/replies` | Student | **Header**: `Authorization: Bearer <accessToken>`<br>**Body**: `{"content":"Reply text"}` |
| `DELETE` | `http://localhost:3000/api/v1/comments/:id/replies/:replyId` | Author/Admin | **Header**: `Authorization: Bearer <accessToken>` *(Delete nested reply)* |

---

### 🔔 10. Dashboard & Notifications (`/api/v1/dashboard` & `/api/v1/notifications`)

| Method | Full Endpoint Link | Access | Description / Headers |
| :--- | :--- | :--- | :--- |
| `GET` | `http://localhost:3000/api/v1/dashboard` | Student | **Header**: `Authorization: Bearer <accessToken>` *(Get user dashboard stats)* |
| `GET` | `http://localhost:3000/api/v1/notifications` | Student | **Header**: `Authorization: Bearer <accessToken>` *(List user notifications)* |
| `PATCH` | `http://localhost:3000/api/v1/notifications/read-all` | Student | **Header**: `Authorization: Bearer <accessToken>` *(Mark all as read)* |
| `PATCH` | `http://localhost:3000/api/v1/notifications/:id/read` | Student | **Header**: `Authorization: Bearer <accessToken>` *(Mark single notification read)* |

---

### 🔍 11. Search (`/api/v1/search`)

| Method | Full Endpoint Link | Access | Description / Query Params |
| :--- | :--- | :--- | :--- |
| `GET` | `http://localhost:3000/api/v1/search` | Public | Global search query across topics, patterns, and problems.<br>Query: `?q=two+pointers` |

---

### 👑 12. Admin Management Panel (`/api/v1/admin`)

> **Note**: All endpoints under `/api/v1/admin/*` require `Authorization: Bearer <accessToken>` of an account with `role: "ADMIN"`.

#### 📊 Dashboard & Analytics
| Method | Full Endpoint Link | Access | Description / Request Body & Headers |
| :--- | :--- | :--- | :--- |
| `GET` | `http://localhost:3000/api/v1/admin/dashboard` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>` *(Platform stats summary)* |
| `GET` | `http://localhost:3000/api/v1/admin/analytics/overview` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>` *(Platform analytics overview)* |

#### 👥 User Management & Role Promotion
| Method | Full Endpoint Link | Access | Description / Request Body & Headers |
| :--- | :--- | :--- | :--- |
| `GET` | `http://localhost:3000/api/v1/admin/users` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>` *(List all registered users)* |
| `GET` | `http://localhost:3000/api/v1/admin/users/:id` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>` *(Get user details by ID)* |
| `PATCH` | `http://localhost:3000/api/v1/admin/users/:id/activate` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>` *(Activate user account)* |
| `PATCH` | `http://localhost:3000/api/v1/admin/users/:id/deactivate` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>` *(Deactivate user account)* |
| `PATCH` | `http://localhost:3000/api/v1/admin/users/:id/role` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>`<br>**Body**: `{"role": "ADMIN"}` *(Promote / Demote user role)* |

#### 📚 Topic Management
| Method | Full Endpoint Link | Access | Description / Request Body & Headers |
| :--- | :--- | :--- | :--- |
| `GET` | `http://localhost:3000/api/v1/admin/topics` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>` *(List all topics)* |
| `POST` | `http://localhost:3000/api/v1/admin/topics` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>`<br>**Body**: `{"name":"Dynamic Programming","description":"Master DP","icon":"dp-icon","order":1,"published":true}` |
| `GET` | `http://localhost:3000/api/v1/admin/topics/:id` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>` *(Get topic details)* |
| `PATCH` | `http://localhost:3000/api/v1/admin/topics/:id` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>`<br>**Body**: `{"name":"Updated Topic Name"}` |
| `DELETE` | `http://localhost:3000/api/v1/admin/topics/:id` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>` *(Delete topic)* |
| `PATCH` | `http://localhost:3000/api/v1/admin/topics/:id/publish` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>` *(Publish topic)* |
| `PATCH` | `http://localhost:3000/api/v1/admin/topics/reorder` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>`<br>**Body**: `{"items":[{"id":"topic_id_1","order":1}]}` |

#### 🧩 Pattern Management
| Method | Full Endpoint Link | Access | Description / Request Body & Headers |
| :--- | :--- | :--- | :--- |
| `GET` | `http://localhost:3000/api/v1/admin/patterns` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>` *(List all patterns)* |
| `POST` | `http://localhost:3000/api/v1/admin/patterns` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>`<br>**Body**: `{"topicId":"...","number":1,"name":"Two Pointers","shortDescription":"...","difficulty":"EASY","importance":5,"timeComplexity":"O(N)","spaceComplexity":"O(1)","pseudocode":"...","cppTemplate":"...","javaTemplate":"...","jsTemplate":"..."}` |
| `GET` | `http://localhost:3000/api/v1/admin/patterns/:id` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>` *(Get pattern details)* |
| `PATCH` | `http://localhost:3000/api/v1/admin/patterns/:id` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>`<br>**Body**: `{"name":"Updated Pattern Name"}` |
| `DELETE` | `http://localhost:3000/api/v1/admin/patterns/:id` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>` *(Delete pattern)* |
| `PATCH` | `http://localhost:3000/api/v1/admin/patterns/:id/publish` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>` *(Publish pattern)* |
| `PATCH` | `http://localhost:3000/api/v1/admin/patterns/:id/archive` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>` *(Archive pattern)* |
| `POST` | `http://localhost:3000/api/v1/admin/patterns/:id/duplicate` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>` *(Duplicate pattern)* |
| `PATCH` | `http://localhost:3000/api/v1/admin/patterns/reorder` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>`<br>**Body**: `{"items":[{"id":"pattern_id_1","order":1}]}` |
| `POST` | `http://localhost:3000/api/v1/admin/patterns/:id/problems` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>`<br>**Body**: `{"problemId":"...","isCore":true,"order":1}` |
| `DELETE` | `http://localhost:3000/api/v1/admin/patterns/:id/problems/:problemId` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>` *(Unlink problem from pattern)* |
| `PATCH` | `http://localhost:3000/api/v1/admin/patterns/:id/problems/reorder` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>`<br>**Body**: `{"items":[{"problemId":"...","order":1}]}` |

#### 💡 Problem Management
| Method | Full Endpoint Link | Access | Description / Request Body & Headers |
| :--- | :--- | :--- | :--- |
| `GET` | `http://localhost:3000/api/v1/admin/problems` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>` *(List all problems)* |
| `POST` | `http://localhost:3000/api/v1/admin/problems` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>`<br>**Body**: `{"title":"Two Sum","platform":"LeetCode","externalId":"1","solveUrl":"https://leetcode.com/problems/two-sum","difficulty":"EASY"}` |
| `GET` | `http://localhost:3000/api/v1/admin/problems/:id` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>` *(Get problem details)* |
| `PATCH` | `http://localhost:3000/api/v1/admin/problems/:id` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>`<br>**Body**: `{"title":"Two Sum (Updated)"}` |
| `DELETE` | `http://localhost:3000/api/v1/admin/problems/:id` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>` *(Delete problem)* |

#### 📰 Article Moderation
| Method | Full Endpoint Link | Access | Description / Request Body & Headers |
| :--- | :--- | :--- | :--- |
| `GET` | `http://localhost:3000/api/v1/admin/articles` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>` *(List all community articles)* |
| `GET` | `http://localhost:3000/api/v1/admin/articles/submissions` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>` *(Pending student submitted articles)* |
| `GET` | `http://localhost:3000/api/v1/admin/articles/:id` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>` *(Get article details)* |
| `PATCH` | `http://localhost:3000/api/v1/admin/articles/:id` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>`<br>**Body**: `{"title":"Admin Updated Title"}` |
| `DELETE` | `http://localhost:3000/api/v1/admin/articles/:id` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>` *(Delete article)* |
| `PATCH` | `http://localhost:3000/api/v1/admin/articles/:id/publish` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>` *(Approve & publish article)* |
| `PATCH` | `http://localhost:3000/api/v1/admin/articles/:id/reject` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>`<br>**Body**: `{"reason":"Content does not meet quality guidelines"}` |
| `PATCH` | `http://localhost:3000/api/v1/admin/articles/:id/request-changes` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>`<br>**Body**: `{"reason":"Please add code examples in Java"}` |
| `PATCH` | `http://localhost:3000/api/v1/admin/articles/:id/archive` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>` *(Archive article)* |

#### 💬 Comment Moderation
| Method | Full Endpoint Link | Access | Description / Request Body & Headers |
| :--- | :--- | :--- | :--- |
| `GET` | `http://localhost:3000/api/v1/admin/comments` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>` *(List all comments across platform)* |
| `DELETE` | `http://localhost:3000/api/v1/admin/comments/:id` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>` *(Delete / remove comment)* |
| `POST` | `http://localhost:3000/api/v1/admin/comments/:id/reply` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>`<br>**Body**: `{"content":"Official admin response"}` |
| `PATCH` | `http://localhost:3000/api/v1/admin/comments/:id/pin` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>` *(Pin comment to top)* |
| `PATCH` | `http://localhost:3000/api/v1/admin/comments/:id/hide` | Admin Auth | **Header**: `Authorization: Bearer <accessToken>` *(Hide comment)* |

---

## 4. How to Promote a User to Admin

### Option 1: Via Admin API Endpoint (In Postman)
Send a request as an existing Admin to promote any user account:
- **Method**: `PATCH`
- **Link**: `http://localhost:3000/api/v1/admin/users/:id/role`
- **Header**: `Authorization: Bearer <adminAccessToken>`
- **Body**:
  ```json
  {
    "role": "ADMIN"
  }
  ```

### Option 2: Via Prisma Studio (Visual Database GUI)
Run the following command in your terminal:
```bash
npx prisma studio
```
1. Open the **User** table.
2. Locate the user by email or name.
3. Double-click the `role` field and change `STUDENT` to `ADMIN`.
4. Click **Save 1 change**.
