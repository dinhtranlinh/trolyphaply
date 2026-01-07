# TRỢ LÝ PHÁP LÝ - IMPLEMENTATION ROADMAP

> **Project**: TroLyPhapLy (Legal Assistant & Q&A Platform)  
> **Start Date**: December 2025  
> **Current Status**: SESSION 7 - API Optimization Completed  
> **Last Updated**: December 23, 2025

---

## 📋 TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Architecture Summary](#2-architecture-summary)
3. [Environment Setup](#3-environment-setup)
4. [Database Setup](#4-database-setup)
5. [Security & API Keys](#5-security--api-keys)
6. [Development Sessions](#6-development-sessions)
7. [Known Issues & Solutions](#7-known-issues--solutions)
8. [Next Steps](#8-next-steps)

---

## 1. PROJECT OVERVIEW

### 1.1. Project Context

**TroLyPhapLy** là một nền tảng web mobile-first cung cấp:

- **Legal Q&A**: Hỏi đáp về pháp luật và thủ tục hành chính với AI (Gemini)
- **Legal Library**: Thư viện văn bản pháp luật, án lệ, hướng dẫn thực hiện thủ tục hành chính
- **Prompt Hub**: Quản lý và chia sẻ prompts AI hữu ích
- **Fun AI Apps**: 20-30+ mini-apps tạo nội dung viral (tử vi, lời chúc, thơ...)

### 1.2. Related Projects

**FacebookApp** (Existing):

- **Location**: `D:\DTL\FacebookApp\`
- **Purpose**: Tử vi & horoscope social sharing apps
- **Status**: Production-ready, fully functional
- **Port**: 8686
- **Domain**: tuvi.trolyphaply.vn

**TroLyPhapLy** (Current):

- **Location**: `D:\DTL\trolyphaply\`
- **Purpose**: Legal assistant + Q&A + fun apps
- **Status**: **SESSION 7 completed - API optimization**
- **Dev Port**: 3456
- **Prod Port**: 8686
- **Domain**: trolyphaply.vn

---

## 2. ARCHITECTURE SUMMARY

### 2.1. Tech Stack

| Layer               | Technology                 | Version |
| ------------------- | -------------------------- | ------- |
| **Framework**       | Next.js (App Router)       | 16.0.6  |
| **Language**        | TypeScript                 | 5.x     |
| **UI Library**      | React                      | 19      |
| **Styling**         | Tailwind CSS               | Latest  |
| **ORM**             | Prisma                     | 7       |
| **Database**        | PostgreSQL (Supabase)      | Latest  |
| **Storage**         | Supabase Storage           | -       |
| **AI**              | Google Gemini 2.5 Flash    | Latest  |
| **Auth**            | bcryptjs + session cookies | -       |
| **Process Manager** | PM2                        | Latest  |

### 2.2. Database Schema

```prisma
// 8 Models Total

// Authentication
model AdminUser {
  id         String   @id @default(cuid())
  email      String   @unique
  password   String
  name       String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

// Legal Content
model LegalDocument {
  id          String   @id @default(cuid())
  title       String
  docType     String   // law, decree, circular, decision
  number      String
  issuedDate  DateTime
  effectDate  DateTime
  status      String   @default("active")
  summary     String?
  fullText    String
  chapters    Json?
  tags        String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Procedure {
  id          String   @id @default(cuid())
  title       String
  category    String
  steps       Json
  documents   Json?
  fees        String?
  timeframe   String?
  agency      String
  legalBasis  String?
  tags        String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// AI Content
model Prompt {
  id          String   @id @default(cuid())
  title       String
  category    String
  description String?
  content     String
  tags        String[]
  usageCount  Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model App {
  id            String   @id @default(cuid())
  slug          String   @unique
  name          String
  category      String
  description   String
  inputSchema   Json
  outputFormat  String   @default("markdown")
  systemPrompt  String
  examplePrompts Json?
  creatorCode   String?
  status        String   @default("active")
  usageCount    Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Result {
  id        String   @id @default(cuid())
  appId     String
  appSlug   String
  input     Json
  output    String
  createdAt DateTime @default(now())

  @@index([appId])
  @@index([createdAt])
}

// Analytics
model AppStatDaily {
  id        String   @id @default(cuid())
  appId     String
  date      DateTime
  views     Int      @default(0)
  generates Int      @default(0)
  shares    Int      @default(0)

  @@unique([appId, date])
}

model AppEvent {
  id        String   @id @default(cuid())
  appId     String
  eventType String
  metadata  Json?
  createdAt DateTime @default(now())

  @@index([appId, eventType])
  @@index([createdAt])
}
```

---

## 3. ENVIRONMENT SETUP

### 3.1. Development

```bash
# Port: 3456
npm run dev

# Or with PM2
pm2 start ecosystem.config.js --only trolyphaply-dev
```

**URL**: http://localhost:3456

### 3.2. Production

```bash
# Port: 8686 (shared with FacebookApp domain)
npm run build:prod
npm run start:prod

# Or with PM2 (recommended)
pm2 start ecosystem.config.js --only trolyphaply-prod
pm2 save
pm2 startup
```

**URL**: https://trolyphaply.vn

### 3.3. Environment Variables

See `.env.example` for required variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://icqivkassoxfaukqbzyt.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY=<REDACTED>
DATABASE_URL="postgresql://..."

# Google Gemini AI (5 keys for load balancing)
GEMINI_API_KEY=<REDACTED>
GEMINI_API_KEY_1=<REDACTED>
GEMINI_API_KEY_2=<REDACTED>
GEMINI_API_KEY_3=<REDACTED>
GEMINI_API_KEY_4=<REDACTED>

# Admin
ADMIN_SESSION_SECRET="your_random_secret"

# App Config
PORT=3456
NODE_ENV=development
```

---

## 4. DATABASE SETUP

### 4.1. Supabase Connection

**Project ID**: icqivkassoxfaukqbzyt  
**Region**: Southeast Asia  
**URL**: https://icqivkassoxfaukqbzyt.supabase.co

### 4.2. Schema Installation

**Option 1: Supabase SQL Editor (Recommended)**

1. Go to https://supabase.com/dashboard/project/icqivkassoxfaukqbzyt
2. Click **SQL Editor** → **New Query**
3. Copy content from `prisma/schema.sql`
4. Paste and click **Run**

**Option 2: Prisma CLI**

```bash
npx prisma db push
npx prisma generate
```

### 4.3. Seed Data

```bash
npm run seed
# Or: node prisma/seed.ts
```

**Includes**:

- Admin user: admin@trolyphaply.vn / TroLy@PhapLy2026
- 4 legal documents
- 4 procedures
- 4 prompts
- 2 apps (migrated from FacebookApp)

---

## 5. SECURITY & API KEYS

### 5.1. API Key Protection

**⚠️ CRITICAL**: Never commit `.env` to git!

**Protection Layers**:

1. **.gitignore** - Blocks .env files
2. **Pre-commit hook** - Scans for API key patterns
3. **GitHub Secret Scanning** - Auto-detects leaked keys

### 5.2. Pre-commit Hook Setup

Create `.git/hooks/pre-commit`:

```bash
#!/bin/sh
# Prevent committing .env files
if git diff --cached --name-only | grep -E "\.env$|\.env\..*"; then
    echo "❌ ERROR: Attempting to commit .env file!"
    exit 1
fi

# Detect Google API key patterns
if git diff --cached | grep -E "AIzaSy[A-Za-z0-9_-]{33}"; then
    echo "❌ ERROR: Detected Google API key in staged files!"
    exit 1
fi

exit 0
```

Make executable:

```bash
chmod +x .git/hooks/pre-commit
```

### 5.3. API Key Rotation Strategy

**Gemini API**: 5 keys with intelligent rotation

- Keys 1-3: Primary pool for Answer generation (main Q&A)
- Keys 4-5: Dedicated pool for ShareText generation
- Circuit breaker: Auto-skip unhealthy keys (429 errors)
- Cooldown: 60s after 3 consecutive failures

---

## 6. DEVELOPMENT SESSIONS

### SESSION 0: Database Setup ✅

- PostgreSQL schema created (8 tables)
- Prisma ORM configured
- Connection verified

### SESSION 1: Seed Data ✅

- Admin account seeded
- Legal content seeded
- Apps migrated from FacebookApp

### SESSION 2: Design System ✅

- Tailwind theme (navy #0B3B70 + gold #E5A100)
- 25 reusable components created

### SESSION 3: Home + Law Pages ✅

- Q&A Hub with Gemini integration
- Legal Library with search/filters
- Document detail pages

### SESSION 4: Prompts + Apps ✅

- Prompts Hub CRUD
- Fun AI Apps catalog
- Dynamic form rendering

### SESSION 5: Admin Dashboard ✅

- Admin authentication
- Statistics dashboard
- Content management (CRUD for all models)

### SESSION 6: PWA Setup ✅

- Service worker with offline caching
- Manifest.json with icons
- SEO optimization

### SESSION 7: API Optimization ✅ (December 22-23, 2025)

**Problem**: API quota exhaustion (400 calls/10 questions)

**Solution Phases**:

#### Phase 1-3: Remove Redundant Layers

- ✅ Removed OpenAI fallback (single model: gemini-2.5-flash)
- ✅ Removed quality retry loop
- ✅ Implemented circuit breaker (60s cooldown, 3 failures threshold)
- **Result**: 400 → 16 calls (-96%)

#### Phase 4-5: Smart Caching

- ✅ In-memory cache with 24h TTL
- ✅ ShareText timeout + smart local fallback (3s AI → local extract)
- **Result**: 16 → 12-14 calls (additional -25%)

#### Phase 6: Answer Length Control

- ✅ Reduced maxOutputTokens: 4096 → 2400 (~900 words)
- ✅ Added prompt constraints: "≤800 từ, không trích nguyên văn điều luật"
- ✅ Answer validator: Check 4 sections (I→II→III→IV) + word count ≤900
- ✅ Reprompt logic: If invalid → AI summarizes with strict requirements
- **Result**: Answers now 600-900 words instead of 7000+ chars

#### Phase 7: ShareText Improvements

- ✅ Increased AI timeout: 3s → 5s
- ✅ Separate key pool: Keys 4-5 dedicated for ShareText (reduce contention)
- ✅ Improved fallback logic:
  - Vietnamese text normalization (remove diacritics for keyword matching)
  - YES/NO questions: Extract from Section II + IV with smart bullet detection
  - Procedure questions: Extract 3 steps from Section III with priority ranking
  - Shorten bullets to <70 chars (cut at natural breaks)
  - Auto-detect icon: "không cần"/"được miễn" → ✅ | else → ⚠️
- ✅ Adjusted length threshold: 150 → 140 words
- **Result**: ShareText now 2-3 short bullets instead of 1 generic line

**Final Metrics**:

- **API calls**: 400 → 12-16 (-96% to -97.3%)
- **Answer quality**: ✅ 4 sections, 600-900 words, no verbatim legal text
- **ShareText quality**: ✅ 2-3 short bullets (<70 chars each), correct icon

---

## 7. KNOWN ISSUES & SOLUTIONS

### Issue 1: Answer Too Long (7000+ chars)

**Root Cause**: maxOutputTokens too high (4096), no length validator

**Solution** (SESSION 7):

```typescript
// app/api/qa/route.ts
maxOutputTokens: 2400; // Reduced from 4096
temperature: 0.2;

// Validator
const wordCount = answer.split(/\s+/).length;
if (wordCount > 900 || !hasAllSections) {
  // Reprompt with strict requirements
}
```

### Issue 2: ShareText Copies Entire Answer

**Root Cause**: AI timeout (3s), fallback extracts wrong content

**Solution** (SESSION 7):

```typescript
// Increase timeout
callAIWithTimeout(prompt, options, 5000); // 3s → 5s

// Use dedicated key pool
callGeminiTextForShareText(); // Keys 4-5 only

// Improved fallback
function generateSmartLocalShareText() {
  // Normalize Vietnamese
  const normalized = normalizeVietnamese(text);

  // Extract numbered bullets from Section II
  // Shorten each to <70 chars
  // Auto-detect icon based on keywords
}
```

### Issue 3: API Keys Exhaustion

**Root Cause**: 3/5 keys hit quota limit (429 errors)

**Solution** (SESSION 7):

```typescript
// Circuit breaker
if (health.failures >= 3) {
  // Skip key for 60s cooldown
}

// Separate key pools
// Answer: Keys 1-3 (primary)
// ShareText: Keys 4-5 (dedicated)
```

---

## 8. NEXT STEPS

### 8.1. Immediate Tasks

- [ ] Test with fresh questions (clear cache)
- [ ] Monitor API quota usage (https://ai.dev/usage?tab=rate-limit)
- [ ] Add more Gemini API keys if needed (currently 5)

### 8.2. Future Enhancements

- [ ] Add qa_prompts table support (dynamic prompts from DB)
- [ ] Implement writing_styles customization
- [ ] Add ShareText templates for different question types
- [ ] Analytics dashboard for API usage tracking

### 8.3. Deployment

See [TODO-TroLyPhapLy.md](TODO-TroLyPhapLy.md) for deployment checklist.

---

## 📚 ADDITIONAL DOCUMENTATION

- **TODO List**: [TODO-TroLyPhapLy.md](TODO-TroLyPhapLy.md)
- **Environment Variables**: `.env.example`
- **Git History**: Use `git log --oneline` to see session history

---

**Last Updated**: December 23, 2025  
**Status**: ✅ SESSION 7 completed - Ready for production testing
id String @id @default(cuid())
email String @unique
passwordHash String
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

// Legal Content
model LegalDocument {
id String @id @default(cuid())
title String
description String?
content String @db.Text
documentType String // "law", "decree", "circular", etc.
documentNumber String?
issuedBy String?
issuedDate DateTime?
effectiveDate DateTime?
category String
tags String[]
slug String @unique
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

model Procedure {
id String @id @default(cuid())
title String
description String?
steps Json // Array of step objects
estimatedTime String?
authority String?
level String? // "commune", "district", "province", "national"
category String
tags String[]
slug String @unique
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

// Prompt Management
model Prompt {
id String @id @default(cuid())
title String
body String @db.Text
category String
tags String[]
isPublic Boolean @default(true)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

// Fun AI Apps (Migrated from FacebookApp logic)
model App {
id String @id @default(cuid())
slug String @unique
name String
description String?
category String
icon String?
inputSchema Json
promptTemplate String @db.Text
type String // "text_only", "image_canvas", "image_ai"
renderConfig Json?
shareConfig Json?
isPublished Boolean @default(false)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
results Result[]
statsDaily AppStatsDaily[]
events AppEvent[]
}

model Result {
id String @id @default(cuid())
appId String
app App @relation(fields: [appId], references: [id], onDelete: Cascade)
inputData Json
outputData Json
imageUrl String?
createdAt DateTime @default(now())

@@index([appId])
}

// Analytics
model AppStatsDaily {
id String @id @default(cuid())
appId String
app App @relation(fields: [appId], references: [id], onDelete: Cascade)
date DateTime @db.Date
views Int @default(0)
submits Int @default(0)
shares Int @default(0)

@@unique([appId, date])
@@index([appId])
@@index([date])
}

model AppEvent {
id String @id @default(cuid())
appId String?
app App? @relation(fields: [appId], references: [id], onDelete: Cascade)
eventType String // "view", "submit", "share", "error"
metadata Json?
createdAt DateTime @default(now())

@@index([appId])
@@index([eventType])
@@index([createdAt])
}

```

### 2.4. Project Structure

```

D:\DTL\trolyphaply\
├── .next/ # Next.js build output
├── app/ # Next.js App Router
│ ├── api/ # API routes
│ │ ├── run/[slug]/ # App execution endpoint
│ │ ├── apps/[slug]/ # Get app config
│ │ ├── results/[id]/ # Get result data
│ │ └── admin/ # Admin CRUD + login
│ ├── a/[slug]/ # [TODO] Public app form page
│ ├── r/[resultId]/ # [TODO] Result display page
│ ├── law/ # [TODO] Legal library pages
│ ├── prompts/ # [TODO] Prompt hub pages
│ ├── apps/ # [TODO] Fun apps catalog
│ ├── admin/ # [TODO] Admin dashboard UI
│ ├── layout.tsx # Root layout
│ └── page.tsx # Home page (Legal Q&A)
├── lib/ # [TODO] Utility libraries
│ ├── prisma.ts # DB client singleton
│ ├── gemini.ts # Gemini API wrapper
│ ├── storage.ts # Supabase storage helpers
│ ├── auth.ts # Admin auth (bcrypt)
│ ├── analytics.ts # Event logging
│ └── render.ts # Image rendering (Sharp + SVG)
├── components/ # [TODO] React components
│ ├── layout/ # AppShell, Header, BottomNav
│ ├── ui/ # Card, Button, Chip, etc.
│ └── forms/ # Form components
├── public/ # Static assets
│ ├── backgrounds/ # [TODO] App background images
│ ├── icons/ # [TODO] PWA icons
│ └── manifest.json # [TODO] PWA manifest
├── prisma/
│ ├── schema.prisma # [IN PROGRESS] Database schema
│ └── seed.ts # [TODO] Seed script
├── .env # ✅ Environment variables (configured)
├── .env.example # ✅ Template
├── .gitignore # ✅ Git ignore rules
├── package.json # ✅ Dependencies (installed)
├── tsconfig.json # ✅ TypeScript config
├── tailwind.config.ts # ✅ Tailwind config
├── next.config.ts # ✅ Next.js config
├── README.md # ✅ Project documentation
├── UX-UI-SPEC.md # ✅ UX/UI specification
├── IMPLEMENTATION-ROADMAP.md # ✅ This document
└── generate-schema.js # ✅ Script to generate Prisma schema

````

---

## 3. DEVELOPMENT SESSIONS

### Overview of 8 Sessions

| Session       | Focus Area                  | Duration   | Status          |
| ------------- | --------------------------- | ---------- | --------------- |
| **SESSION 0** | Project Setup & Database    | ~15-20 min | **In Progress** |
| **SESSION 1** | Database Schema + Seed Data | ~30 min    | Pending         |
| **SESSION 2** | Design System + Components  | ~45 min    | Pending         |
| **SESSION 3** | Home + Law Pages            | ~60 min    | Pending         |
| **SESSION 4** | Prompts + Apps Pages        | ~60 min    | Pending         |
| **SESSION 5** | Admin Dashboard             | ~45 min    | Pending         |
| **SESSION 6** | PWA Setup + Polish          | ~30 min    | Pending         |
| **SESSION 7** | Testing + Deployment        | ~30 min    | Pending         |

**Total Estimated Time**: ~5-6 hours (excluding breaks)

---

## 4. COMPLETED TASKS

### ✅ SESSION 0: Project Setup (Partial)

#### 4.1. Project Initialization

- [x] Created Next.js 16 project at `D:\DTL\trolyphaply\`
- [x] Configured TypeScript + ESLint
- [x] Configured Tailwind CSS with custom color palette (legal theme)
- [x] Set up Git repository (local)
- [x] Created `.gitignore` with proper exclusions

#### 4.2. Dependency Installation

- [x] Installed all required packages (470 packages, 0 vulnerabilities)
- [x] Installed Prisma 7 + @prisma/adapter-pg
- [x] Installed Supabase SDK (@supabase/supabase-js)
- [x] Installed Gemini SDK (@google/generative-ai)
- [x] Installed Sharp (image processing)
- [x] Installed bcryptjs (password hashing)

**Package List**:

```json
{
  "dependencies": {
    "@google/generative-ai": "^0.21.0",
    "@prisma/adapter-pg": "^6.2.2",
    "@supabase/supabase-js": "^2.49.2",
    "bcryptjs": "^2.4.3",
    "next": "^16.0.2",
    "pg": "^8.13.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "sharp": "^0.33.5"
  },
  "devDependencies": {
    "@prisma/client": "^6.2.2",
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^22",
    "@types/pg": "^8.11.10",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "^16.0.2",
    "postcss": "^8",
    "prisma": "^6.2.2",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
````

#### 4.3. Supabase Configuration

- [x] Created new Supabase project: icqivkassoxfaukqbzyt
- [x] Selected region: Southeast Asia (Singapore)
- [x] Configured connection string in `.env`
- [x] Verified Supabase credentials

**Supabase Credentials**:

```env
SUPABASE_URL=https://icqivkassoxfaukqbzyt.supabase.co
SUPABASE_ANON_KEY=<REDACTED>
DATABASE_URL=postgresql://postgres.icqivkassoxfaukqbzyt:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.icqivkassoxfaukqbzyt:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

#### 4.4. Gemini API Configuration

- [x] Copied 4 Gemini API keys from FacebookApp
- [x] Configured in `.env` with key rotation logic

**API Keys** (Shared with FacebookApp):

```env
GEMINI_API_KEY_1=<REDACTED>
GEMINI_API_KEY_2=<REDACTED>
GEMINI_API_KEY_3=<REDACTED>
GEMINI_API_KEY_4=<REDACTED>
```

#### 4.5. Environment Setup

- [x] Created `.env` with all required variables
- [x] Created `.env.example` template
- [x] Configured admin credentials
- [x] Set port to 6666

**Admin Credentials**:

```env
ADMIN_EMAIL=admin@trolyphaply.vn
ADMIN_PASSWORD=<REDACTED>
```

#### 4.6. Documentation

- [x] Created `README.md` with project overview
- [x] Created `UX-UI-SPEC.md` (comprehensive UX/UI specification)
- [x] Created `IMPLEMENTATION-ROADMAP.md` (this document)
- [x] Documented tech stack and architecture

#### 4.7. Database Schema Creation (Attempted)

- [x] Initialized Prisma with `npx prisma init`
- [x] Created `prisma/` folder
- [x] Attempted to create `schema.prisma` via PowerShell (failed - encoding issues)
- [x] Created `generate-schema.js` Node.js script as workaround
- [ ] **[PENDING]** Execute `generate-schema.js` to create schema
- [ ] **[PENDING]** Run `npx prisma generate` to generate Prisma client
- [ ] **[PENDING]** Run `npx prisma db push` to push schema to Supabase

---

## 5. CURRENT PROGRESS

### 🔄 SESSION 0: Database Setup (In Progress)

**Current Status**: Schema creation script ready, needs execution

**What's Done**:

- ✅ All environment variables configured
- ✅ Supabase project created and verified
- ✅ Database connection string configured
- ✅ All dependencies installed
- ✅ Documentation created

**What's Blocking**:

- ❌ PowerShell heredoc syntax causing escape character issues (`\"` instead of `"`)
- ❌ `schema.prisma` not properly created yet
- ❌ Prisma client not generated (depends on schema)
- ❌ Database tables not created (depends on schema)

**Workaround Implemented**:

- Created `generate-schema.js` Node.js script to write schema without PowerShell interference
- Script contains complete schema with 8 models

**Next Immediate Steps**:

1. Execute: `node generate-schema.js` (creates `prisma/schema.prisma`)
2. Execute: `npx prisma generate` (generates Prisma client)
3. Execute: `npx prisma db push` (pushes schema to Supabase)
4. Verify: Check Supabase dashboard for tables

---

## 6. PENDING TASKS

### 🔜 SESSION 0: Remaining Tasks

- [ ] Execute `generate-schema.js` to create schema
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma db push`
- [ ] Verify database tables in Supabase dashboard
- [ ] Test database connection with simple query

### 📋 SESSION 1: Database Schema + Seed Data

**Goal**: Complete database setup with seed data

**Tasks**:

1. **Copy utility libraries from FacebookApp**

   - [ ] Copy `lib/prisma.ts` (DB client singleton)
   - [ ] Copy `lib/gemini.ts` (Gemini API wrapper)
   - [ ] Copy `lib/storage.ts` (Supabase storage helpers)
   - [ ] Copy `lib/auth.ts` (bcrypt hash/compare)
   - [ ] Copy `lib/analytics.ts` (event logging)
   - [ ] Copy `lib/render.ts` (renderTextOnImage with Sharp)

2. **Create seed data**

   - [ ] Create `prisma/seed.ts` script
   - [ ] Seed AdminUser (1 user: admin@trolyphaply.vn)
   - [ ] Seed LegalDocuments (3-4 sample documents)
     - Example: Luật Dân sự 2015, Luật Đất đai 2024, Bộ luật Lao động 2019
   - [ ] Seed Procedures (3-4 common procedures)
     - Example: Đăng ký kết hôn, Đăng ký kinh doanh, Đăng ký đất đai
   - [ ] Seed Prompts (3-4 useful prompts)
     - Example: Phân tích hợp đồng, Tư vấn thuế, Soạn đơn khiếu nại

3. **Migrate apps from FacebookApp**

   - [ ] Copy app definition: `van-menh` (Vận Mệnh Của Bạn)
   - [ ] Copy app definition: `tu-vi-chuyen-sau` (Tử Vi Chuyên Sâu)
   - [ ] Copy background images to `public/backgrounds/`
   - [ ] DO NOT migrate historical results (fresh start)

4. **Create Supabase Storage buckets**

   - [ ] Create bucket: `results` (for generated images)
   - [ ] Create bucket: `documents` (for legal document PDFs, optional)
   - [ ] Set bucket policies (public read for results)

5. **Test database operations**
   - [ ] Test CRUD on all models
   - [ ] Test relations (App → Result, App → Stats)
   - [ ] Test Gemini API integration
   - [ ] Test image upload to Supabase Storage

**Duration**: ~30 minutes

---

### 🎨 SESSION 2: Design System + Components

**Goal**: Build reusable component library

**Tasks**:

1. **Configure Tailwind CSS**

   - [ ] Add custom color palette (legal theme)
   - [ ] Add custom fonts (Inter or Roboto)
   - [ ] Add custom spacing/sizing utilities
   - [ ] Add mobile-first breakpoints

2. **Create layout components**

   - [ ] `components/layout/AppShell.tsx`
   - [ ] `components/layout/Header.tsx`
   - [ ] `components/layout/BottomNav.tsx`

3. **Create UI components**

   - [ ] `components/ui/Card.tsx` (with variants)
   - [ ] `components/ui/Button.tsx` (Primary, Secondary, Accent)
   - [ ] `components/ui/Chip.tsx` (filter/tag chips)
   - [ ] `components/ui/SearchBar.tsx`
   - [ ] `components/ui/Accordion.tsx`
   - [ ] `components/ui/EmptyState.tsx`
   - [ ] `components/ui/Toast.tsx` (notification)
   - [ ] `components/ui/BottomSheet.tsx` (modal drawer)

4. **Create form components**

   - [ ] `components/forms/TextInput.tsx`
   - [ ] `components/forms/TextArea.tsx`
   - [ ] `components/forms/Select.tsx`
   - [ ] `components/forms/RadioGroup.tsx`
   - [ ] `components/forms/CheckboxGroup.tsx`

5. **Create content components**

   - [ ] `components/content/PromptCard.tsx`
   - [ ] `components/content/MiniAppCard.tsx`
   - [ ] `components/content/LegalDocCard.tsx`
   - [ ] `components/content/ProcedureCard.tsx`
   - [ ] `components/content/TagList.tsx`

6. **Test component library**
   - [ ] Create Storybook or demo page
   - [ ] Verify mobile responsiveness
   - [ ] Test dark mode (if planned)

**Duration**: ~45 minutes

---

### 🏠 SESSION 3: Home + Law Pages

**Goal**: Implement Legal Q&A Hub and Legal Library

**Tasks**:

1. **Home Page (`/` or `app/page.tsx`)**

   - [ ] Intro block with heading/subtext
   - [ ] Q&A input section (textarea + suggestion chips)
   - [ ] Primary "Hỏi ngay" button
   - [ ] Suggested questions list (from database or hardcoded)
   - [ ] Quick links (horizontal scroll cards)
   - [ ] Integrate Gemini API for Q&A

2. **Legal Library Page (`app/law/page.tsx`)**

   - [ ] Filter bar (tabs: All, Documents, Procedures, Case law)
   - [ ] Search input
   - [ ] Filter button (opens bottom sheet)
   - [ ] List of items (card list)
   - [ ] Pagination or infinite scroll

3. **Document Detail Page (`app/law/doc/[id]/page.tsx`)**

   - [ ] Title + meta info (type, number, date, authority)
   - [ ] Summary card
   - [ ] Accordion sections (chapters)
   - [ ] "Hỏi về văn bản này" button
   - [ ] "Lưu" button (bookmark)

4. **API Routes**
   - [ ] `app/api/qa/route.ts` (POST - submit question, get answer)
   - [ ] `app/api/law/documents/route.ts` (GET - list documents)
   - [ ] `app/api/law/documents/[id]/route.ts` (GET - document detail)

**Duration**: ~60 minutes

---

### 💡 SESSION 4: Prompts + Apps Pages

**Goal**: Implement Prompt Hub and Fun AI Apps

**Tasks**:

1. **Prompt Hub (`app/prompts/page.tsx`)**

   - [ ] Header with "New Prompt" button
   - [ ] Search input
   - [ ] Category filter chips
   - [ ] Toggle view (list/grid)
   - [ ] Prompt card list

2. **Prompt Detail (`app/prompts/[id]/page.tsx`)**

   - [ ] Title, category, tags
   - [ ] Full prompt body (monospace)
   - [ ] "Copy prompt", "Edit", "Duplicate" buttons

3. **Fun AI Apps Catalog (`app/apps/page.tsx`)**

   - [ ] Intro block
   - [ ] Category filters
   - [ ] App grid/list
   - [ ] Show migrated apps (van-menh, tu-vi-chuyen-sau)

4. **Single Mini-App Page (`app/apps/[slug]/page.tsx`)**

   - [ ] App title + description
   - [ ] Dynamic form (from inputSchema)
   - [ ] "Generate" button
   - [ ] Result area (text or image)
   - [ ] "Copy" and "Share to Facebook" buttons
   - [ ] "Regenerate" button

5. **API Routes**
   - [ ] `app/api/prompts/route.ts` (GET - list prompts, POST - create)
   - [ ] `app/api/prompts/[id]/route.ts` (GET, PUT, DELETE)
   - [ ] `app/api/apps/route.ts` (GET - list apps)
   - [ ] `app/api/run/[slug]/route.ts` (POST - execute app)
   - [ ] `app/api/results/[id]/route.ts` (GET - result detail)

**Duration**: ~60 minutes

---

### ⚙️ SESSION 5: Admin Dashboard

**Goal**: Build admin interface for content management

**Tasks**:

1. **Admin Login (`app/admin/login/page.tsx`)**

   - [ ] Email/password form
   - [ ] Login button
   - [ ] Error handling
   - [ ] Session cookie creation

2. **Admin Layout (`app/admin/layout.tsx`)**

   - [ ] Protected route wrapper (auth check)
   - [ ] Admin navigation sidebar/header
   - [ ] Logout button

3. **Admin Dashboard (`app/admin/page.tsx`)**

   - [ ] Overview stats (total documents, prompts, apps, results)
   - [ ] Recent activity (last 10 results)
   - [ ] Quick actions (New Document, New App, etc.)

4. **Legal Documents Management (`app/admin/documents/page.tsx`)**

   - [ ] List all documents (table)
   - [ ] Create/Edit/Delete documents
   - [ ] Filter by category
   - [ ] Search by title/number

5. **Prompts Management (`app/admin/prompts/page.tsx`)**

   - [ ] List all prompts (table)
   - [ ] Create/Edit/Delete prompts
   - [ ] Filter by category
   - [ ] Toggle public/private

6. **Apps Management (`app/admin/apps/page.tsx`)**

   - [ ] List all mini-apps (table)
   - [ ] Create/Edit/Delete apps
   - [ ] Clone app (duplicate)
   - [ ] Toggle published status
   - [ ] View analytics (views, submits, shares)

7. **API Routes**
   - [ ] `app/api/admin/login/route.ts` (POST - authenticate)
   - [ ] `app/api/admin/logout/route.ts` (POST - clear session)
   - [ ] `app/api/admin/documents/route.ts` (GET, POST)
   - [ ] `app/api/admin/documents/[id]/route.ts` (GET, PUT, DELETE)
   - [ ] `app/api/admin/prompts/route.ts` (GET, POST)
   - [ ] `app/api/admin/prompts/[id]/route.ts` (GET, PUT, DELETE)
   - [ ] `app/api/admin/apps/route.ts` (GET, POST)
   - [ ] `app/api/admin/apps/[id]/route.ts` (GET, PUT, DELETE, POST /clone)

**Duration**: ~45 minutes

---

### 📱 SESSION 6: PWA Setup + Polish

**Goal**: Make app installable and add final touches

**Tasks**:

1. **PWA Setup**

   - [ ] Create `public/manifest.json` (web app manifest)
   - [ ] Create PWA icons (192x192, 512x512)
   - [ ] Register service worker
   - [ ] Test "Add to Home Screen" on mobile
   - [ ] Verify offline functionality (app shell cache)

2. **Polish & Refinements**

   - [ ] Add loading skeletons for all async operations
   - [ ] Add error boundaries
   - [ ] Add toast notifications for user actions
   - [ ] Improve mobile responsiveness (test on real devices)
   - [ ] Add favicon
   - [ ] Optimize images (WebP format)

3. **Accessibility**

   - [ ] Add ARIA labels to all interactive elements
   - [ ] Ensure keyboard navigation works
   - [ ] Test screen reader compatibility
   - [ ] Verify color contrast (WCAG AA)
   - [ ] Add skip to main content link

4. **SEO**
   - [ ] Add meta tags (title, description, OG tags)
   - [ ] Create `robots.txt`
   - [ ] Create `sitemap.xml`
   - [ ] Add structured data (JSON-LD) for legal content

**Duration**: ~30 minutes

---

### 🚀 SESSION 7: Testing + Deployment

**Goal**: Test thoroughly and deploy to production

**Tasks**:

1. **Testing**

   - [ ] Manual testing: All pages, all features
   - [ ] Mobile testing: iOS Safari, Android Chrome
   - [ ] Cross-browser testing: Chrome, Firefox, Edge
   - [ ] Performance testing: Lighthouse audit
   - [ ] Accessibility testing: axe DevTools
   - [ ] Load testing: Database queries, Gemini API calls

2. **Bug Fixes**

   - [ ] Fix critical bugs (blocking functionality)
   - [ ] Fix UI/UX issues (layout, responsiveness)
   - [ ] Optimize slow queries

3. **Deployment Preparation**

   - [ ] Configure production environment variables
   - [ ] Set up Vercel project (or other hosting)
   - [ ] Configure custom domain (trolyphaply.vn)
   - [ ] Set up subdomain for FacebookApp (tuvi.trolyphaply.vn)

4. **Deployment**

   - [ ] Deploy to Vercel (or hosting platform)
   - [ ] Run database migrations on production
   - [ ] Test production deployment
   - [ ] Monitor error logs (Sentry or similar)

5. **Post-Deployment**
   - [ ] Create user documentation
   - [ ] Create admin documentation
   - [ ] Set up analytics (Google Analytics or Plausible)
   - [ ] Monitor performance metrics

**Duration**: ~30 minutes

---

## 7. KNOWN ISSUES

### 7.1. Active Issues

| Issue               | Description                                           | Impact                  | Workaround                              | Status          |
| ------------------- | ----------------------------------------------------- | ----------------------- | --------------------------------------- | --------------- |
| **Schema Creation** | PowerShell heredoc escaping quotes in `schema.prisma` | Blocking database setup | Use `generate-schema.js` Node.js script | **In Progress** |

### 7.2. Resolved Issues

| Issue           | Description                              | Solution                               | Date       |
| --------------- | ---------------------------------------- | -------------------------------------- | ---------- |
| npm naming      | Package name contained uppercase letters | Used lowercase `trolyphaply`           | 2026-01-XX |
| Prisma 7 config | Confusion about `prisma.config.ts`       | Removed config file, using `.env` only | 2026-01-XX |

---

## 8. NEXT STEPS

### 8.1. Immediate Actions (Next 5 minutes)

1. **Execute schema creation script**:

   ```powershell
   cd D:\DTL\trolyphaply
   node generate-schema.js
   ```

2. **Generate Prisma client**:

   ```powershell
   npx prisma generate
   ```

3. **Push schema to Supabase**:

   ```powershell
   npx prisma db push
   ```

4. **Verify database**:
   - Open Supabase dashboard
   - Check "Table Editor" for 8 new tables
   - Verify relations are correct

### 8.2. Short-Term Goals (Next Session)

**SESSION 1: Database Schema + Seed Data**

- Copy utility libraries from FacebookApp
- Create seed script with sample data
- Migrate 2 apps (van-menh, tu-vi-chuyen-sau)
- Test all database operations

**Estimated time**: 30 minutes

### 8.3. Medium-Term Goals (Next 3-4 Sessions)

**SESSIONS 2-4**:

- Build design system and component library
- Implement all 5 main pages (Home, Law, Prompts, Apps, Profile)
- Implement admin dashboard (CRUD for all content)

**Estimated time**: 2.5-3 hours

### 8.4. Long-Term Goals (Final 2 Sessions)

**SESSIONS 5-6**:

- PWA setup (manifest, service worker, icons)
- Polish UI/UX (loading states, error handling, animations)
- Testing (manual, automated, performance)
- Deployment to production (Vercel + custom domain)

**Estimated time**: 1 hour

---

## 9. DECISION LOG

### 9.1. Architecture Decisions

| Decision                                        | Rationale                                                | Date       |
| ----------------------------------------------- | -------------------------------------------------------- | ---------- |
| **Separate project** (not refactor FacebookApp) | Clean separation of concerns, easier maintenance         | 2026-01-XX |
| **Prisma 7 + PostgreSQL**                       | Modern ORM, type-safe queries, Supabase compatibility    | 2026-01-XX |
| **Next.js 16 App Router**                       | Latest features, server components, better performance   | 2026-01-XX |
| **Shared Gemini API keys**                      | Cost savings, same quota management                      | 2026-01-XX |
| **Port 6666**                                   | Avoid conflict with FacebookApp (8686), easy to remember | 2026-01-XX |

### 9.2. Migration Decisions

| Decision                                                 | Rationale                                    | Date       |
| -------------------------------------------------------- | -------------------------------------------- | ---------- |
| **Migrate app definitions only** (no results)            | Fresh start, avoid data migration complexity | 2026-01-XX |
| **Copy 2 apps** (van-menh, tu-vi-chuyen-sau)             | Proven apps, popular with users              | 2026-01-XX |
| **Copy utility libraries** (gemini.ts, storage.ts, etc.) | Reuse battle-tested code, faster development | 2026-01-XX |

### 9.3. Design Decisions

| Decision                          | Rationale                                                | Date       |
| --------------------------------- | -------------------------------------------------------- | ---------- |
| **Mobile-first**                  | 80% of users on mobile (Vietnamese market)               | 2026-01-XX |
| **Navy blue + gold** color scheme | Trustworthy (legal) + premium feel                       | 2026-01-XX |
| **Bottom navigation** (4 tabs)    | Mobile UX best practice, easy thumb reach                | 2026-01-XX |
| **PWA**                           | Installable app, offline support, native-like experience | 2026-01-XX |

---

## 10. RESOURCES

### 10.1. Documentation Links

- **Next.js 16**: https://nextjs.org/docs
- **Prisma 7**: https://www.prisma.io/docs
- **Supabase**: https://supabase.com/docs
- **Gemini API**: https://ai.google.dev/gemini-api/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Sharp**: https://sharp.pixelplumbing.com/

### 10.2. Project Files

| File                        | Purpose                                 |
| --------------------------- | --------------------------------------- |
| `UX-UI-SPEC.md`             | Comprehensive UX/UI specification       |
| `IMPLEMENTATION-ROADMAP.md` | This document (progress tracking)       |
| `README.md`                 | Project overview and setup instructions |
| `.env.example`              | Environment variables template          |
| `generate-schema.js`        | Prisma schema generation script         |

### 10.3. External Services

| Service              | Purpose              | URL                                                         |
| -------------------- | -------------------- | ----------------------------------------------------------- |
| **Supabase**         | Database + Storage   | https://supabase.com/dashboard/project/icqivkassoxfaukqbzyt |
| **Gemini API**       | AI text generation   | https://aistudio.google.com/apikey                          |
| **Vercel** (planned) | Hosting + Deployment | https://vercel.com                                          |

---

## 11. TEAM & CONTACTS

### 11.1. Project Team

| Role              | Name/Entity          | Responsibility                   |
| ----------------- | -------------------- | -------------------------------- |
| **Developer**     | GitHub Copilot Agent | Full-stack development           |
| **Product Owner** | [User]               | Requirements, decisions, testing |
| **Designer**      | [Copilot-assisted]   | UX/UI design (spec-based)        |

### 11.2. Communication

- **Development**: VS Code + GitHub Copilot Chat
- **Documentation**: Markdown files in project root
- **Version Control**: Git (local) → GitHub (planned)

---

## 12. GLOSSARY

| Term               | Definition                                                          |
| ------------------ | ------------------------------------------------------------------- |
| **Mini-app**       | Small AI-powered generator (greeting card, horoscope, poem, etc.)   |
| **App definition** | Database record defining mini-app behavior (schema, prompt, config) |
| **Result**         | Output from running a mini-app (text + optional image)              |
| **Prompt**         | AI instruction template for Gemini API                              |
| **Legal document** | Vietnamese law, decree, circular, or regulation                     |
| **Procedure**      | Step-by-step guide for administrative process                       |
| **Case law**       | Legal precedent from Vietnamese courts                              |
| **Session**        | Development time block (~30-60 minutes)                             |

---

## APPENDIX A: ENVIRONMENT VARIABLES REFERENCE

```env
# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres.icqivkassoxfaukqbzyt:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.icqivkassoxfaukqbzyt:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres

# Supabase Storage
SUPABASE_URL=https://icqivkassoxfaukqbzyt.supabase.co
SUPABASE_ANON_KEY=<REDACTED>
SUPABASE_SERVICE_ROLE_KEY=<REDACTED>

# Gemini API (Shared with FacebookApp)
GEMINI_API_KEY_1=<REDACTED>
GEMINI_API_KEY_2=<REDACTED>
GEMINI_API_KEY_3=<REDACTED>
GEMINI_API_KEY_4=<REDACTED>

# Admin Account
ADMIN_EMAIL=admin@trolyphaply.vn
ADMIN_PASSWORD=<REDACTED>

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:6666
NODE_ENV=development
```

---

## APPENDIX B: DATABASE SCHEMA DIAGRAM

```
┌─────────────────┐
│  AdminUser      │
└─────────────────┘
        │
        │ (manages)
        ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│ LegalDocument   │      │   Procedure     │      │     Prompt      │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                                            │
                                                            │ (uses)
                                                            ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│      App        │──────│    Result       │      │  AppStatsDaily  │
└─────────────────┘  1:N └─────────────────┘      └─────────────────┘
        │                                                  │
        │ 1:N                                              │ 1:N
        ▼                                                  │
┌─────────────────┐                                       │
│    AppEvent     │◄──────────────────────────────────────┘
└─────────────────┘
```

---

**END OF IMPLEMENTATION ROADMAP**

---

**Document prepared by**: GitHub Copilot Agent  
**For project**: TroLyPhapLy (Legal Assistant & Q&A Platform)  
**Last updated**: 2026-01-XX  
**Version**: 1.0  
**Status**: SESSION 0 - Database Setup In Progress

---

**Next action**: Execute `node generate-schema.js` to complete database setup
