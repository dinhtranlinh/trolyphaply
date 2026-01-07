# Testing Strategy

## 1) Các lớp test

- Unit: chưa có bộ test tự động.
- Integration: dùng scripts verify trong `team/scripts/verify`.
- E2E: manual smoke test (Q&A, ShareText, Admin, Facebook).

## 2) Script verify bắt buộc cho integration

- DB: `python team/scripts/verify/verify-db-connection.py`
- Gemini: `python team/scripts/verify/verify-gemini-key.py`
- Facebook: `python team/scripts/verify/verify-facebook-token.py`
- API: `python team/scripts/verify/verify-api-endpoints.py`
- ENV: `node team/scripts/verify/verify-env.mjs`

## 3) Khi thêm feature

- Ít nhất 1 verify script hoặc checklist manual rõ ràng.
- Update contracts + changelog + session log.

## 4) Pre-build checks

- `npm run check` (scripts/comprehensive-check.ts)
- Lưu ý: `next.config.ts` đang bật `typescript.ignoreBuildErrors`.
