# Repo Map (Bản đồ repo)

## 1) Cấu trúc thư mục

- `app/`: Next.js App Router (public + admin + API).
- `components/`: UI components (layout, forms, facebook admin UI).
- `lib/`: service/utilities (gemini, cache, supabase, admin security, facebook).
- `prisma/`: schema + migrations SQL.
- `supabase/`: config cho Supabase local.
- `scripts/`: tools/ops (deploy, backfill, test fb).
- `data/`: JSON dữ liệu mẫu cho legal library/prompt/style.
- `team/`: tài liệu dự án + scripts verify.

## 2) File quan trọng

- Entry point: `app/layout.tsx`, `app/page.tsx`.
- Admin shell: `app/admin/layout.tsx`.
- Q&A API: `app/api/qa/route.ts`.
- ShareText API: `app/api/share-text/route.ts`.
- Admin customers security: `lib/adminCustomersSecurity.ts`.
- Phone encryption: `lib/phoneSecurity.ts`.
- Facebook integration: `lib/facebook/*` + `app/api/facebook/*`.
- Supabase client: `lib/supabase.ts`.
- PM2 config: `ecosystem.config.js`.
- Dev/Prod deploy script: `scripts/deploy-to-prod.ps1`.

## 3) Quy tắc chỉnh sửa

- Khi sửa Q&A: kiểm tra `app/api/qa/route.ts`, `lib/gemini.ts`, `lib/cache.ts`.
- Khi sửa share: kiểm tra `app/api/share-text/route.ts`, `lib/ai.ts`.
- Khi sửa admin customers: kiểm tra `lib/adminCustomersSecurity.ts`, `lib/phoneSecurity.ts`, `app/api/admin/customers/*`.
- Khi sửa facebook: kiểm tra `lib/facebook/*`, `app/api/facebook/*`, `prisma/migrations/20241223_facebook_automation`.
