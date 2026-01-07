# Known Issues & Anti-patterns

## 1) Lỗi encoding tiếng Việt trong source

Symptoms:
- UI hiển thị ký tự lạ (ví dụ “Ã”, “�”, hoặc chuỗi escape).
Root cause:
- File không chuẩn UTF-8 hoặc copy từ nguồn đã lỗi.
Fix:
- Mở file bằng UTF-8, sửa lại text thuần Việt.
Prevention:
- Không paste text từ nguồn có encoding lạ.
- Dùng prompt/constant đã chuẩn hóa.

## 2) Admin check-auth luôn trả authenticated

Symptoms:
- `/api/admin/check-auth` luôn OK dù chưa login.
Root cause:
- Logic kiểm tra session chưa hoàn thiện.
Fix:
- Validate `admin_session` cookie thực sự.
Prevention:
- Thêm verify script cho admin auth.

## 3) `typescript.ignoreBuildErrors = true`

Symptoms:
- Build pass dù có lỗi type.
Root cause:
- Cấu hình Next.js tắt type check khi build.
Fix:
- Bật lại type check trước release.
Prevention:
- `npm run check` trước khi build.

## 4) Cache in-memory không chia sẻ giữa instances

Symptoms:
- Cache miss khi scale nhiều instance.
Root cause:
- Cache nằm trong process memory.
Fix:
- Dùng Redis hoặc Supabase KV.

## 5) Facebook webhook signature có thể bị skip

Symptoms:
- Log cảnh báo skip signature.
Root cause:
- Thiếu `FACEBOOK_APP_SECRET`.
Fix:
- Cấu hình secret đầy đủ; bật verify.

## 6) Schema drift (tables ngoài migrations)

Symptoms:
- Một số table được dùng trong code nhưng không có migration rõ ràng (vd: `webhook_events`, `user_cooldowns`).
Fix:
- Snapshot schema + bổ sung migration hoặc làm rõ nguồn tạo bảng.
