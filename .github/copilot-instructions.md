# TroLyPhapLy - AI Coding Instructions

Vietnamese legal assistant platform: AI Q&A, document library, and 20+ viral content apps. Built with **Next.js 16 App Router**, **TypeScript**, **Supabase**, and **Google Gemini AI**.

## Critical Architecture Patterns

### Database: Supabase Only (NOT Prisma)

Prisma exists for schema/migrations only. All runtime queries use Supabase:

```typescript
// ✅ Correct
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(url, key);
await supabase.from("apps").select("*").eq("slug", slug).single();

// ❌ Wrong - Never use Prisma client
import { prisma } from "@/lib/prisma";
```

### AI: Circuit Breaker with Key Rotation

[lib/gemini.ts](lib/gemini.ts) manages multiple API keys with auto-rotation:

- Keys: `GEMINI_API_KEY`, `GEMINI_API_KEY_1`, `GEMINI_API_KEY_2`, etc.
- 3 failures → 60s cooldown per key
- ShareText uses separate dedicated key pool (`GEMINI_API_KEY_SHARETEXT`)

```typescript
import { callAIText } from "@/lib/ai"; // Main Q&A
import { callAITextForShareText } from "@/lib/ai"; // Separate pool
```

### Next.js 16: Async Params Required

```typescript
// Dynamic routes MUST await params
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // Required in Next.js 16
}
```

## Development Commands

```bash
npm run dev          # Port 3456 (dev)
npm run start:prod   # Port 8686 (prod via PM2)
npm run check        # Comprehensive pre-build check
npx prisma db push   # Schema changes only
```

Logs: `dev3456.err`, `prod8686.err` | PM2 config: [ecosystem.config.js](ecosystem.config.js)

## Mini-App Execution Flow

[app/api/run/[slug]/route.ts](app/api/run/[slug]/route.ts):

1. Fetch app from `apps` table (check `published=true`)
2. Validate inputs against `input_schema` JSON
3. Replace `{{placeholders}}` in `prompt_template`
4. Call Gemini via `callAIText()`
5. Store in `results` table

## Facebook Automation Module

Located in `lib/facebook/` with 16 service files:

- **Queue**: DB-based, processed every minute via node-cron
- **Webhooks**: `/api/facebook/webhooks` with SHA1 signature verification
- **Templates**: Spin syntax `[option1|option2]` with `{placeholders}`
- **Safe Mode**: Global kill-switch via `isAutomationAllowed()`
- **Rate Limits**: 10 replies/min, 50 messages/hour per page

Key files: `automationEngine.ts`, `graphApi.ts`, `spinContent.ts`, `tokenManager.ts`

## Key Conventions

| Pattern                   | Example                                                    |
| ------------------------- | ---------------------------------------------------------- |
| Mobile-first layout       | `max-w-2xl mx-auto` on all pages                           |
| Server components default | Add `'use client'` only for hooks/events                   |
| Admin auth                | Cookie-based, 7-day session via [lib/auth.ts](lib/auth.ts) |
| Error logs                | Check `.err` files, not console                            |

## Common Gotchas

- **"App not found"**: Verify `apps.published = true` in DB
- **Circuit breaker**: Check `.err` logs for key exhaustion
- **TypeScript**: `ignoreBuildErrors: true` in next.config.ts (run `npm run lint` manually)
- **Q&A format**: Must return 4 sections (Tóm tắt, Phân tích, Bước làm, Lưu ý)

## 🚨 MANDATORY: Read Before Coding

**ALWAYS read these files first:**

1. [Docs/DEV-LOG.md](Docs/DEV-LOG.md) - Lessons learned, gotchas, patterns
2. [types/facebook-schemas.ts](types/facebook-schemas.ts) - Schema registry (single source of truth)

## Facebook Field Naming (CRITICAL!)

```typescript
// ✅ CORRECT - use page_name
interface Page {
  id: string; // UUID
  page_id: string; // Facebook's numeric ID
  page_name: string; // Display name ← ALWAYS use this!
}

// ❌ WRONG - never use just "name"
interface Page {
  name: string;
} // NO!
```

## page_id Confusion (UUID vs Facebook ID)

```
facebook_pages.id = UUID (internal)
facebook_pages.page_id = "1752765411621435" (Facebook)

auto_message_rules.page_id = UUID (FK to facebook_pages.id!)
webhook payload contains Facebook's page_id

→ ALWAYS lookup UUID before insert
```

## Deploy to Production

```powershell
# Use the deploy script (handles [id] folders correctly)
.\scripts\deploy-to-prod.ps1

# Or dry run first
.\scripts\deploy-to-prod.ps1 -DryRun
```

## Key Files

- [lib/ai.ts](lib/ai.ts) - AI abstraction layer
- [lib/gemini.ts](lib/gemini.ts) - Circuit breaker + key rotation
- [lib/supabase.ts](lib/supabase.ts) - DB client factory
- [types/facebook-schemas.ts](types/facebook-schemas.ts) - Schema registry ⭐
- [Docs/DEV-LOG.md](Docs/DEV-LOG.md) - Development log ⭐
- [prisma/schema.prisma](prisma/schema.prisma) - Schema reference (not runtime)
- [Docs/TODO-TroLyPhapLy.md](Docs/TODO-TroLyPhapLy.md) - Project history/decisions
