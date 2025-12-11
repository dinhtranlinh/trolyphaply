# 🚀 SESSION 10 - EXECUTION CHECKLIST

> **Date**: December 8, 2025  
> **Status**: 📝 Ready to Execute  
> **Est. Time**: 3-4 hours total

---

## ✅ PRE-EXECUTION CHECKLIST

### Environment Setup:

- [ ] Read `PLAN-SESSION-10.md` (detailed plan)
- [ ] Read `SESSION-10-SUMMARY.md` (quick summary)
- [ ] Read `SESSION-10-DETAILS.md` (technical details)
- [ ] Dev server running: `npm run dev` (port 3456)
- [ ] Can access http://localhost:3456/admin
- [ ] Admin logged in: admin@trolyphaply.vn / LamKhanh1823$$$

### Database:

- [ ] Backup database before making changes
- [ ] Verify database connection active
- [ ] Check sample prompts exist (for testing)
- [ ] Check sample apps exist (for testing)

### Git:

- [ ] Create feature branch: `git checkout -b session-10-prompts-apps`
- [ ] Or work on main if allowed

---

## 🔴 TASK 1: Nâng cấp Trang Quản Lý Prompt (~1.5 hours)

### Step 1.1: Open File

- [ ] Open: `app/admin/prompts/page.tsx`
- [ ] Find line 19-23 (CATEGORIES constant)

### Step 1.2: Update Categories Constant

**Find This**:

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

**Replace With**:

```typescript
interface CategoryConfig {
  value: string;
  label: string;
  description: string;
  color: string;
  badgeClass: string;
  icon: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    value: "qa",
    label: "Hỏi đáp Pháp Luật",
    description: "Prompts cho hệ thống Q&A pháp lý",
    color: "blue",
    badgeClass: "bg-blue-100 text-blue-900",
    icon: "❓",
  },
  {
    value: "mini_app",
    label: "Ứng Dụng AI",
    description: "Prompts cho các mini app vui",
    color: "purple",
    badgeClass: "bg-purple-100 text-purple-900",
    icon: "🎨",
  },
  {
    value: "video",
    label: "Video Prompts",
    description: "Prompts cho video generation",
    color: "pink",
    badgeClass: "bg-pink-100 text-pink-900",
    icon: "🎬",
  },
  {
    value: "other",
    label: "Khác",
    description: "Các loại prompt khác",
    color: "gray",
    badgeClass: "bg-gray-100 text-gray-900",
    icon: "📋",
  },
];
```

### Step 1.3: Update Category Dropdown in Form

**Find This** (around line 98-104):

```tsx
<label className="block text-sm font-medium">Category</label>
<select
  value={formData.category}
  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
  className="w-full p-2 border rounded"
>
  {CATEGORIES.map((cat) => (
    <option key={cat} value={cat}>{cat}</option>
  ))}
</select>
```

**Replace With**:

```tsx
<label className="block text-sm font-medium">Category</label>
<select
  value={formData.category}
  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
  className="w-full p-2 border rounded"
>
  {CATEGORIES.map((cat) => (
    <option key={cat.value} value={cat.value}>
      {cat.icon} {cat.label}
    </option>
  ))}
</select>
```

### Step 1.4: Add Helper Functions

**Add After CATEGORIES Definition**:

```typescript
function getCategoryLabel(value: string): string {
  const cat = CATEGORIES.find((c) => c.value === value);
  return cat ? `${cat.icon} ${cat.label}` : value;
}

function getCategoryBadgeClass(value: string): string {
  const cat = CATEGORIES.find((c) => c.value === value);
  return cat ? cat.badgeClass : "bg-gray-100 text-gray-900";
}
```

### Step 1.5: Update Table Display (Category Column)

**Find This** (in the table rendering section, look for category display):

```tsx
{
  /* Old: plain text category */
}
<td>{prompt.category}</td>;
```

**Replace With**:

```tsx
<td>
  <span
    className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryBadgeClass(
      prompt.category
    )}`}
  >
    {getCategoryLabel(prompt.category)}
  </span>
</td>
```

### Step 1.6: Test TASK 1

- [ ] Save file & check for errors
- [ ] Load http://localhost:3456/admin/prompts
- [ ] Test: Create new prompt
  - [ ] Select category "qa" from dropdown
  - [ ] See icon + label
  - [ ] Save & verify in list
- [ ] Test: Create prompt "mini_app"
  - [ ] See 🎨 icon
- [ ] Test: Create prompt "video"
  - [ ] See 🎬 icon
- [ ] Test: Filter by category
  - [ ] Click category filter
  - [ ] See only prompts of that category
- [ ] Test: Edit prompt
  - [ ] Change category
  - [ ] Save
  - [ ] Verify badge updates
- [ ] Check console for errors
  - [ ] No red errors in console
  - [ ] No warnings about missing props

### ✅ Mark TASK 1 COMPLETE

- [ ] All tests passed
- [ ] Commit: `git add app/admin/prompts/page.tsx && git commit -m "SESSION 10: Update prompt categories"`

---

## 🟡 TASK 2: Xác minh Trang Mini App User (~30 mins)

### Step 2.1: Verify Endpoint

- [ ] Open: `app/api/apps/route.ts`
- [ ] Check GET handler exists
- [ ] Verify response format:
  ```json
  { "success": true, "apps": [...] }
  ```

### Step 2.2: Test Page

- [ ] Load http://localhost:3456/apps
- [ ] See "✨ Ứng dụng AI Vui" title
- [ ] See category filter chips
- [ ] See app cards displayed

### Step 2.3: Test Features

- [ ] Click category chip → filter works
- [ ] Click app card → navigate to `/apps/[slug]`
- [ ] Load `/apps/van-menh` (detail page)
- [ ] See app details displayed
- [ ] Mobile view (responsive)

### Step 2.4: Test Edge Cases

- [ ] No apps published → empty state
- [ ] Filter with no results → empty state
- [ ] Click "Tạo ngay ✨" button → load form
- [ ] Fill form & submit → see result

### Step 2.5: Check Console

- [ ] No red errors
- [ ] No 404 errors for API
- [ ] Network tab shows `/api/apps` request success

### ✅ Mark TASK 2 COMPLETE or NOTE ISSUES

- [ ] If working: `git add ... && git commit -m "SESSION 10: Verify mini apps page"`
- [ ] If issues: Document in SESSION-10-DEBUG.md

---

## 🟡 TASK 3: Xác minh Trang Quản Trị Mini App (~1.5 hours)

### Step 3.1: Verify Admin Page Loads

- [ ] Load http://localhost:3456/admin/apps
- [ ] See page with app list
- [ ] See "Create New App" button

### Step 3.2: Test CREATE

- [ ] Click "Create New App"
- [ ] Fill form:
  - [ ] Slug: `test-app-123`
  - [ ] Name: `Test App`
  - [ ] Description: `Test description`
  - [ ] Category: Select one
  - [ ] Status: `draft`
- [ ] Click Save
- [ ] [ ] See success message
- [ ] Verify app appears in list

### Step 3.3: Test READ (List)

- [ ] See all apps in table
- [ ] See columns: Name, Category, Status, Created, Actions
- [ ] Apps with correct data

### Step 3.4: Test FILTER

- [ ] Category filter dropdown
  - [ ] Select category → list filters
  - [ ] Select "all" → show all
- [ ] Status filter dropdown
  - [ ] Select status → list filters
  - [ ] Check both filters work together

### Step 3.5: Test SEARCH

- [ ] Search box at top
- [ ] Type app name → filter works
- [ ] Clear search → show all

### Step 3.6: Test UPDATE (Edit)

- [ ] Click edit icon on an app
- [ ] Change name/description
- [ ] Click Save
- [ ] Verify changes in list

### Step 3.7: Test DELETE

- [ ] Click delete icon
- [ ] See confirmation dialog
- [ ] Click "Confirm Delete"
- [ ] App removed from list

### Step 3.8: Test CLONE

- [ ] Click clone icon on app
- [ ] Enter new slug
- [ ] Click Clone
- [ ] New app appears in list
- [ ] Verify as copy of original

### Step 3.9: Test ADVANCED FEATURES

- [ ] Click app → Advanced tab
- [ ] See JSON fields (inputSchema, etc.)
- [ ] Edit JSON
- [ ] Save & verify persists

### Step 3.10: Test STATS

- [ ] Click stats icon (if exists)
- [ ] See stats modal
- [ ] Close modal

### Step 3.11: Check API Routes

- [ ] Browser Dev Tools → Network tab
- [ ] Watch API calls:
  - [ ] GET /api/admin/apps (list)
  - [ ] POST /api/admin/apps (create)
  - [ ] PUT /api/admin/apps/[id] (update)
  - [ ] DELETE /api/admin/apps/[id] (delete)
- [ ] All responses: 200 OK with proper JSON

### Step 3.12: Check Console

- [ ] No red errors
- [ ] No 404 errors
- [ ] No validation errors
- [ ] No database errors

### ✅ Mark TASK 3 COMPLETE or NOTE ISSUES

- [ ] If working: `git add ... && git commit -m "SESSION 10: Verify admin apps page"`
- [ ] If issues: Document in SESSION-10-DEBUG.md

---

## 📝 FINAL CHECKS

### Code Quality:

- [ ] No console.log spam
- [ ] No TypeScript errors
- [ ] Proper error handling
- [ ] Loading states work

### Database:

- [ ] Data integrity maintained
- [ ] No orphaned records
- [ ] Relationships intact

### UI/UX:

- [ ] All buttons responsive
- [ ] Forms validate properly
- [ ] Messages clear and helpful
- [ ] Mobile responsive

### Performance:

- [ ] Page load time acceptable
- [ ] No lag on interactions
- [ ] API responses fast

---

## 🎉 SESSION 10 COMPLETION

### Post-Execution:

- [ ] All 3 tasks marked COMPLETE ✅
- [ ] No critical issues found
- [ ] Console clean (no errors)
- [ ] Database intact

### Documentation Update:

- [ ] Update TODO-TroLyPhapLy.md:

  ```markdown
  ## ✅ SESSION 10: Prompt Categories + Mini Apps (COMPLETED)

  - ✅ TASK 1: Updated prompt categories (qa, mini_app, video, other)
  - ✅ TASK 2: Verified user mini app page (/apps)
  - ✅ TASK 3: Verified admin mini app management (/admin/apps)
  ```

### Git Commit:

```bash
git add -A
git commit -m "SESSION 10: Prompt Categories + Mini Apps - Complete

- Updated prompt categories to: qa, mini_app, video, other
- Enhanced prompt management UI with category badges
- Verified mini app user catalog page
- Verified admin mini app management page
- All tests passed, production ready"

git log --oneline -1
```

### Final Status:

```markdown
✅ SESSION 10 COMPLETED

- Prompt Management: Enhanced with new categories
- User Mini App Page: Verified working ✓
- Admin Mini App Page: Verified working ✓
- Ready for Production: YES
```

---

## 🆘 TROUBLESHOOTING

If you encounter issues:

### Issue: Categories not updating in dropdown

**Solution**:

1. Clear browser cache (Ctrl+Shift+Delete)
2. Restart dev server: `npm run dev`
3. Check TypeScript: No errors in IDE

### Issue: API returns 404

**Solution**:

1. Check endpoint exists in `app/api/` folder
2. Verify method name (GET, POST, PUT, DELETE)
3. Check console server logs for errors

### Issue: Database errors

**Solution**:

1. Check Prisma schema matches table structure
2. Run `npx prisma db push` if schema changed
3. Check database connection in .env

### Issue: Permission denied errors

**Solution**:

1. Check admin token in localStorage
2. Try logging out and back in
3. Check admin credentials in database

---

## 📞 QUICK REFERENCE

**Dev Server**: `npm run dev` (port 3456)  
**Admin URL**: http://localhost:3456/admin  
**Admin Credentials**: admin@trolyphaply.vn / LamKhanh1823$$$  
**Database**: Supabase PostgreSQL (icqivkassoxfaukqbzyt)  
**Feature Branch**: `session-10-prompts-apps`

**Task 1 Time**: ~1.5 hours  
**Task 2 Time**: ~0.5 hours  
**Task 3 Time**: ~1.5 hours  
**Total Time**: ~3.5 hours

---

**Prepared by**: GitHub Copilot  
**Date**: December 8, 2025  
**Status**: Ready for Execution ✅
