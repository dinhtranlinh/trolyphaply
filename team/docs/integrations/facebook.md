# Facebook Integration

## Purpose

- Tự động hóa reply/comment/inbox cho Facebook Page.
- Thu thập logs + thống kê page theo ngày.

## Env

- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`
- `FACEBOOK_VERIFY_TOKEN`
- `FACEBOOK_TOKEN_ENCRYPTION_KEY` (mã hóa token lưu DB)
- Optional (scripts):
  - `FACEBOOK_PAGE_ACCESS_TOKEN`
  - `FACEBOOK_PAGE_ID`

## Token flow (high-level)

1. Lấy user access token (OAuth).
2. Lấy danh sách pages + page access token.
3. Lưu vào `facebook_connection` + `facebook_pages`.
4. Gia hạn token khi cần (extend token).

## API endpoints used

- Graph API v24.0 (xem `lib/facebook/graphApi.ts`).
- `/me/accounts`, `/{page_id}/feed`, `/{post_id}/comments`.
- `/{comment_id}/comments`, `/{comment_id}/private_replies`, `/{page_id}/messages`.
- `/{page_id}/subscribed_apps`, `/debug_token`.

## Webhooks

- Endpoint: `POST /api/facebook/webhooks`
- Verify: `GET /api/facebook/webhooks` với `FACEBOOK_VERIFY_TOKEN`
- Chú ý: nếu thiếu `FACEBOOK_APP_SECRET` sẽ skip signature verify.

## Rate limit & retries

- Rate limits lưu trong `system_config` (`facebook_rate_limits`).
- Cooldown xử lý bằng `automation_logs` + `user_cooldowns` (nếu có).

## Verify

- `python team/scripts/verify/verify-facebook-token.py`
  - Kỳ vọng: token hợp lệ, scopes đủ, in hạn token.
