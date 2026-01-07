# Changelog

## 2026-01-07

- Added: Admin customers security gate (PIN + TOTP + allowlist).
- Added: Phone encryption + hash for customers.
- Added: ShareText cache + fallback logic.
- Added: Q&A session context summaries.
- Changed: Customer import limit 2000 lines + chunked lookup.
- Notes: Apply migrations `20260101_qa_session_contexts`, `20260106_customers_phone_encryption`.

## 2026-01-05

- Added: Customer tags + customers tables.
- Added: Facebook automation baseline schema.
