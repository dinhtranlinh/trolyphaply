# 📋 SESSION 10 KẾ HOẠCH - TÓM TẮT THỰC THI

## 🎯 3 CÔNG VIỆC CHÍNH

### 1️⃣ TASK 1: Nâng cấp Trang Quản Lý Prompt (/admin/prompts)

**Status**: ⚠️ Cần nâng cấp  
**Priority**: 🔴 HIGH  
**Time**: ~1-2 hours

#### ❌ Vấn đề hiện tại:

- Categories không phù hợp: `writing`, `analysis`, `coding`, `creative`, `education`, `business`, `other`
- Không match với usecase TroLyPhapLy

#### ✅ Cần làm:

1. **Thay đổi categories** → `qa` | `mini_app` | `video` | `other`
2. **Thêm display names** tiếng Việt:
   - `qa` → "❓ Hỏi đáp Pháp Luật"
   - `mini_app` → "🎨 Ứng Dụng AI"
   - `video` → "🎬 Video Prompts"
   - `other` → "📋 Khác"
3. **Cải thiện UI**:
   - Add category badges với colors khác nhau
   - Category dropdown có icon/label
   - Table list hiển thị category badge
4. **Test**:
   - Tạo prompt mới → lưu được category ✓
   - Filter by category → hoạt động ✓
   - Edit prompt → category persist ✓

#### 📁 File cần sửa:

- `app/admin/prompts/page.tsx` (line 19-23: CATEGORIES constant)

---

### 2️⃣ TASK 2: Xác minh Trang Mini App cho User (/apps)

**Status**: ✅ Likely working  
**Priority**: 🟡 MEDIUM  
**Time**: ~30 mins

#### ✅ Hiện tại:

- Page đã tồn tại với full UI
- Categories: "Tất cả", "Tử vi", "Lời chúc", "Thơ", "Caption", "Khác"
- MiniAppCard component có
- Fetch từ `/api/apps?published=true`
- Navigation to `/apps/[slug]` working

#### ✅ Cần kiểm tra:

1. **API endpoint** `/api/apps`:

   - Có hoạt động không?
   - Response format đúng không?
   - Filter `published=true` có work không?

2. **UI Features**:

   - Category filter có work không?
   - Click app → navigate không?
   - Empty state hiển thị đúng không?

3. **Components**:
   - MiniAppCard display đúng không?
   - Layout responsive không?

#### 📁 Files để kiểm tra:

- `app/apps/page.tsx`
- `app/api/apps/route.ts`
- `components/content/MiniAppCard.tsx`

#### 🧪 Manual test:

```
1. Load http://localhost:3456/apps
2. See list of published apps
3. Click category → filter works
4. Click app → go to /apps/[slug]
5. Mobile view → responsive
```

---

### 3️⃣ TASK 3: Xác minh Trang Quản Trị Mini App (/admin/apps)

**Status**: ✅ Likely working  
**Priority**: 🟡 MEDIUM  
**Time**: ~1-2 hours

#### ✅ Hiện tại:

- Page CRUD đã tồn tại (791 lines!)
- Categories: `tuvi`, `greeting`, `poetry`, `caption`, `other`
- Full CRUD: Create, Read, Edit, Delete
- Clone functionality
- Stats tracking
- Advanced form with JSON editors

#### ✅ Cần kiểm tra:

1. **CRUD Operations**:

   - Create new app ✓
   - Edit existing ✓
   - Delete with confirmation ✓
   - Clone app ✓

2. **Filters & Search**:

   - Category filter works ✓
   - Status filter works ✓
   - Search by name ✓

3. **Form Validation**:

   - Required fields check ✓
   - Slug unique check ✓
   - JSON schema validation ✓

4. **API Routes**:
   - `/api/admin/apps` GET ✓
   - `/api/admin/apps` POST ✓
   - `/api/admin/apps/[id]` PUT ✓
   - `/api/admin/apps/[id]` DELETE ✓

#### 📁 Files để kiểm tra:

- `app/admin/apps/page.tsx`
- `app/api/admin/apps/route.ts`
- Form components

#### 🧪 Manual test:

```
1. Load http://localhost:3456/admin/apps
2. Create new app → save successfully
3. Edit app → save changes
4. Delete app → confirm & remove
5. Clone app → create copy
6. Filter by category/status
7. Stats modal → show data
```

---

## 📊 IMPLEMENTATION PRIORITY

```
Priority 1️⃣: TASK 1 (Prompt Categories Update)
   ↓ (Dễ, quick win)
Priority 2️⃣: TASK 2 (Verify User Mini App Page)
   ↓ (Verification only, should work)
Priority 3️⃣: TASK 3 (Verify Admin Mini App Page)
   ↓ (Verification + potential fixes, most complex)
```

---

## 🚀 EXECUTION CHECKLIST

### PRE-WORK:

- [ ] Read this file completely
- [ ] Check PLAN-SESSION-10.md for detailed info
- [ ] Backup database
- [ ] Start dev server: `npm run dev` (port 3456)

### TASK 1 EXECUTION:

- [ ] Open `app/admin/prompts/page.tsx`
- [ ] Find CATEGORIES constant (line ~19-23)
- [ ] Replace with new categories
- [ ] Update UI (colors, badges, icons)
- [ ] Test create/edit/filter prompts
- [ ] Mark TASK 1 ✅ COMPLETED

### TASK 2 EXECUTION:

- [ ] Check `/api/apps` endpoint
- [ ] Load `/apps` page in browser
- [ ] Test category filters
- [ ] Test app selection
- [ ] Verify mobile layout
- [ ] Mark TASK 2 ✅ COMPLETED (or note issues)

### TASK 3 EXECUTION:

- [ ] Check `/api/admin/apps` endpoints
- [ ] Load `/admin/apps` page
- [ ] Test create/edit/delete
- [ ] Test clone function
- [ ] Test filters
- [ ] Verify stats
- [ ] Mark TASK 3 ✅ COMPLETED (or note issues)

### POST-WORK:

- [ ] All tests passed
- [ ] No console errors
- [ ] Responsive layout ok
- [ ] Database data intact
- [ ] Update TODO-TroLyPhapLy.md
- [ ] Commit changes: `git commit -m "SESSION 10: Prompt Categories + Apps"`

---

## 💾 DATABASE INFO (Reference)

### Current Apps (in database):

- van-menh (Vận mệnh)
- tu-vi-chuyen-sau (Tử vi chuyên sâu)
- [Others...]

### Reference App Structure from FacebookApp:

```
Docs/FacebookApp/src/app/a/
├── tu-vi-chuyen-sau/    ← Existing app
├── van-menh/             ← Existing app
└── _template/            ← Use as template for new apps
```

---

## 📞 CONTACT POINTS

If issues found during TASK 2 or 3:

1. Check API response format
2. Verify endpoint exists in API routes
3. Check Prisma model fields match
4. Verify database has data
5. Check console logs for errors

---

## ✨ SUCCESS CRITERIA

### ✅ TASK 1 SUCCESS:

- Categories changed from generic → specific
- UI shows category names in Vietnamese
- Can create prompts with each category
- Filtering works for all 4 categories
- No data loss

### ✅ TASK 2 SUCCESS:

- `/apps` page loads
- All published apps visible
- Category filtering works
- App click → navigate to detail
- No errors in console

### ✅ TASK 3 SUCCESS:

- `/admin/apps` page loads with auth
- Create/Edit/Delete/Clone all work
- Filters work
- Form validation works
- Stats display correctly

---

**Prepared by**: GitHub Copilot  
**Date**: December 8, 2025  
**Next Session**: [Pending user confirmation]
