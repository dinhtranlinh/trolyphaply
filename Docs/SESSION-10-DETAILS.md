# 📊 SESSION 10 - COMPARISON TABLE

## 🔄 CURRENT vs NEEDED STATE

### TASK 1: Prompt Management Categories

| Aspect                   | Current                                                                       | Needed                             | Status         |
| ------------------------ | ----------------------------------------------------------------------------- | ---------------------------------- | -------------- |
| **Categories**           | `writing`, `analysis`, `coding`, `creative`, `education`, `business`, `other` | `qa`, `mini_app`, `video`, `other` | ⚠️ Need change |
| **Display Names**        | None (raw values)                                                             | Vietnamese labels with icons       | ❌ Missing     |
| **UI Badges**            | Basic dropdown                                                                | Colored badges with icons          | ❌ Missing     |
| **Category Icons**       | None                                                                          | ❓ 🎨 🎬 📋                        | ❌ Missing     |
| **CRUD Operations**      | ✅ Working                                                                    | ✅ Should work same                | ✅ Ok          |
| **Filter Functionality** | ✅ Works                                                                      | ✅ Should work same                | ✅ Ok          |
| **Test Coverage**        | Partial                                                                       | Full (all 4 categories)            | ⚠️ Need more   |

---

### TASK 2: User Mini App Catalog Page

| Aspect                | Current              | Needed         | Status               |
| --------------------- | -------------------- | -------------- | -------------------- |
| **Page Exists**       | ✅ Yes               | ✅ Yes         | ✅ Good              |
| **Layout**            | ✅ AppShell + Grid   | ✅ Same        | ✅ Good              |
| **Components**        | ✅ MiniAppCard       | ✅ Same        | ✅ Good              |
| **Category Filter**   | ✅ Chips             | ✅ Same        | ✅ Good              |
| **API Endpoint**      | ✅ `/api/apps`       | ✅ `/api/apps` | ✅ Good              |
| **Published Filter**  | ✅ Yes               | ✅ Yes         | ✅ Good              |
| **Navigation**        | ✅ To `/apps/[slug]` | ✅ Same        | ✅ Good              |
| **Empty State**       | ✅ Has               | ✅ Has         | ✅ Good              |
| **Mobile Responsive** | ✅ Yes               | ✅ Yes         | ✅ Good              |
| **Status**            | 🟢 LIKELY WORKING    | 🟢 Just verify | ✅ No changes needed |

---

### TASK 3: Admin Mini App Management Page

| Aspect              | Current                 | Needed         | Status              |
| ------------------- | ----------------------- | -------------- | ------------------- |
| **Page Exists**     | ✅ Yes (791 lines!)     | ✅ Yes         | ✅ Good             |
| **CRUD Create**     | ✅ Modal form           | ✅ Same        | ✅ Good             |
| **CRUD Read**       | ✅ Table list           | ✅ Same        | ✅ Good             |
| **CRUD Update**     | ✅ Edit modal           | ✅ Same        | ✅ Good             |
| **CRUD Delete**     | ✅ Confirmation         | ✅ Same        | ✅ Good             |
| **Clone Function**  | ✅ Yes                  | ✅ Yes         | ✅ Good             |
| **Category Filter** | ✅ tuvi, greeting, etc. | ✅ Same        | ✅ Good             |
| **Status Filter**   | ✅ draft, published     | ✅ Same        | ✅ Good             |
| **Advanced Form**   | ✅ JSON editors         | ✅ Same        | ✅ Good             |
| **Stats Modal**     | ✅ Yes                  | ✅ Yes         | ✅ Good             |
| **Form Validation** | ✅ Has                  | ✅ Has         | ✅ Good             |
| **Status**          | 🟢 LIKELY WORKING       | 🟢 Just verify | ⚠️ Check for issues |

---

## 📁 FILES INVOLVED

### TASK 1 FILES:

```
MAIN FILE TO MODIFY:
  app/admin/prompts/page.tsx (516 lines)
    ├─ Line 19-23: CATEGORIES constant ← MAIN CHANGE
    ├─ Line 52-55: categoryFilter state
    ├─ Line 98-104: Category dropdown in form
    └─ Line 402-432: Category filter display

SUPPORTING FILES (Check/Verify):
  components/content/PromptCard.tsx (if exists)
  app/api/prompts/route.ts (GET, POST, PUT, DELETE)
```

### TASK 2 FILES:

```
MAIN FILE TO VERIFY:
  app/apps/page.tsx (160 lines)
    ├─ Line 30-36: categories array
    ├─ Line 48-55: fetchApps function
    └─ Line 72-95: category filter rendering

API TO VERIFY:
  app/api/apps/route.ts
    └─ Should return: { success, apps[] }

SUPPORTING FILES (Check):
  components/content/MiniAppCard.tsx
  app/apps/[slug]/page.tsx (detail page)
```

### TASK 3 FILES:

```
MAIN FILE TO VERIFY:
  app/admin/apps/page.tsx (791 lines!)
    ├─ Line 23-24: CATEGORIES & TYPES
    ├─ Line 98-120: fetchApps function
    ├─ Line 140-200: Create/Edit form
    ├─ Line 250-300: Delete confirmation
    └─ Line 400-450: Filter rendering

API ROUTES TO VERIFY:
  app/api/admin/apps/route.ts
    ├─ GET /api/admin/apps (list)
    ├─ POST /api/admin/apps (create)
    ├─ PUT /api/admin/apps/[id] (update)
    └─ DELETE /api/admin/apps/[id] (delete)
```

---

## 🎨 DESIGN CHANGES FOR TASK 1

### Current Category Dropdown:

```tsx
<select value={categoryFilter}>
  <option value="">All</option>
  <option value="writing">writing</option>
  <option value="analysis">analysis</option>
  <!-- ... -->
</select>
```

### New Category Dropdown WITH ICONS:

```tsx
<select value={categoryFilter}>
  <option value="">All Categories</option>
  <option value="qa">❓ Hỏi đáp Pháp Luật</option>
  <option value="mini_app">🎨 Ứng Dụng AI</option>
  <option value="video">🎬 Video Prompts</option>
  <option value="other">📋 Khác</option>
</select>
```

### Category Badge Display:

```tsx
{
  /* Instead of plain text, show badge */
}
<span
  className="px-3 py-1 rounded-full text-sm font-medium"
  style={{
    backgroundColor: getCategoryColor(prompt.category),
    color: getCategoryTextColor(prompt.category),
  }}
>
  {getCategoryLabel(prompt.category)}
</span>;
```

### Category Colors:

- `qa` → `bg-blue-100 text-blue-900` (❓ blue)
- `mini_app` → `bg-purple-100 text-purple-900` (🎨 purple)
- `video` → `bg-pink-100 text-pink-900` (🎬 pink)
- `other` → `bg-gray-100 text-gray-900` (📋 gray)

---

## ✅ VERIFICATION CHECKLIST

### Before Starting:

- [ ] Dev server running on port 3456
- [ ] Can access `/admin/dashboard`
- [ ] Admin logged in
- [ ] Database has sample data

### During TASK 1:

- [ ] Categories changed ✓
- [ ] UI updated with badges ✓
- [ ] Can create prompt with each category ✓
- [ ] Can filter by each category ✓
- [ ] Can edit prompt and category persists ✓
- [ ] No console errors ✓

### During TASK 2:

- [ ] `/apps` page loads ✓
- [ ] All published apps show ✓
- [ ] Category filter works ✓
- [ ] Click app navigates correctly ✓
- [ ] No console errors ✓
- [ ] Mobile view responsive ✓

### During TASK 3:

- [ ] `/admin/apps` page loads ✓
- [ ] Can create new app ✓
- [ ] Can edit existing app ✓
- [ ] Can delete app ✓
- [ ] Clone function works ✓
- [ ] Filters work (category, status) ✓
- [ ] Stats display ✓
- [ ] Form validation works ✓
- [ ] No console errors ✓

---

## 📊 DATABASE SCHEMA (Reference)

### Prompt Table:

```sql
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,  ← CHANGE VALUES
  tags TEXT[],
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### App Table:

```sql
CREATE TABLE apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  status VARCHAR(20),
  type VARCHAR(50),
  input_schema JSONB,
  prompt_template TEXT,
  output_schema JSONB,
  render_config JSONB,
  share_config JSONB,
  limits JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔗 DEPENDENCY FLOW

```
┌─────────────────────────────────────┐
│   SESSION 10 STARTS                 │
└────────────┬────────────────────────┘
             │
             ├──→ TASK 1: Update Categories
             │    (Independent, UI + Constants)
             │    └──→ DONE: Mark ✅
             │
             ├──→ TASK 2: Verify User Page
             │    (Check /api/apps works)
             │    └──→ DONE or NOTED: Mark ✅
             │
             └──→ TASK 3: Verify Admin Page
                  (Check /api/admin/apps works)
                  └──→ DONE or FIXED: Mark ✅

             When ALL 3 DONE:
             ├──→ Update TODO-TroLyPhapLy.md
             ├──→ Commit: git commit
             └──→ SESSION 10 COMPLETE! 🎉
```

---

## 🎯 SUCCESS METRICS

| Task   | Success Rate | Blockers   | Notes                              |
| ------ | ------------ | ---------- | ---------------------------------- |
| TASK 1 | 100%         | None       | Quick change, should be easy       |
| TASK 2 | ~80%         | Verify API | Page likely working, just confirm  |
| TASK 3 | ~70%         | API routes | Many moving parts, careful testing |

---

## 📝 NOTES

1. **Database Migration**: Old prompts with old categories won't show in new filters

   - Solution: Can manually update old prompts or create migration script
   - For now: Just create new prompts with new categories

2. **Mini App Categories Alignment**:

   - Admin (TASK 3): `tuvi`, `greeting`, `poetry`, `caption`, `other`
   - User (TASK 2): "Tử vi", "Lời chúc", "Thơ", "Caption", "Khác"
   - These can stay as-is, don't need change

3. **Prompt Categories Separate**:

   - Prompts have: `qa`, `mini_app`, `video`, `other`
   - Mini Apps have: `tuvi`, `greeting`, `poetry`, `caption`, `other`
   - Different systems, different categories = OK! ✓

4. **Facebook App Reference**:
   - Use `Docs/FacebookApp/src/app/a/tu-vi-chuyen-sau` as template
   - Use `Docs/FacebookApp/src/app/a/van-menh` as example
   - Already migrated to trolyphaply database

---

**Created**: December 8, 2025  
**Prepared By**: GitHub Copilot  
**Ready to Execute**: ✅ YES
