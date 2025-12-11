# TESTING & DEPLOYMENT GUIDE - TROLYPHAPLY

> **Project**: TroLyPhapLy - Legal Assistant Platform  
> **Date**: December 1, 2025  
> **Status**: Ready for SESSION 7 (Testing + Production Deployment)

---

## 📋 OVERVIEW

This guide covers comprehensive testing procedures and production deployment steps for the TroLyPhapLy platform.

**Current Status**:

- ✅ All TypeScript compilation errors fixed
- ✅ 8 database tables created and seeded
- ✅ 4 main user-facing pages complete (Home Q&A, Legal Library, Prompts Hub, Fun AI Apps)
- ✅ Admin dashboard with full CRUD operations
- ✅ PWA setup complete (manifest, service worker, icons, SEO)
- 🎯 Ready for testing and deployment

---

## 1. LOCAL TESTING PROCEDURES

### 1.1. Pre-Test Setup

```powershell
# Navigate to project
cd D:\DTL\trolyphaply

# Ensure dependencies are installed
npm install

# Verify environment variables
# Check .env file has all required variables:
# - DATABASE_URL
# - SUPABASE_URL, SUPABASE_SERVICE_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY
# - GEMINI_API_KEY_1, GEMINI_API_KEY_2, GEMINI_API_KEY_3, GEMINI_API_KEY_4
# - ADMIN_EMAIL, ADMIN_PASSWORD

# Start development server
npm run dev
```

**Expected Output**: Server running at http://localhost:3456

### 1.2. Manual Testing Checklist

#### ✅ Home Page (Legal Q&A Hub) - `/`

**Test Cases**:

- [ ] Page loads without errors
- [ ] Legal Q&A textarea is visible and accepts input (max 1000 chars)
- [ ] 6 suggestion chips are clickable and populate textarea
- [ ] Submit button works with loading state
- [ ] Gemini AI responds with legal advice
- [ ] Answer displays with icon and disclaimer
- [ ] 5 popular questions are visible and clickable
- [ ] 4 quick access links navigate correctly

**Test Steps**:

```
1. Open http://localhost:3456
2. Type question: "Thủ tục đăng ký kết hôn cần những gì?"
3. Click "Gửi câu hỏi"
4. Verify loading spinner appears
5. Verify AI response displays
6. Click a suggestion chip
7. Verify textarea is populated
8. Click each quick access link
```

#### ✅ Legal Library - `/law`

**Test Cases**:

- [ ] Page loads with documents and procedures
- [ ] Filter tabs work (All, Documents, Procedures)
- [ ] Search bar filters results in real-time
- [ ] Category filter in BottomSheet works
- [ ] Document cards display correct info
- [ ] Procedure cards display correct info
- [ ] Click on document navigates to detail page
- [ ] Empty state shows when no results

**Test Steps**:

```
1. Open http://localhost:3456/law
2. Verify documents and procedures display
3. Click "Văn bản" tab
4. Type in search: "luật"
5. Verify results filter
6. Click category filter button
7. Select "Dân sự" category
8. Verify filtered results
9. Click on a document card
```

#### ✅ Document Detail - `/law/doc/[id]`

**Test Cases**:

- [ ] Document title and code display
- [ ] Tags display (max 5 visible)
- [ ] Meta info card shows all fields
- [ ] Summary section displays
- [ ] Accordion chapters expand/collapse
- [ ] "Hỏi về văn bản này" button works
- [ ] Bookmark button toggles state
- [ ] Back button returns to library

**Test Steps**:

```
1. From Legal Library, click on a document
2. Verify all document info displays
3. Click on accordion chapters
4. Verify chapters expand/collapse
5. Click "Hỏi về văn bản này"
6. Verify redirects to home with pre-filled question
7. Click bookmark button
8. Verify state changes
9. Click back button
```

#### ✅ Prompts Hub - `/prompts`

**Test Cases**:

- [ ] Page loads with prompt list
- [ ] Search filters prompts
- [ ] Category chips filter correctly
- [ ] View toggle (list/grid) works
- [ ] "Tạo mới" button opens modal
- [ ] Create prompt form validates
- [ ] Edit prompt works
- [ ] Delete prompt confirms and removes
- [ ] Copy prompt shows toast
- [ ] Empty state displays when no results

**Test Steps**:

```
1. Open http://localhost:3456/prompts
2. Verify prompts display
3. Type in search: "pháp"
4. Click category chip
5. Click view toggle
6. Click "Tạo mới"
7. Fill form (title, body, category, tags, isPublic)
8. Submit form
9. Verify new prompt appears
10. Click "Sửa" on a prompt
11. Modify and save
12. Click "Xóa" and confirm
```

#### ✅ Prompt Detail - `/prompts/[id]`

**Test Cases**:

- [ ] Prompt title and category display
- [ ] Public/Private indicator shows
- [ ] Tags display correctly
- [ ] Prompt body in monospace
- [ ] Metadata card shows dates
- [ ] "Copy Prompt" button works
- [ ] Toast notification shows on copy
- [ ] "Sửa" navigates to edit
- [ ] "Nhân bản" duplicates prompt

**Test Steps**:

```
1. From Prompts Hub, click on a prompt
2. Verify all prompt details display
3. Click "Copy Prompt"
4. Verify toast shows
5. Verify clipboard contains prompt
6. Click "Sửa"
7. Click "Nhân bản"
```

#### ✅ Fun AI Apps Catalog - `/apps`

**Test Cases**:

- [ ] Page loads with app grid
- [ ] Category chips filter apps
- [ ] App cards display name, description, category
- [ ] Click app navigates to execution page
- [ ] Empty state when no apps in category

**Test Steps**:

```
1. Open http://localhost:3456/apps
2. Verify 2 migrated apps display (van-menh, tu-vi-chuyen-sau)
3. Click category chips
4. Click on "Vận Mệnh Của Bạn" app
```

#### ✅ App Execution Page - `/apps/[slug]`

**Test Cases**:

- [ ] App loads with correct name and description
- [ ] Input form renders based on inputSchema
- [ ] All field types work (text, textarea, select, radio, checkbox, date, number)
- [ ] Required validation works
- [ ] Submit button disables during processing
- [ ] AI generates result
- [ ] Result displays with proper formatting
- [ ] Share buttons work
- [ ] "Tạo mới" clears form and result
- [ ] Error handling shows user-friendly message

**Test Steps**:

```
1. From Apps catalog, click "Vận Mệnh Của Bạn"
2. Fill all required fields:
   - Họ và tên
   - Ngày sinh
   - Giới tính
3. Click "Tạo nội dung"
4. Verify loading spinner
5. Verify AI result displays
6. Click "Tạo mới"
7. Verify form clears
```

#### ✅ Admin Login - `/admin/login`

**Test Cases**:

- [ ] Login form displays
- [ ] Email and password validation
- [ ] Wrong credentials show error
- [ ] Correct credentials redirect to dashboard
- [ ] Session cookie persists

**Test Steps**:

```
1. Open http://localhost:3456/admin/login
2. Try wrong email: test@test.com / wrongpass
3. Verify error shows
4. Enter correct credentials:
   - Email: admin@trolyphaply.vn
   - Password: TroLy@PhapLy2026
5. Click "Đăng nhập"
6. Verify redirects to /admin
```

#### ✅ Admin Dashboard - `/admin`

**Test Cases**:

- [ ] Dashboard loads with statistics
- [ ] 4 stat cards display (Documents, Procedures, Prompts, Apps)
- [ ] Quick action buttons navigate correctly
- [ ] Recent activity shows (if implemented)
- [ ] Logout button works

**Test Steps**:

```
1. After login, verify at /admin
2. Check all stat cards have numbers
3. Click each quick action button
4. Verify navigation
5. Click "Đăng xuất"
6. Verify redirects to /admin/login
```

#### ✅ Admin Documents Management - `/admin/documents`

**Test Cases**:

- [ ] Table loads with documents
- [ ] Search filters documents
- [ ] Category filter works
- [ ] "Thêm văn bản" opens modal
- [ ] Create form validates all fields
- [ ] Submit creates new document
- [ ] "Sửa" loads document in modal
- [ ] Update saves changes
- [ ] "Xóa" confirms and deletes
- [ ] Toast notifications show

**Test Steps**:

```
1. Open http://localhost:3456/admin/documents
2. Verify table displays documents
3. Search: "luật"
4. Select category filter
5. Click "Thêm văn bản"
6. Fill form:
   - Tên văn bản
   - Số VB
   - Loại (Luật, Nghị định, etc.)
   - Lĩnh vực
   - Cơ quan ban hành
   - Ngày ban hành (date picker)
   - Ngày hiệu lực (date picker)
   - Tóm tắt
   - Nội dung (JSON)
   - Tags
   - Trạng thái
7. Submit
8. Verify new document in table
9. Click "Sửa" on document
10. Modify and save
11. Click "Xóa" and confirm
```

#### ✅ Admin Procedures Management - `/admin/procedures`

**Test Cases**:

- [ ] Table loads with procedures
- [ ] Search and filter work
- [ ] Create modal validates
- [ ] Steps JSON format helper text shows
- [ ] Documents JSON format helper text shows
- [ ] Submit creates procedure
- [ ] Edit and delete work

**Test Steps**:

```
1. Open http://localhost:3456/admin/procedures
2. Click "Thêm thủ tục"
3. Fill form:
   - Tên thủ tục
   - Cơ quan thực hiện
   - Thời gian ước tính
   - Lĩnh vực
   - Các bước (JSON format)
   - Hồ sơ cần thiết (JSON)
   - Lệ phí
   - Ghi chú
   - Tags
4. Submit
5. Verify in table
6. Test edit and delete
```

#### ✅ Admin Prompts Management - `/admin/prompts`

**Test Cases**:

- [ ] Table loads with prompts
- [ ] Search and category filter work
- [ ] Inline toggle public/private works
- [ ] Create modal validates character limits
- [ ] Title maxLength 200 with counter
- [ ] Body maxLength 5000 with counter
- [ ] Public checkbox toggles
- [ ] CRUD operations work

**Test Steps**:

```
1. Open http://localhost:3456/admin/prompts
2. Verify table displays
3. Click public/private toggle on a prompt
4. Verify state changes
5. Click "Thêm prompt"
6. Type long title (>200 chars)
7. Verify character counter
8. Fill body (test counter)
9. Check "Công khai"
10. Submit
11. Test edit and delete
```

#### ✅ Admin Apps Management - `/admin/apps`

**Test Cases**:

- [ ] Table loads with apps
- [ ] Search, category, status filters work
- [ ] Inline toggle published/draft works
- [ ] Stats button opens modal with 4 metrics
- [ ] Clone button prompts for new slug
- [ ] Create modal has slug validation
- [ ] JSON editors for inputSchema, promptTemplate
- [ ] Advanced configs in accordion
- [ ] Slug uniqueness check
- [ ] CRUD operations work

**Test Steps**:

```
1. Open http://localhost:3456/admin/apps
2. Verify 2 apps display
3. Click stats button (📊)
4. Verify modal shows Views, Submits, Shares, Results
5. Close modal
6. Click clone button (📋) on "van-menh"
7. Enter new slug: "van-menh-copy"
8. Verify cloned app created
9. Click "Thêm app"
10. Fill form:
    - Slug (unique)
    - Tên app
    - Mô tả
    - Danh mục
    - Loại
    - Input Schema (JSON)
    - Prompt Template (mustache syntax)
    - Optional: Output Schema, Render Config, Share Config, Limits
11. Submit
12. Test edit and delete
```

#### ✅ PWA Features

**Test Cases**:

- [ ] Manifest loads at /manifest.json
- [ ] Service worker registers
- [ ] App is installable (Chrome/Edge)
- [ ] Icons load correctly
- [ ] Offline page works
- [ ] Theme color applies to status bar
- [ ] App shortcuts work after install

**Test Steps**:

```
1. Open Chrome DevTools → Application tab
2. Click "Manifest"
3. Verify manifest loads with:
   - Name: "Trợ Lý Pháp Lý"
   - Theme color: #0B3B70
   - Icons: 192x192, 512x512
   - Shortcuts: 4 items
4. Click "Service Workers"
5. Verify sw.js registered
6. Check "Offline" checkbox
7. Navigate to pages
8. Verify content loads from cache
9. Desktop: Click install icon in address bar
10. Mobile: "Add to Home Screen"
```

### 1.3. Performance Testing

#### Lighthouse Audit

```powershell
# Run Lighthouse on key pages
# Target scores: Performance 90+, Accessibility 90+, Best Practices 95+, SEO 100, PWA 100

# In Chrome DevTools:
# 1. F12 → Lighthouse tab
# 2. Select categories: Performance, Accessibility, Best Practices, SEO, PWA
# 3. Device: Mobile (default)
# 4. Click "Analyze page load"
```

**Pages to test**:

- Home `/`
- Legal Library `/law`
- Document Detail `/law/doc/[id]`
- Prompts Hub `/prompts`
- Apps Catalog `/apps`
- App Execution `/apps/van-menh`

**Target Metrics**:

- **Performance**: 90+ (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- **Accessibility**: 90+ (WCAG AA compliance)
- **Best Practices**: 95+
- **SEO**: 100 (meta tags, sitemap, robots.txt)
- **PWA**: 100 (manifest, service worker, installable)

#### Core Web Vitals

```
Largest Contentful Paint (LCP): < 2.5s
First Input Delay (FID): < 100ms
Cumulative Layout Shift (CLS): < 0.1
```

### 1.4. Browser Compatibility Testing

**Test Browsers**:

- ✅ Chrome/Edge (Chromium) - Latest
- ✅ Firefox - Latest
- ✅ Safari - Latest (if available)
- ✅ Chrome Mobile (Android)
- ✅ Safari Mobile (iOS)

**Test Features**:

- Layout rendering
- CSS Grid/Flexbox
- Animations
- Service Worker
- PWA installation
- Form inputs (especially date picker)

---

## 2. BUG FIXES & POLISH (Optional)

### 2.1. Known Issues to Address

**Current Known Issues**: None (all compilation errors fixed)

**Potential Polish Tasks**:

- [ ] Add loading skeletons for async operations
- [ ] Add error boundaries (React)
- [ ] Add toast notification system
- [ ] Improve mobile responsiveness (especially modals)
- [ ] Add accessibility ARIA labels
- [ ] Verify color contrast (WCAG AA)
- [ ] Add skip to main content link
- [ ] Optimize images to WebP
- [ ] Add JSON-LD structured data for legal content

### 2.2. Polish Implementation (If Time Permits)

These can be done incrementally after initial deployment:

#### Loading Skeletons

```tsx
// components/ui/Skeleton.tsx
export default function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

// Usage in pages:
{loading ? (
  <div className="space-y-4">
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
) : (
  // Actual content
)}
```

#### Error Boundary

```tsx
// components/ErrorBoundary.tsx
"use client";

import React from "react";

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Có lỗi xảy ra</h2>
            <button onClick={() => window.location.reload()}>
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 3. PRODUCTION DEPLOYMENT

### 3.1. Pre-Deployment Checklist

- [x] All TypeScript errors fixed
- [ ] All manual tests passed
- [ ] Lighthouse score 90+ on all pages
- [ ] Environment variables documented
- [ ] Database schema in production
- [ ] Seed data in production (optional)
- [ ] Service worker tested
- [ ] PWA installable

### 3.2. Environment Variables for Production

**Required Variables** (Vercel Environment Variables):

```env
# Database (Supabase)
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[HOST]:5432/postgres
DIRECT_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[HOST]:5432/postgres

# Supabase
SUPABASE_URL=https://icqivkassoxfaukqbzyt.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://icqivkassoxfaukqbzyt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Gemini API (4 keys for rotation)
GEMINI_API_KEY_1=AIzaSyB5nGWaghYxZH8FM52U5AV5wkJhIJMp2WI
GEMINI_API_KEY_2=AIzaSyC...
GEMINI_API_KEY_3=AIzaSyD...
GEMINI_API_KEY_4=AIzaSyE...

# Admin Credentials
ADMIN_EMAIL=admin@trolyphaply.vn
ADMIN_PASSWORD=TroLy@PhapLy2026

# App URL
NEXT_PUBLIC_APP_URL=https://trolyphaply.vn

# Node Environment
NODE_ENV=production
```

### 3.3. Vercel Deployment Steps

#### Step 1: Create Vercel Project

```powershell
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Navigate to project
cd D:\DTL\trolyphaply

# Initialize Vercel project
vercel
# Follow prompts:
# - Link to existing project? No
# - Project name: trolyphaply
# - Directory: ./ (current)
# - Override settings? No
```

#### Step 2: Configure Project Settings

**In Vercel Dashboard** (https://vercel.com/dashboard):

1. Go to Project Settings
2. **Build & Development Settings**:

   - Framework Preset: Next.js
   - Build Command: `next build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Environment Variables**:

   - Add all variables from section 3.2
   - Set environment: Production, Preview, Development

4. **Domains**:

   - Add custom domain: `trolyphaply.vn`
   - Configure DNS:

     ```
     Type: A
     Name: @
     Value: 76.76.21.21 (Vercel IP)

     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
     ```

#### Step 3: Deploy

```powershell
# Production deployment
vercel --prod

# Or use git integration:
# Push to main branch → auto-deploys
git add .
git commit -m "chore: production deployment"
git push origin main
```

**Expected Output**:

```
✅ Deployment complete
🔗 Production: https://trolyphaply.vn
🔗 Preview: https://trolyphaply-[hash].vercel.app
```

#### Step 4: Verify Production Deployment

**Checklist**:

- [ ] Visit https://trolyphaply.vn
- [ ] Test all major features
- [ ] Check PWA installable
- [ ] Verify HTTPS working
- [ ] Test service worker caching
- [ ] Check SEO meta tags (View Source)
- [ ] Test admin login
- [ ] Verify database connections work
- [ ] Test Gemini API calls
- [ ] Check Supabase storage access

### 3.4. Post-Deployment Configuration

#### Database Migrations

If using Prisma migrations (not Supabase SQL):

```powershell
# Generate Prisma client
npx prisma generate

# Push schema to production database
npx prisma db push

# Seed production data (optional)
npx tsx prisma/seed.ts
```

#### Error Monitoring (Optional)

**Sentry Setup**:

```powershell
npm install @sentry/nextjs

# Initialize Sentry
npx @sentry/wizard@latest -i nextjs

# Add SENTRY_DSN to environment variables
```

#### Analytics (Optional)

**Google Analytics**:

```tsx
// app/layout.tsx - Add to <head>
<Script
  src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  `}
</Script>
```

**Plausible Analytics** (Privacy-friendly):

```tsx
// app/layout.tsx
<Script
  defer
  data-domain="trolyphaply.vn"
  src="https://plausible.io/js/script.js"
/>
```

### 3.5. Domain Configuration

#### Primary Domain: trolyphaply.vn

**DNS Settings** (at domain registrar):

```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**SSL Certificate**: Automatically provisioned by Vercel

#### Subdomain for FacebookApp: tuvi.trolyphaply.vn

**Note**: FacebookApp is a separate project deployed at port 8686.

**Options**:

1. **Separate Vercel Deployment** (Recommended):

   - Deploy FacebookApp separately to Vercel
   - Point `tuvi.trolyphaply.vn` to that deployment

2. **Reverse Proxy** (If keeping local):
   - Use Nginx/Caddy to proxy `tuvi.trolyphaply.vn` to `localhost:8686`
   - Requires VPS/server hosting

---

## 4. MONITORING & MAINTENANCE

### 4.1. Performance Monitoring

**Tools**:

- Vercel Analytics (built-in)
- Google PageSpeed Insights
- Lighthouse CI
- Sentry Performance Monitoring

**Metrics to track**:

- Page load times
- API response times
- Error rates
- User engagement
- PWA install rate

### 4.2. Regular Maintenance Tasks

**Weekly**:

- [ ] Check error logs (Vercel or Sentry)
- [ ] Review analytics data
- [ ] Test critical user flows

**Monthly**:

- [ ] Update dependencies (`npm outdated`)
- [ ] Review and update content (legal documents)
- [ ] Check SEO rankings
- [ ] Backup database

**Quarterly**:

- [ ] Security audit
- [ ] Performance optimization
- [ ] User feedback review
- [ ] Feature planning

---

## 5. ROLLBACK PROCEDURES

### 5.1. Vercel Instant Rollback

```powershell
# List deployments
vercel ls

# Promote previous deployment to production
vercel promote [deployment-url]
```

**Or in Vercel Dashboard**:

1. Go to Deployments tab
2. Find last working deployment
3. Click "Promote to Production"

### 5.2. Database Rollback

**If using Prisma migrations**:

```powershell
# Rollback last migration
npx prisma migrate resolve --rolled-back [migration-name]

# Revert to specific migration
npx prisma migrate reset
```

**If using Supabase SQL**:

- Restore from Supabase backup (Settings → Database → Backups)

---

## 6. TESTING SUMMARY

### 6.1. Test Coverage

| Feature          | Test Status | Notes                           |
| ---------------- | ----------- | ------------------------------- |
| Home Q&A         | ⏳ Pending  | Need to test Gemini integration |
| Legal Library    | ⏳ Pending  | Test search & filters           |
| Document Detail  | ⏳ Pending  | Test accordion & bookmarks      |
| Prompts Hub      | ⏳ Pending  | Test CRUD operations            |
| Prompts Detail   | ⏳ Pending  | Test copy & duplicate           |
| Apps Catalog     | ⏳ Pending  | Test 2 migrated apps            |
| App Execution    | ⏳ Pending  | Test dynamic forms & AI         |
| Admin Login      | ⏳ Pending  | Test auth flow                  |
| Admin Dashboard  | ⏳ Pending  | Test stats display              |
| Admin Documents  | ⏳ Pending  | Test CRUD with JSON fields      |
| Admin Procedures | ⏳ Pending  | Test CRUD with JSON arrays      |
| Admin Prompts    | ⏳ Pending  | Test CRUD with char limits      |
| Admin Apps       | ⏳ Pending  | Test CRUD + clone + stats       |
| PWA Manifest     | ⏳ Pending  | Test in DevTools                |
| Service Worker   | ⏳ Pending  | Test offline mode               |
| PWA Install      | ⏳ Pending  | Test on mobile & desktop        |

### 6.2. Performance Targets

| Metric                         | Target  | Status     |
| ------------------------------ | ------- | ---------- |
| Lighthouse Performance         | 90+     | ⏳ Pending |
| Lighthouse Accessibility       | 90+     | ⏳ Pending |
| Lighthouse Best Practices      | 95+     | ⏳ Pending |
| Lighthouse SEO                 | 100     | ⏳ Pending |
| Lighthouse PWA                 | 100     | ⏳ Pending |
| LCP (Largest Contentful Paint) | < 2.5s  | ⏳ Pending |
| FID (First Input Delay)        | < 100ms | ⏳ Pending |
| CLS (Cumulative Layout Shift)  | < 0.1   | ⏳ Pending |

---

## 7. DEPLOYMENT SUMMARY

### 7.1. Deployment Checklist

**Pre-Deployment**:

- [x] Code complete and tested locally
- [x] All TypeScript errors fixed
- [ ] Manual testing completed
- [ ] Lighthouse audit passed
- [ ] Environment variables prepared

**Deployment**:

- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] Custom domain configured (trolyphaply.vn)
- [ ] DNS records updated
- [ ] Production deployment successful
- [ ] HTTPS certificate verified

**Post-Deployment**:

- [ ] Production site tested
- [ ] PWA installable verified
- [ ] Admin access verified
- [ ] Database connections working
- [ ] Gemini API working
- [ ] Error monitoring setup (optional)
- [ ] Analytics setup (optional)

### 7.2. Deployment URLs

**Production**:

- Main site: https://trolyphaply.vn
- Admin dashboard: https://trolyphaply.vn/admin
- API endpoints: https://trolyphaply.vn/api/*

**Preview/Staging** (Vercel):

- Preview URL: https://trolyphaply-[git-branch].vercel.app

**Local Development**:

- Dev server: http://localhost:3456

---

## 8. SUPPORT & DOCUMENTATION

### 8.1. Project Documentation

- **README.md**: Project overview and setup
- **UX-UI-SPEC.md**: Complete UX/UI specifications
- **IMPLEMENTATION-ROADMAP.md**: Development roadmap
- **TODO-TroLyPhapLy.md**: Task tracking and progress
- **DATABASE-SETUP.md**: Database schema and setup
- **PWA-SETUP.md**: PWA implementation guide
- **TESTING-DEPLOYMENT-GUIDE.md**: This file

### 8.2. Key Contacts

**Project Owner**: [Your Name]
**Email**: [Your Email]
**Project Repo**: [Git Repository URL]

### 8.3. Troubleshooting

**Common Issues**:

1. **Build fails on Vercel**

   - Check all environment variables are set
   - Verify Node.js version compatibility (18+)
   - Check build logs for errors

2. **Database connection fails**

   - Verify DATABASE_URL is correct
   - Check Supabase project is active
   - Verify service role key has permissions

3. **Gemini API errors**

   - Check API keys are valid
   - Verify quota not exceeded
   - Test with single key first

4. **PWA not installing**

   - Verify HTTPS is enabled (required)
   - Check manifest.json is accessible
   - Verify service worker registered
   - Check icons exist

5. **Admin login fails**
   - Verify ADMIN_EMAIL and ADMIN_PASSWORD in env
   - Check bcrypt is installed
   - Verify cookie settings

---

## 9. NEXT STEPS

After completing SESSION 7:

1. **Immediate** (Week 1):

   - Complete all manual tests
   - Fix any bugs found
   - Deploy to production
   - Verify production deployment

2. **Short-term** (Weeks 2-4):

   - Monitor error logs
   - Gather user feedback
   - Add polish features (skeletons, toast, etc.)
   - Optimize performance

3. **Long-term** (Months 1-3):
   - Add more AI apps (target 20-30)
   - Expand legal document library
   - Add user accounts and saved items
   - Implement advanced features (bookmarks, history, etc.)

---

**Document Version**: 1.0  
**Last Updated**: December 1, 2025  
**Status**: Ready for testing and deployment
