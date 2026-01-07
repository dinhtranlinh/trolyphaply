# Project Constitution (Hiến pháp dự án)

## 1) Mục tiêu dự án

- What: Nền tảng trợ lý pháp lý AI cho người Việt gồm hỏi đáp, thư viện pháp luật, thủ tục hành chính, AI prompts và mini apps.
- Who: Người dùng cuối cần tra cứu nhanh; admin quản trị nội dung, prompts và tự động hóa Facebook.
- Non-goals: Không thay thế tư vấn pháp lý chính thức; không xây dựng hệ thống tài khoản người dùng end-user; không lưu PII vượt nhu cầu vận hành.

## 2) Kiến trúc tổng quan (1 trang)

- Frontend: Next.js App Router + React + Tailwind.
- Backend: API routes trong Next.js.
- Data: Supabase Postgres; Prisma dùng để generate types (không làm migration runtime).
- AI: Google Gemini (với cơ chế xoay key + cache).
- Integrations: Facebook Graph API, Supabase Storage.

## 3) Quy tắc bắt buộc

- Naming: DB dùng snake_case; payload nội bộ dùng camelCase.
- Folder conventions: `app/` (routes), `lib/` (services/utils), `components/` (UI), `scripts/` (ops/verify).
- Error handling: trả JSON `{ success: false, error }` hoặc `{ error }` + HTTP status rõ ràng.
- Logging: không log secrets/PII; log ngắn gọn theo flow.
- Config: mọi cấu hình qua ENV, không hardcode.

## 4) Quy tắc thay đổi (Change Rules)

- Thay DB schema phải có migration trong `prisma/migrations` + cập nhật `team/docs/contracts/db-schema.md`.
- Thay API contract phải cập nhật `team/docs/contracts/api-contracts.md` + `data-validation.md`.
- Thêm integration phải có file trong `team/docs/integrations/` + script verify tương ứng.
- Thay đổi quan trọng phải cập nhật `team/docs/changelog/changelog.md` + session log.

## 5) Quy tắc bảo mật

- Tuyệt đối không commit secrets.
- PII (phone) phải mã hóa + hash trong DB.
- `/admin/customers` bắt buộc qua allowlist IP/host + PIN + TOTP.

## 6) Checklist trước release

- [ ] Contracts cập nhật
- [ ] Migrations chạy + backfill (nếu có)
- [ ] Verify scripts PASS
- [ ] Secrets scan PASS
- [ ] Changelog + session log cập nhật
