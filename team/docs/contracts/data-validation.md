# Data Validation

## API boundary rules

- Luôn validate input ở API route.
- Không tin payload từ integration.

## Q&A

- `question` bắt buộc, không rỗng.
- Độ dài tối đa 1000 ký tự.

## ShareText

- `answer` bắt buộc.
- Output yêu cầu đủ số từ/ký tự + có dấu tiếng Việt.
- Fallback sẽ tự tạo nếu AI fail.

## Customers

- `name` + `phone` bắt buộc.
- `phone` chuẩn hóa chỉ còn số.
- Import TXT: định dạng `name|phone`.
- Max import: 2000 dòng.
- Dòng thiếu name/phone -> lỗi.
- Phone trùng -> skip.

## Tags

- Tag name unique.

## Admin auth

- `email` + `password` bắt buộc.
- Session token dạng `admin_...`.
