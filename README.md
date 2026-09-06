# 🧠 PatternIQ — DSA Pattern Learning Platform

---

## 1. Describe

**PatternIQ** is an enterprise-grade Data Structures & Algorithms (DSA) learning platform and technical knowledge system. Instead of blindly solving 500+ individual LeetCode problems, PatternIQ groups coding challenges into **Core Mental Models & Algorithmic Patterns** (*Two Pointers, Sliding Window, Fast & Slow Pointers, Digit Extraction, Binary Search, Tree BFS/DFS, Dynamic Programming*).

Students master problem-solving through **Intuition Signals**, **Execution Recipes**, **Multi-Language Code Blueprints** (JS, Python, Java, C++), and an **Automated Spaced Repetition Engine** that prevents memory decay.

---

## 2. Key Features

- 🎯 **Pattern-Based Curriculum**: Organized hierarchically into **Topics ➔ Patterns ➔ Canonical Benchmark Problems**.
- 💡 **Mental Model & Rule Engine**: Rich pattern guides with formatted intuition callouts (`> Note`), execution recipes, and constraint warnings.
- 🧩 **Curated Problem Catalog**: Dynamic catalog with difficulty filters (*Easy, Medium, Hard*), status filters (*Solved, Unsolved, Starred*), and real-time user progress tracking.
- ⏱️ **Automated Spaced Repetition Engine**: Calculates optimal review dates (1d, 3d, 7d, 14d, 30d) for solved problems to guarantee long-term interview readiness.
- 🔗 **Seamless Catalog Deep-Linking**: Benchmark problems inside pattern guides link directly to `/problems?pattern=...&problem=...`, auto-expanding topic accordions and scrolling directly to highlighted problem cards.
- ⚡ **Admin CMS Dashboard**: Comprehensive administrative interface for CRUD operations on topics, patterns, problem URLs (auto-normalized to `https://`), and platform analytics.
- 📚 **Community Articles & Knowledge Sharing**: Technical blog platform supporting categories (*System Design, Core CS, Database, DevOps, GenAI*), likes, bookmarks, and moderated threaded comments.

---

## 3. Detailed System Design & Data Flow Diagrams

### 3.1 High-Level System Architecture Diagram
```mermaid
graph TD
    subgraph Clients ["👥 User Interfaces"]
        StudentUI["🎓 Student Portal (/dashboard, /patterns, /problems, /revision)"]
        AdminUI["⚡ Admin CMS (/admin)"]
        MobileWeb["📱 Responsive Mobile Client"]
    end

    subgraph Gateway ["🛡️ Security & API Gateway Layer"]
        Middleware["🔒 Auth & Role Middleware (Next.js Edge)"]
        ZodValidator["✅ Zod Request Payload Validator"]
        JWTHelper["🔑 JWT Engine (HttpOnly Cookies & Bearer Tokens)"]
    end

    subgraph Application ["⚙️ Core Serverless Application Services"]
        PatternSvc["🧠 Pattern & Curriculum Service"]
        ProblemSvc["🧩 Problem & Catalog Service"]
        ProgressSvc["📈 Progress & Mastery Calculation Engine"]
        RevisionSvc["⏱️ Spaced Repetition Queue Engine"]
        ArticleSvc["📚 Community Knowledge Service"]
    end

    subgraph Persistence ["🗄️ Database & Security Layer"]
        PrismaORM["💎 Prisma ORM 5 (Type-Safe Query Builder)"]
        PostgreSQL[("🐘 PostgreSQL Relational Database")]
    end

    StudentUI --> Middleware
    AdminUI --> Middleware
    MobileWeb --> Middleware

    Middleware --> JWTHelper
    Middleware --> ZodValidator
    ZodValidator --> Application

    PatternSvc --> PrismaORM
    ProblemSvc --> PrismaORM
    ProgressSvc --> PrismaORM
    RevisionSvc --> PrismaORM
    ArticleSvc --> PrismaORM

    PrismaORM --> PostgreSQL
```

---

### 3.2 User Roles & Permission Flow Diagram
```mermaid
graph LR
    subgraph Users ["Users"]
        Student["🎓 Student Role"]
        Admin["⚡ Admin Role"]
    end

    subgraph StudentAccess ["Student Features"]
        S1["📖 Study Patterns & Mental Models"]
        S2["🧩 Track & Solve Practice Problems"]
        S3["⏱️ Spaced Repetition Review Queue"]
        S4["📝 Personal Study Notes"]
        S5["✍️ Write & Publish Articles"]
    end

    subgraph AdminAccess ["Admin Features"]
        A1["🗂️ CRUD Topics & Core Patterns"]
        A2["🔗 Link Canonical Benchmark Problems"]
        A3["📊 Analytics & Platform Overview"]
        A4["🛡️ Moderation & Content Management"]
    end

    Student --> S1
    Student --> S2
    Student --> S3
    Student --> S4
    Student --> S5

    Admin --> S1
    Admin --> S2
    Admin --> A1
    Admin --> A2
    Admin --> A3
    Admin --> A4
```

---

### 3.3 Authentication & Session Sequence Diagram
```mermaid
sequenceDiagram
    autonumber
    actor Client as Browser Client
    participant API as Auth API (/api/v1/auth/login)
    participant Auth as Auth Middleware & Zod
    participant DB as PostgreSQL (Prisma)
    participant Token as JWT Engine

    Client->>API: POST /api/v1/auth/login { email, password }
    API->>Auth: Validate Request Body (Zod)
    Auth-->>API: Validated Schema Payload
    API->>DB: Query User Record by Email
    DB-->>API: User Record + bcrypt Password Hash
    API->>API: Verify Password (bcrypt.compare)
    API->>Token: Generate Auth JWT (userId, role)
    Token-->>API: Signed Encrypted Token
    API-->>Client: Set HttpOnly Cookie (token) + Return User JSON Response
```

---

### 3.4 Problem Progress & Mastery Calculation Sequence Diagram
```mermaid
sequenceDiagram
    autonumber
    actor Student as Student
    participant UI as Pattern / Problems UI
    participant API as Progress API (/api/v1/progress/problems/toggle)
    participant Engine as Mastery Engine
    participant DB as PostgreSQL (Prisma)

    Student->>UI: Click "Mark Solved" on Problem
    UI->>API: POST /api/v1/progress/problems/toggle { problemId, status: "SOLVED" }
    API->>DB: Upsert UserProblemProgress (status: SOLVED, solvedAt: NOW)
    API->>Engine: Recalculate Pattern Mastery & Completion Rate
    Engine->>DB: Query Total Problems vs Solved Problems for Pattern
    
    alt All Problems in Pattern Solved
        Engine->>DB: Update UserPatternProgress (status: MASTERED)
        Engine->>DB: Schedule Initial Revision (scheduledAt: NOW + 3 Days)
    else Partially Solved
        Engine->>DB: Update UserPatternProgress (status: IN_PROGRESS)
    end

    API-->>UI: Return Updated Progress State
    UI-->>Student: Update UI Badges, Checkmarks & Progress Bar
```

---

### 3.5 Spaced Repetition Queue Sequence Diagram
```mermaid
sequenceDiagram
    autonumber
    actor Student as Student
    participant RevUI as Revision Page (/revision)
    participant RevAPI as Revision API (/api/v1/revision)
    participant DB as PostgreSQL (Prisma)

    Student->>RevUI: Open Revision Queue Page
    RevUI->>RevAPI: GET /api/v1/revision (Fetch Due Reviews)
    RevAPI->>DB: Query Revisions WHERE scheduledAt <= NOW AND status = PENDING
    DB-->>RevAPI: List of Due Revision Items
    RevAPI-->>RevUI: Render Overdue & Due Review Cards
    
    Student->>RevUI: Complete Review Session
    RevUI->>RevAPI: POST /api/v1/revision/complete { revisionId, score }
    RevAPI->>DB: Update Revision (status: COMPLETED, completedAt: NOW)
    RevAPI->>DB: Insert Next Interval Revision (scheduledAt: NOW + NextInterval)
    RevAPI-->>RevUI: Update Queue UI State
```

---

### 3.6 Catalog Deep-Linking & Auto-Scroll Sequence Diagram
```mermaid
sequenceDiagram
    autonumber
    actor Student as Student
    participant PatternUI as Pattern Detail Page (/patterns/digit-extraction)
    participant CatalogUI as Problems Catalog Page (/problems)
    participant DOM as Browser DOM Element

    Student->>PatternUI: Click Problem Title ("Reverse Integer")
    PatternUI->>CatalogUI: Navigate to /problems?pattern=digit-extraction&problem=cm...
    CatalogUI->>CatalogUI: Parse URL Query Parameters (pattern & problem)
    CatalogUI->>CatalogUI: Auto-expand Topic & Pattern Accordions
    CatalogUI->>DOM: scrollIntoView({ behavior: "smooth", block: "center" })
    CatalogUI->>DOM: Apply Primary Glow Highlight Ring (3.5 seconds)
    DOM-->>Student: Targeted Problem Card smooth-scrolled & visually highlighted
```

---

### 3.7 Admin Content Authoring Lifecycle Diagram
```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin User
    participant AdminUI as Admin Dashboard (/admin)
    participant AdminAPI as Admin API Routes (/api/v1/admin/*)
    participant DB as PostgreSQL (Prisma)

    Admin->>AdminUI: Create Pattern (Mental Models, Pseudocode, Code Templates)
    AdminUI->>AdminAPI: POST /api/v1/admin/patterns
    AdminAPI->>DB: Insert Pattern Record

    Admin->>AdminUI: Add Benchmark Problem & Solve URL
    AdminUI->>AdminAPI: POST /api/v1/admin/problems
    AdminAPI->>AdminAPI: Auto-normalize URL (prepend https:// if missing)
    AdminAPI->>DB: Insert Problem Record

    Admin->>AdminUI: Link Problem to Pattern
    AdminUI->>AdminAPI: POST /api/v1/admin/patterns/{id}/problems
    AdminAPI->>DB: Create PatternProblem Junction Record

    AdminAPI-->>AdminUI: Content Published & Live for Students
```

---

### 3.8 Database Entity Relationship Diagram (ERD)
```mermaid
erDiagram
    User ||--o{ UserPatternProgress : tracks
    User ||--o{ UserProblemProgress : tracks
    User ||--o{ Note : creates
    User ||--o{ Revision : scheduled_for
    User ||--o{ Article : authors
    User ||--o{ ArticleComment : posts

    Topic ||--|{ Pattern : contains
    Pattern ||--|{ PatternProblem : links
    Problem ||--|{ PatternProblem : linked_by
    Pattern ||--o{ UserPatternProgress : tracked_in
    Problem ||--o{ UserProblemProgress : tracked_in
    Pattern ||--o{ Revision : revised_in

    Article ||--o{ ArticleComment : receives
    Article ||--o{ ArticleLike : receives
    Article ||--o{ ArticleBookmark : receives

    User {
        string id PK
        string email UK
        string passwordHash
        Role role "STUDENT | ADMIN"
        string name
        boolean isActive
    }

    Topic {
        string id PK
        string name UK
        string slug UK
        int order
    }

    Pattern {
        string id PK
        int number
        string name
        string slug UK
        string intuition
        string executionRecipe
        string pseudocode
        Difficulty difficulty "EASY | MEDIUM | HARD"
        string topicId FK
    }

    Problem {
        string id PK
        string title
        string slug UK
        string platform "LeetCode | HackerRank | Codeforces"
        string solveUrl
        Difficulty difficulty "EASY | MEDIUM | HARD"
    }

    PatternProblem {
        string id PK
        string patternId FK
        string problemId FK
        int order
        boolean isCore
    }

    UserProblemProgress {
        string id PK
        string userId FK
        string problemId FK
        ProblemStatus status "NOT_ATTEMPTED | ATTEMPTED | SOLVED"
        datetime solvedAt
    }

    UserPatternProgress {
        string id PK
        string userId FK
        string patternId FK
        PatternStatus status "NOT_STARTED | IN_PROGRESS | COMPLETED | MASTERED"
        datetime lastRevisedAt
        datetime nextRevisionAt
    }

    Revision {
        string id PK
        string userId FK
        string patternId FK
        datetime scheduledAt
        RevisionStatus status "PENDING | COMPLETED | SKIPPED"
    }
```

---

## 4. Tech Stack All

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 14 (App Router)** | React 18, Server Components, Client Components, Suspense |
| **Programming Language** | **TypeScript 5** | Strict Type Checking, Explicit Interfaces, Type Safety |
| **Styling & Theme** | **Tailwind CSS + shadcn/ui** | Theme System (`b3F4GrJpa6`), Glassmorphism, CSS Variables |
| **Icons System** | **Lucide React** | Scalable Clean Vector Icons |
| **Backend Framework** | **Next.js Serverless Route Handlers** | RESTful JSON API Architecture (`/api/v1/...`) |
| **Database ORM** | **Prisma ORM 5** | Schema Migrations, Type-Safe Queries, Seed Scripts |
| **Database Engine** | **PostgreSQL** | Relational Database with Foreign Keys & Indexes |
| **Data Validation** | **Zod 3** | Input Request Payload & Query Parameter Validation |
| **Authentication** | **JWT (jsonwebtoken) + bcryptjs** | HttpOnly Session Cookies, Bearer Tokens, Password Hashing |
| **Execution Tooling** | **tsx** | TypeScript Execution for Database Seeding & Cleanups |

---

## 5. Local Setup & Running Guide

### 5.1 Environment Configuration (`.env`)
Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/patterniq_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-patterniq-2026"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
```

### 5.2 Commands

```bash
# 1. Install project dependencies
npm install

# 2. Generate Prisma Client
npm run prisma:generate

# 3. Run Database Migrations
npm run prisma:migrate

# 4. Seed Database with Initial Topics, Patterns & Problems
npm run prisma:seed

# 5. Start Development Server
npm run dev
```

### 5.3 Default Credentials

| Account Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@patterniq.com` | `Admin@123456` | Admin CMS, Content CRUD, Platform Analytics |
| **Student User** | `student@patterniq.com` | `Student@123456` | Student Dashboard, Solved Tracking, Spaced Repetition Queue |
