# 🔐 BẢO MẬT API KEYS - HƯỚNG DẪN QUAN TRỌNG

> **Cập nhật:** December 12, 2025  
> **Mục đích:** Ngăn chặn API key leaks vĩnh viễn

---

## ❌ VẤN ĐỀ ĐÃ XẢY RA

**Ngày 12/12/2025:** Google Gemini API keys bị leak lên GitHub do file `.env` bị commit vào git history.

**Hậu quả:**

- Tất cả 4 API keys bị Google tự động revoke
- Dù tạo keys mới, vẫn bị leak ngay lập tức vì keys cũ còn trong git history

**Giải pháp đã thực hiện:**

- ✅ Dùng `git filter-branch` để xóa `.env` khỏi toàn bộ git history
- ✅ Force push lên GitHub để xóa sensitive data
- ✅ Tạo tài liệu bảo mật này

---

## 🛡️ BIỆN PHÁP PHÒNG NGỪA

### 1. **.gitignore** (ĐÃ CÓ - KHÔNG SỬA)

File `.gitignore` đã bảo vệ `.env`:

```gitignore
.env*
.env
.env.local
.env.development
.env.production
.env.*.local
!.env.example
```

### 2. **Pre-commit Hook** (MỚI - TỰ ĐỘNG CHẶN)

File `.git/hooks/pre-commit` sẽ **TỰ ĐỘNG CHẶN** commit nếu phát hiện API keys:

```bash
#!/bin/sh
# Pre-commit hook to prevent committing sensitive data

# Check for .env files
if git diff --cached --name-only | grep -E "\.env$|\.env\..*"; then
    echo "❌ ERROR: Attempting to commit .env file!"
    echo "This file contains sensitive API keys."
    exit 1
fi

# Check for API key patterns in staged files
if git diff --cached | grep -E "AIzaSy[A-Za-z0-9_-]{33}"; then
    echo "❌ ERROR: Detected Google API key in staged files!"
    echo "File contains pattern: AIzaSy..."
    exit 1
fi

exit 0
```

### 3. **GitHub Secret Scanning** (TỰ ĐỘNG)

- GitHub tự động scan repositories 24/7
- Phát hiện API keys → Gửi alert ngay lập tức
- Google nhận alert → Revoke key tự động

### 4. **.env.example** (TEMPLATE CÔNG KHAI)

File này KHÔNG chứa keys thật, chỉ là template:

```env
# Google Gemini AI
GEMINI_API_KEY_1="YOUR_API_KEY_HERE"
GEMINI_API_KEY_2="YOUR_API_KEY_HERE"
GEMINI_API_KEY_3="YOUR_API_KEY_HERE"
GEMINI_API_KEY_4="YOUR_API_KEY_HERE"
```

---

## 📋 QUY TRÌNH TẠO API KEYS AN TOÀN

### Bước 1: Tạo Keys Mới

1. Truy cập: https://aistudio.google.com/app/apikey
2. **Revoke** tất cả keys cũ (nếu có)
3. Tạo 4 keys mới
4. **QUAN TRỌNG:** Copy keys ngay, không để lộ ra màn hình chia sẻ

### Bước 2: Lưu Keys Vào .env (LOCAL)

```bash
# Mở .env (file này KHÔNG BAO GIỜ được commit)
notepad .env

# Paste keys mới:
GEMINI_API_KEY_1="AIzaSy..."
GEMINI_API_KEY_2="AIzaSy..."
GEMINI_API_KEY_3="AIzaSy..."
GEMINI_API_KEY_4="AIzaSy..."
```

### Bước 3: Verify .env KHÔNG Trong Git

```bash
# Kiểm tra status
git status

# PHẢI THẤY: .env không xuất hiện trong "Untracked files"
# NẾU THẤY .env → NGAY LẬP TỨC:
git rm --cached .env
git commit -m "Remove .env from tracking"
```

### Bước 4: Test Keys

```bash
# Chạy dev server
npm run dev

# Kiểm tra Q&A có hoạt động không
# Nếu lỗi 403 Forbidden → Keys bị leak rồi, phải tạo lại
```

---

## 🚨 KHI NÀO KEYS BỊ LEAK?

**Dấu hiệu nhận biết:**

- ❌ Q&A trả về lỗi 403 Forbidden
- ❌ Email từ Google: "API key was reported as leaked"
- ❌ Keys không hoạt động ngay sau khi tạo

**Nguyên nhân phổ biến:**

1. Commit `.env` lên git (dù vô tình)
2. Paste keys vào code (thay vì dùng environment variables)
3. Screenshot/chia sẻ màn hình có keys
4. Keys trong git history (dù đã xóa file .env)

**Cách fix:**

1. Revoke keys cũ ngay lập tức
2. Kiểm tra git history: `git log -S "AIzaSy"`
3. Nếu có → Dùng `git filter-branch` để xóa
4. Tạo keys mới SAU KHI đã clean git history

---

## ✅ CHECKLIST BẢO MẬT

**Trước mỗi lần commit:**

- [ ] Chạy `git status` - Verify .env KHÔNG trong staged files
- [ ] Chạy `git diff --cached` - Verify không có pattern "AIzaSy"
- [ ] Pre-commit hook đã được cài đặt

**Trước mỗi lần push:**

- [ ] Double-check git log: `git log --oneline -5`
- [ ] Verify không có commit message kiểu "Add .env" hoặc "Update API keys"

**Định kỳ hàng tháng:**

- [ ] Rotate API keys (tạo mới, xóa cũ)
- [ ] Kiểm tra GitHub Security Alerts
- [ ] Review git history: `git log --all -S "AIzaSy"`

---

## 🔧 CÔNG CỤ HỮU ÍCH

### Kiểm tra Git History

```bash
# Tìm API keys trong lịch sử
git log --all -S "AIzaSy" --oneline

# Xem chi tiết commit chứa keys
git show <commit-hash> | grep "AIzaSy"
```

### Xóa Sensitive Data Khỏi Git

```bash
# Option 1: git filter-branch (đã dùng)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Option 2: BFG Repo-Cleaner (nhanh hơn)
# Download: https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### GitHub Secret Scanning

- Settings → Security → Secret scanning alerts
- Bật "Push protection" để chặn trước khi push

---

## 📞 LIÊN HỆ KHI CẦN TRỢ GIÚP

**Nếu API keys bị leak:**

1. **NGAY LẬP TỨC:** Revoke keys tại https://aistudio.google.com/app/apikey
2. Kiểm tra git history (hướng dẫn ở trên)
3. Clean git history nếu cần
4. Tạo keys mới SAU KHI clean xong

**Nếu không chắc chắn:**

- Hỏi AI Assistant trước khi commit
- Review git diff trước khi push
- Better safe than sorry!

---

## 📚 TÀI LIỆU THAM KHẢO

- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [Google: API key best practices](https://cloud.google.com/docs/authentication/api-keys)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)

---

**⚠️ LƯU Ý QUAN TRỌNG:**

> Một khi API key đã bị commit lên GitHub (kể cả 1 giây), nó đã bị leak!
>
> GitHub và Google quét repository liên tục. Việc xóa commit sau đó KHÔNG THỂ "un-leak" key.
>
> **Giải pháp duy nhất:** Revoke key ngay + Clean git history + Tạo key mới.

---

**Last Updated:** December 12, 2025  
**Version:** 1.0
