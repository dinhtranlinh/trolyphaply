# Architecture Overview

## 1) Sơ đồ module

- UI Layer: `app/` + `components/` (landing, law/procedures, prompts, mini apps).
- API Layer: `app/api/*` (Q&A, share text, admin, facebook).
- Service Layer: `lib/*` (gemini, cache, analytics, admin security, facebook services).
- Data Layer: Supabase Postgres + Storage.
- Integrations: Gemini API, Facebook Graph API, Supabase Storage.

## 2) Nguyên tắc thiết kế

- Server-first: xử lý chính ở API routes; client chỉ gọi API.
- Stateless API: dựa vào cookie/session + Supabase.
- Cache in-memory để giảm gọi AI (TTL 24h).
- Tách admin/private flow khỏi public flow.

## 3) Các luồng quan trọng

### Flow A: Q&A (Public)

1. Client gửi `POST /api/qa` (question, styleGuideId?).
2. API lấy prompt active + style guide từ DB.
3. Nạp session summary từ `qa_session_contexts` (cookie `qa_session_id`).
4. Gọi Gemini, validate cấu trúc; nếu cần thì reprompt.
5. Cache answer + lưu summary cho phiên tiếp theo.

### Flow B: Share Text (Public)

1. Client gửi `POST /api/share-text` với answer (+ question).
2. API kiểm tra cache, gọi Gemini pool riêng (timeout).
3. Nếu fail, dùng fallback trích xuất thông minh.
4. Trả `shareText` đã làm sạch markdown.

### Flow C: Admin Customers (Bảo mật cao)

1. Admin login -> cookie `admin_session`.
2. `/admin/customers` kiểm tra allowlist IP/host + PIN + TOTP.
3. CRUD customers/tags + import TXT (tối đa 2000 dòng).
4. Phone được mã hóa + hash (tìm kiếm theo hash/last4).

### Flow D: Facebook Automation

1. Webhook nhận event -> dedupe -> lưu `facebook_events`.
2. Đẩy job vào `automation_queue`.
3. Worker xử lý: match rule -> reply/comment/inbox.
4. Lưu `automation_logs` + cập nhật `page_stats`.
