# 📋 KẾ HOẠCH SESSION 10 - Quản Lý Prompt & Mini App

> **Date**: December 8, 2025  
> **Status**: 📝 Lên kế hoạch  
> **Tasks**: 3 công việc chính

---

## 🎯 MỤC TIÊU SESSION 10

Hoàn thiện hệ thống quản lý **Prompt** và **Mini App**:

1. **Nâng cấp Prompt Management**: `/admin/prompts` với categories chuẩn hóa (qa, mini_app, video, other)
2. **Xây dựng User Mini App Catalog**: `/apps` - Danh sách ứng dụng AI cho người dùng
3. **Xây dựng Admin Mini App Management**: `/admin/apps` - Quản trị mini apps (đã tồn tại, cần kiểm tra)

---

## 📊 TRẠNG THÁI CODE HIỆN TẠI

### 1. Prompt Management (`/admin/prompts`) - ✅ TỒN TẠI

**Location**: `app/admin/prompts/page.tsx` (516 lines)

**Current Status**:

- ✅ Trang CRUD prompts đã tồn tại
- ✅ Category filter dropdown đã có
- ⚠️ Categories không chuẩn hóa: `['writing', 'analysis', 'coding', 'creative', 'education', 'business', 'other']`
- ✅ Create/Edit/Delete modals có
- ✅ Public/Private toggle có
- ❌ **Cần nâng cấp**: Category names không phù hợp với TroLyPhapLy

**Current Categories**: writing, analysis, coding, creative, education, business, other

**Needed Categories**:

- `qa` - Hỏi đáp Pháp Luật (Q&A legal questions)
- `mini_app` - Ứng Dụng AI (Mini App prompts)
- `video` - Video Prompts (Video generation)
- `other` - Khác (Other)

**API Used**: `/api/prompts` (GET, POST, PUT, DELETE)

---

### 2. Mini App Catalog (`/apps`) - ✅ TỒN TẠI + HOẠT ĐỘNG

**Location**: `app/apps/page.tsx` (160 lines)

**Current Status**:

- ✅ Page tồn tại với AppShell layout
- ✅ Category filters có (Tất cả, Tử vi, Lời chúc, Thơ, Caption, Khác)
- ✅ MiniAppCard component được sử dụng
- ✅ Fetch từ `/api/apps?published=true`
- ✅ Navigate to `/apps/[slug]` khi click

**Current Features**:

- Search/Filter by category
- Published filter
- Card layout with click handler
- Empty state

**API Used**: `/api/apps` (GET list with filters)

**Status**: ✅ Functional, no changes needed!

---

### 3. Admin Apps Management (`/admin/apps`) - ✅ TỒN TẠI

**Location**: `app/admin/apps/page.tsx` (791 lines)

**Current Status**:

- ✅ Trang CRUD apps đã tồn tại
- ✅ Full CRUD operations
- ✅ Category filters: ['tuvi', 'greeting', 'poetry', 'caption', 'other']
- ✅ Status filters: 'all', etc.
- ✅ Advanced form with JSON editors
- ✅ Clone functionality
- ✅ Stats modal

**Current Features**:

- App listing with search, category, status filters
- Create/Edit/Delete modals
- Advanced settings (JSON for schema, config, etc.)
- Clone app functionality
- Stats tracking

**API Used**: `/api/admin/apps` (GET list, POST create, PUT update, DELETE)

**Status**: ✅ Functional, may need minor updates

---

## 📊 DATABASE SCHEMA

### Prisma Models

```
✅ Prompt Model:
  - id (String, uuid, PK)
  - title (String)
  - body (Text)
  - category (String) ⬅️ NEEDS CATEGORIES: qa, mini_app, video, other
  - tags (String[])
  - isPublic (Boolean)
  - createdAt (DateTime)
  - updatedAt (DateTime)

✅ App Model:
  - id (String, uuid, PK)
  - slug (String, unique)
  - name (String)
  - description (String?)
  - category (String)
  - status (String)
  - type (String)
  - inputSchema (Json)
  - promptTemplate (Text)
  - outputSchema (Json?)
  - renderConfig (Json?)
  - shareConfig (Json?)
  - limits (Json?)
  - createdAt (DateTime)
  - updatedAt (DateTime)
  - results[] (Relation)
  - statsDaily[] (Relation)
  - events[] (Relation)

✅ Result Model: (linked to App)
  - id, appId, inputData, outputData, imageUrl, metadata, createdAt

✅ AppStatsDaily Model: (linked to App)
  - appId, date, views, submits, shares, affiliateClicks
```

**Schema Status**: ✅ Hoàn thiện, đủ fields

---

## 🔍 KIỂM TRA FACEBOOK APP REFERENCE

### Location: `Docs/FacebookApp/src/app`

**Các mini app tồn tại**:

1. `a/tu-vi-chuyen-sau/` - Tử vi chuyên sâu
2. `a/van-menh/` - Vận mệnh
3. `_template/` - Template cho mini app mới

**Cần tham khảo**:

- Component structure
- Form input schema
- Prompt template format
- Result display
- Share config

---

## ✅ TASK BREAKDOWN

### TASK 1️⃣: Nâng cấp Prompt Management (Priority: HIGH)

**Mục tiêu**: Cập nhật `/admin/prompts` với categories chuẩn hóa

**Subtasks**:

1. **Cập nhật CATEGORIES constant**:

   - Old: `['writing', 'analysis', 'coding', 'creative', 'education', 'business', 'other']`
   - New: `['qa', 'mini_app', 'video', 'other']`
   - Add display names:
     - `qa` → "Hỏi đáp Pháp Luật"
     - `mini_app` → "Ứng Dụng AI"
     - `video` → "Video Prompts"
     - `other` → "Khác"

2. **Cải thiện UI**:

   - Add category badges with colors (qa: blue, mini_app: purple, video: pink, other: gray)
   - Improve category select dropdown with icons/labels
   - Add visual indicators for category in table list

3. **Update form validation**:

   - Validate category against enum
   - Add placeholder text mentioning category purpose

4. **Test**:
   - Create new prompts in each category
   - Filter by category
   - Edit and verify category persists

**Files to Modify**:

- `app/admin/prompts/page.tsx`

**Time Estimate**: 1-2 hours

---

### TASK 2️⃣: User Mini App Catalog (Priority: MEDIUM)

**Mục tiêu**: Xác minh `/apps` hoạt động đúng

**Subtasks**:

1. **Verify Current Implementation**:

   - Check `/api/apps` endpoint working
   - Verify published filter
   - Test category filtering
   - Test navigation to `/apps/[slug]`

2. **If Issues Found**:

   - Fix API response format
   - Update category handling
   - Ensure card display

3. **Enhance if Needed**:

   - Add sort options (newest, popular, trending)
   - Add view toggle (list/grid)
   - Better empty states
   - Search functionality

4. **Test Checklist**:
   - Load `/apps` page
   - Select different categories
   - Click on app → navigate to detail
   - Verify all apps show

**Files to Check**:

- `app/apps/page.tsx`
- `app/api/apps/route.ts`
- Components: `MiniAppCard`, `Chip`, `EmptyState`

**Time Estimate**: 0.5-1 hour (mostly verification)

---

### TASK 3️⃣: Admin Mini App Management (Priority: MEDIUM)

**Mục tiêu**: Xác minh `/admin/apps` hoạt động đúng

**Subtasks**:

1. **Verify Current Implementation**:

   - Check CRUD operations working
   - Test create/edit/delete
   - Verify status filters
   - Test clone functionality

2. **If Issues Found**:

   - Fix API routes
   - Update form validation
   - Fix JSON editors

3. **Enhancement Ideas**:

   - Import apps from FacebookApp structure
   - Template selector for quick create
   - Preview generator
   - Better schema validation

4. **Test Checklist**:
   - Load `/admin/apps` page
   - Create new app
   - Edit existing app
   - Delete app (with confirmation)
   - Clone app
   - Filter by category and status
   - Check stats modal

**Files to Check**:

- `app/admin/apps/page.tsx`
- `app/api/admin/apps/route.ts` (GET, POST, PUT, DELETE)
- Components and form fields

**Time Estimate**: 1-2 hours (depends on issues found)

---

## 🔄 DEPENDENCY ORDER

```
TASK 1 (Prompt Categories) ←→ Independent
         ↓
TASK 2 (User Mini App Catalog) ← Depends on /api/apps
         ↓
TASK 3 (Admin Mini App Mgmt) ← Depends on /api/admin/apps
```

**Recommended Order**:

1. **TASK 1** (Nâng cấp Prompt Categories) - Quick win, improves user experience
2. **TASK 2** (Verify User Mini App Page) - Should already work, just verify
3. **TASK 3** (Verify Admin Mini App Management) - Should already work, just verify

---

## 📋 ACCEPTANCE CRITERIA

### TASK 1: Prompt Management ✅ DONE

- [ ] Categories changed to: qa, mini_app, video, other
- [ ] Category display names show in Vietnamese
- [ ] Category badges display with distinct colors
- [ ] Category filter works correctly
- [ ] New prompts save with correct category
- [ ] Can filter prompts by each category
- [ ] Dashboard shows category statistics

### TASK 2: User Mini App Catalog ✅ VERIFIED

- [ ] Page `/apps` loads correctly
- [ ] All published apps display
- [ ] Category filtering works
- [ ] Click on app navigates to detail
- [ ] Empty state shows when no apps
- [ ] Mobile responsive layout

### TASK 3: Admin Mini App Management ✅ VERIFIED

- [ ] Page `/admin/apps` loads with authentication
- [ ] Create new app works
- [ ] Edit existing app works
- [ ] Delete with confirmation works
- [ ] Clone app works
- [ ] Filters (category, status) work
- [ ] Stats display correctly
- [ ] Form validation works

---

## 🚀 IMPLEMENTATION NOTES

### For Prompt Categories:

**Old Categories** (generic):

```typescript
const CATEGORIES = [
  "writing",
  "analysis",
  "coding",
  "creative",
  "education",
  "business",
  "other",
];
```

**New Categories** (TroLyPhapLy specific):

```typescript
interface CategoryConfig {
  value: string;
  label: string;
  description: string;
  color: string;
  icon: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    value: "qa",
    label: "Hỏi đáp Pháp Luật",
    description: "Prompts cho hệ thống Q&A pháp lý",
    color: "bg-blue-100 text-blue-900",
    icon: "❓",
  },
  {
    value: "mini_app",
    label: "Ứng Dụng AI",
    description: "Prompts cho các mini app vui",
    color: "bg-purple-100 text-purple-900",
    icon: "🎨",
  },
  {
    value: "video",
    label: "Video Prompts",
    description: "Prompts cho video generation",
    color: "bg-pink-100 text-pink-900",
    icon: "🎬",
  },
  {
    value: "other",
    label: "Khác",
    description: "Các loại prompt khác",
    color: "bg-gray-100 text-gray-900",
    icon: "📋",
  },
];
```

### For Mini App Catalog:

Categories should align with admin apps:

- `tuvi` → Tử vi
- `greeting` → Lời chúc
- `poetry` → Thơ
- `caption` → Caption
- `other` → Khác

Make sure `/api/apps` returns:

```json
{
  "success": true,
  "apps": [
    {
      "slug": "van-menh",
      "name": "Vận Mệnh",
      "description": "...",
      "category": "tuvi",
      "icon": "...",
      "published": true
    }
  ]
}
```

---

## 🎬 NEXT STEPS

1. **Lên lịch Session 10**:

   - Ngày: [Chọn ngày tiếp theo]
   - Thời gian: [Chọn giờ]

2. **Chuẩn bị**:

   - Backup database
   - Create feature branch `session-10-prompts-apps`

3. **Thực hiện tuần tự**:

   - TASK 1: Nâng cấp Prompt Categories
   - TASK 2: Verify Mini App User Page
   - TASK 3: Verify Admin Mini App Page

4. **Testing**:

   - Manual testing trên browser
   - Test all filters và CRUD operations
   - Responsive design check (mobile/desktop)

5. **Deployment**:
   - Test trên dev (port 3456)
   - Merge to production (port 8686)

---

## 📝 NOTES

- Prompt Categories cần migrate data từ old categories → new categories (optional, có thể keep old data)
- Mini App Catalog page đã tồn tại, probably just needs verification
- Admin Apps page đã tồn tại với CRUD, probably just needs verification
- Reference FacebookApp structure nếu cần implement apps
- Remember: Dev port = 3456, Production port = 8686

---

**Created by**: GitHub Copilot  
**Last Updated**: December 8, 2025
