# Facebook API Permission Testing

## Quick Start

### Option 1: TypeScript (Recommended)

```powershell
# Tự động lấy token từ database
npx ts-node scripts/test-fb-permissions.ts

# Hoặc dùng token thủ công
$env:FB_TOKEN = "EAAxxxxxx..."
$env:FB_PAGE_ID = "1752765411621435"
npx ts-node scripts/test-fb-permissions.ts
```

### Option 2: Python

```powershell
# Cài dependencies
pip install requests python-dotenv supabase

# Xem token trong database
python scripts/get_page_token.py

# Test với token thủ công
$env:FACEBOOK_PAGE_ACCESS_TOKEN = "EAAxxxxxx..."
$env:FACEBOOK_PAGE_ID = "1752765411621435"
python scripts/test_facebook_permissions.py
```

## Lấy Token từ Graph API Explorer

1. Vào https://developers.facebook.com/tools/explorer
2. Chọn **App** của bạn từ dropdown
3. Click **Generate Access Token**
4. Chọn các permissions:
   - `pages_read_user_content`
   - `pages_read_engagement`
   - `pages_manage_posts`
   - `pages_manage_engagement`
   - `business_management`
   - `pages_show_list`
   - `pages_manage_metadata`
5. **User or Page**: Chọn Page Access Token
6. Copy token và dùng với script

## Permissions được test

| Permission              | API Call                 | Mục đích                 |
| ----------------------- | ------------------------ | ------------------------ |
| pages_read_user_content | GET /{page}/feed         | Đọc bài đăng từ visitors |
| pages_read_engagement   | GET /{page}/insights     | Đọc engagement metrics   |
| pages_manage_posts      | POST /{page}/feed        | Tạo/xóa bài đăng         |
| pages_manage_engagement | POST /{comment}/comments | Reply comments           |
| business_management     | GET /me/businesses       | Quản lý business assets  |
| pages_show_list         | GET /me/accounts         | Liệt kê pages            |
| pages_manage_metadata   | GET /{page}?fields=...   | Đọc thông tin page       |

## Kết quả mong đợi

Sau khi chạy thành công, Facebook App Dashboard sẽ hiện:

- ✅ **Đã hoàn tất** cho tất cả permissions
- Thay vì "Cần có 0/1 lệnh gọi API"

## Troubleshooting

### Error: "Session has expired"

→ Token đã hết hạn, generate token mới từ Graph Explorer

### Error: "(#200) Requires extended permission"

→ Chưa chọn đủ permissions khi generate token

### Error: "Unsupported get request"

→ Sai Page ID hoặc không có quyền truy cập page đó
