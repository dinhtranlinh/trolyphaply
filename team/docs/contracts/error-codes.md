# Error Codes

## Format (thực tế hiện tại)

Phần lớn API dùng 1 trong 2 dạng:

```json
{ "success": false, "error": "Message" }
```

hoặc

```json
{ "error": "Message", "details": "Optional" }
```

## HTTP status conventions

- 400: dữ liệu không hợp lệ
- 401: thiếu auth/2FA hoặc session invalid
- 403: blocked (IP/host không cho phép)
- 404: không tìm thấy
- 409: trùng dữ liệu (ví dụ phone)
- 500: lỗi server

## Ví dụ

```json
{ "success": false, "error": "Phone already exists" }
```
