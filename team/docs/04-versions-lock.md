# Versions Lock (Khóa phiên bản)

> Rule: Không đoán version. Nếu không chắc, kiểm tra `package.json` hoặc docs chính thức.

## Core

- Node.js: 20.9.0 (from `.nvmrc`)
- Next.js: 16.0.6 (`package.json`)
- React: 19.2.0 (`package.json`)
- TypeScript: ^5 (`package.json`)
- Tailwind: ^4 (`package.json`)
- Prisma: 7.0.1 (`package.json`)
- Supabase JS: 2.86.0 (`package.json`)

## Integrations

- Facebook Graph API: v24.0 (xem `lib/facebook/graphApi.ts`) — verified: 2026-01-07
- Google Gemini API: `@google/generative-ai` 0.24.1 — model mặc định `gemini-2.5-flash` — verified: 2026-01-07
- Supabase CLI: kiểm tra bằng `supabase --version` khi cài local

## Verify scripts

- `node team/scripts/verify/verify-env.mjs`
- `python team/scripts/verify/verify-db-connection.py`
- `python team/scripts/verify/verify-gemini-key.py`
- `python team/scripts/verify/verify-facebook-token.py`
