# Dev Setup

## 1) Requirements

- Node.js: `20.9.0` (xem `.nvmrc`)
- Docker Desktop + WSL2 (Supabase local)
- Supabase CLI

## 2) Setup ENV

Copy `.env.example` -> `.env.local` (dev). Không commit secrets.

ENV quan trọng (tối thiểu):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL` hoặc `DIRECT_URL`
- `GEMINI_API_KEY` (hoặc `GEMINI_API_KEY_1..n`)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`
- `ADMIN_CUSTOMERS_*` (PIN/TOTP/IP/host nếu dùng `/admin/customers`)
- `NEXT_PUBLIC_APP_URL=http://localhost:3456`

## 3) Chạy project (dev)

```bash
npm install
npm run dev
```

Default dev port: `3456` (xem `package.json`).

## 4) Supabase local

```bash
supabase start --workdir "D:\\DTL\\trolyphaply" --yes
```

Migrations nằm trong `prisma/migrations`. Nếu cần:

- Apply migration: `python team/scripts/db/migrate.py`
- Backfill phone encryption: `npm run tsx scripts/backfill_customers_phone_encryption.ts`

## 5) Troubleshooting nhanh

- Lỗi Gemini quota/overloaded: đổi key hoặc chờ reset.
- Lỗi DB connection: kiểm tra `DATABASE_URL`, Supabase local đang chạy.
- Lỗi font/tiếng Việt: kiểm tra encoding file (`UTF-8`) và nguồn prompt.
