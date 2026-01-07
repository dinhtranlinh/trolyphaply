# ADR-0002: Admin Customers Security Gate + Phone Encryption

## Status

- Accepted (2026-01-07)

## Context

- `/admin/customers` lưu dữ liệu khách hàng (PII: số điện thoại).
- Cần giảm rủi ro truy cập trái phép và hạn chế lộ dữ liệu.

## Decision

- Bổ sung lớp bảo mật riêng cho `/admin/customers`:
  - Allowlist IP/host.
  - PIN + TOTP (Google Authenticator).
  - Cookie gate ký HMAC có TTL.
- Mã hóa số điện thoại bằng AES-256-GCM + hash HMAC để tìm kiếm.

## Consequences

- Pros:
  - Giảm rủi ro rò rỉ dữ liệu.
  - Có thể truy vết/khóa nhanh theo IP/host.
- Cons:
  - Quy trình login phức tạp hơn.
  - Cần quản lý key/secret cẩn thận.
- Risks:
  - Sai cấu hình allowlist gây lock-out.
  - Lộ key mã hóa gây rủi ro PII.
- Mitigations:
  - Document rõ env vars + verify script.
  - Tách key theo env + backup an toàn.
