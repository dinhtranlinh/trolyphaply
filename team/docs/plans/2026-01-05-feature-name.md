# Feature Plan: Admin Customers Security + Phone Encryption

## Goal

- Bảo vệ dữ liệu khách hàng và hạn chế truy cập trái phép vào `/admin/customers`.

## Scope

In-scope:

- PIN + TOTP gate riêng cho `/admin/customers`.
- Allowlist IP/host.
- Mã hóa + hash số điện thoại.
- Import customers tối đa 2000 dòng.

Out-of-scope:

- SSO hoặc auth mới cho toàn bộ admin.
- RBAC chi tiết theo vai trò.

## Impact Analysis

- DB: thêm `qa_session_contexts`, thêm fields phone_encrypted/hash/last4 vào `customers`.
- API: thêm `/api/admin/customers/2fa/*`.
- Modules: `lib/adminCustomersSecurity.ts`, `lib/phoneSecurity.ts`.
- Integrations: không thay đổi.

## Patches

### Patch 1: DB & Contracts

- Goal: migration + doc schema.
- Files: `prisma/migrations/*`, `team/docs/contracts/db-schema.md`.
- Verify/tests: `team/scripts/verify/verify-db-connection.py`.

### Patch 2: API Gate + UI

- Goal: enforce PIN + TOTP + IP/host allowlist.
- Files: `lib/adminCustomersSecurity.ts`, `app/api/admin/customers/*`, `app/admin/customers/page.tsx`.
- Verify/tests: manual login flow.

### Patch 3: Phone Encryption

- Goal: encrypt + hash phone, backfill dữ liệu cũ.
- Files: `lib/phoneSecurity.ts`, `scripts/backfill_customers_phone_encryption.ts`.
- Verify/tests: import + search + copy.

## Rollout

- Migrate + backfill trên local trước.
- Sync sang prod, build, restart PM2.
