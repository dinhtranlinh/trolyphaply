# SESSION 7 - PERFORMANCE TESTING GUIDE

## 🎯 Objective

Test application performance and PWA compliance using Lighthouse and manual browser testing.

---

## 1. LIGHTHOUSE AUDIT

### Setup

1. **Open Chrome DevTools**

   - Press F12 or right-click → Inspect
   - Go to **Lighthouse** tab (may need to click >> to find it)

2. **Configure Audit**
   - Device: **Mobile** (default for better testing)
   - Categories: Select all 5:
     - ✅ Performance
     - ✅ Accessibility
     - ✅ Best Practices
     - ✅ SEO
     - ✅ Progressive Web App
   - Mode: **Navigation** (default)
   - Throttling: **Simulated** (default)

### Pages to Test

Run Lighthouse on these 6 pages:

#### 1. Home Page (/)

```
URL: http://localhost:3456
Expected Scores:
- Performance: 90+
- Accessibility: 90+
- Best Practices: 95+
- SEO: 100
- PWA: 100
```

**Action**: Click "Analyze page load"

**Results to Record**:

- Performance score: **\_**
- FCP (First Contentful Paint): **\_**
- LCP (Largest Contentful Paint): **\_**
- TBT (Total Blocking Time): **\_**
- CLS (Cumulative Layout Shift): **\_**

#### 2. Legal Library (/law)

```
URL: http://localhost:3456/law
Expected: 90+ all categories
```

#### 3. Document Detail (/law/doc/[id])

```
URL: http://localhost:3456/law/doc/[any-document-id]
Note: Get a document ID from /law page first
Expected: 90+ all categories
```

#### 4. Prompts Hub (/prompts)

```
URL: http://localhost:3456/prompts
Expected: 90+ all categories
```

#### 5. Apps Catalog (/apps)

```
URL: http://localhost:3456/apps
Expected: 90+ all categories
```

#### 6. App Execution (/apps/van-menh)

```
URL: http://localhost:3456/apps/van-menh
Expected: 90+ all categories
```

### Target Metrics

| Metric         | Target | Good  | Needs Improvement |
| -------------- | ------ | ----- | ----------------- |
| Performance    | 90-100 | 50-89 | 0-49              |
| Accessibility  | 90-100 | 50-89 | 0-49              |
| Best Practices | 95-100 | 50-94 | 0-49              |
| SEO            | 100    | 90-99 | 0-89              |
| PWA            | 100    | -     | 0-99              |

### Core Web Vitals

| Metric                         | Good    | Needs Improvement | Poor    |
| ------------------------------ | ------- | ----------------- | ------- |
| LCP (Largest Contentful Paint) | ≤ 2.5s  | 2.5-4.0s          | > 4.0s  |
| FID (First Input Delay)        | ≤ 100ms | 100-300ms         | > 300ms |
| CLS (Cumulative Layout Shift)  | ≤ 0.1   | 0.1-0.25          | > 0.25  |

---

## 2. PWA TESTING

### Chrome Desktop

1. **Open Application Tab**

   - F12 → Application tab

2. **Test Manifest**

   - Click "Manifest" in left sidebar
   - Verify:
     - ✅ Name: "Trợ Lý Pháp Lý"
     - ✅ Short name: "TroLyPhapLy"
     - ✅ Theme color: #0B3B70
     - ✅ Background color: #FFFFFF
     - ✅ Display: standalone
     - ✅ Icons: 2 entries (192x192, 512x512)
     - ✅ Shortcuts: 4 items

3. **Test Service Worker**

   - Click "Service Workers" in left sidebar
   - Verify:
     - ✅ Status: Activated and running
     - ✅ Source: /sw.js
     - ✅ No errors in console

4. **Test Installation**

   - Look for install icon in address bar (⊕ or install icon)
   - Click to install
   - Verify app opens in standalone window
   - Check Start Menu / Desktop for installed app

5. **Test Offline Mode**
   - Check "Offline" checkbox in Service Workers section
   - Navigate to different pages
   - Verify cached pages load
   - Uncheck "Offline" when done

### Chrome Android (Real Device)

1. **Access via Network URL**

   ```
   http://[your-local-ip]:3456
   Example: http://192.168.1.4:3456
   ```

2. **Test Installation**

   - Tap menu (⋮) → "Install app" or "Add to Home screen"
   - Verify icon appears on home screen
   - Open app from home screen
   - Verify standalone mode (no browser UI)

3. **Test Shortcuts**
   - Long-press app icon on home screen
   - Verify 4 shortcuts appear:
     - Hỏi đáp pháp lý
     - Thư viện pháp luật
     - Prompts Hub
     - Ứng dụng AI
   - Test each shortcut

---

## 3. BROWSER COMPATIBILITY

### Desktop Browsers

Test on these browsers (if available):

#### Chrome/Edge

- ✅ Layout renders correctly
- ✅ All features work
- ✅ PWA installable
- ✅ No console errors

#### Firefox

- ✅ Layout renders correctly
- ✅ All features work
- ⚠️ PWA may not be installable (Firefox limitation)
- ✅ No console errors

#### Safari (macOS)

- ✅ Layout renders correctly
- ✅ All features work
- ⚠️ PWA installation different process
- ✅ No console errors

### Mobile Browsers

#### Chrome Android

- ✅ Responsive layout
- ✅ Touch interactions work
- ✅ Forms easy to use
- ✅ PWA installable
- ✅ Shortcuts work

#### Safari iOS (if available)

- ✅ Responsive layout
- ✅ Touch interactions work
- ✅ Forms easy to use
- ✅ "Add to Home Screen" works
- ✅ Standalone mode works

---

## 4. PERFORMANCE OPTIMIZATION TIPS

### If Performance < 90

**Common Issues**:

1. Large images not optimized
   - Solution: Convert to WebP, use next/image
2. Unused JavaScript
   - Solution: Code splitting, lazy loading
3. Render-blocking resources
   - Solution: Defer non-critical CSS/JS
4. Long server response times
   - Solution: Add caching, optimize database queries

### If Accessibility < 90

**Common Issues**:

1. Missing ARIA labels
   - Solution: Add aria-label to buttons/links
2. Insufficient color contrast
   - Solution: Use darker text on light backgrounds
3. Missing alt text on images
   - Solution: Add descriptive alt attributes
4. Missing form labels
   - Solution: Ensure all inputs have labels

### If SEO < 100

**Common Issues**:

1. Missing meta description
   - Solution: Add in layout.tsx
2. Missing title tags
   - Solution: Use Next.js Metadata API
3. robots.txt blocking pages
   - Solution: Update robots.txt
4. Missing sitemap
   - Solution: Create sitemap.xml (already done)

### If PWA < 100

**Common Issues**:

1. Service worker not registered
   - Solution: Check registration script in layout.tsx
2. Manifest not valid
   - Solution: Validate JSON at https://manifest-validator.appspot.com/
3. Icons missing
   - Solution: Generate PNG icons from SVG (see ICON-README.md)
4. Not served over HTTPS
   - Solution: Deploy to production (Vercel auto HTTPS)

---

## 5. TESTING CHECKLIST

### Pre-Testing

- [x] Dev server running: `npm run dev`
- [x] No TypeScript errors
- [x] No console errors on load

### Lighthouse Audits

- [ ] Home (/) - Performance: **\_**, Accessibility: **\_**, Best Practices: **\_**, SEO: **\_**, PWA: **\_**
- [ ] Legal Library (/law) - Performance: **\_**, Accessibility: **\_**, Best Practices: **\_**, SEO: **\_**, PWA: **\_**
- [ ] Document Detail - Performance: **\_**, Accessibility: **\_**, Best Practices: **\_**, SEO: **\_**, PWA: **\_**
- [ ] Prompts Hub - Performance: **\_**, Accessibility: **\_**, Best Practices: **\_**, SEO: **\_**, PWA: **\_**
- [ ] Apps Catalog - Performance: **\_**, Accessibility: **\_**, Best Practices: **\_**, SEO: **\_**, PWA: **\_**
- [ ] App Execution - Performance: **\_**, Accessibility: **\_**, Best Practices: **\_**, SEO: **\_**, PWA: **\_**

### PWA Testing

- [ ] Manifest loads correctly
- [ ] Service worker registers
- [ ] App installable on desktop
- [ ] App installable on mobile
- [ ] Offline mode works
- [ ] Theme color applies
- [ ] App shortcuts work

### Browser Testing

- [ ] Chrome/Edge - All features work
- [ ] Firefox - All features work
- [ ] Safari - All features work (if available)
- [ ] Chrome Mobile - Responsive + installable
- [ ] Safari iOS - Responsive + installable (if available)

### Core Web Vitals

- [ ] LCP < 2.5s on all pages
- [ ] FID < 100ms on all pages
- [ ] CLS < 0.1 on all pages

---

## 6. RESULTS SUMMARY

**Date**: December 2, 2025

### Average Scores Across All Pages

| Category       | Target | Actual | Status |
| -------------- | ------ | ------ | ------ |
| Performance    | 90+    | **\_** | ⏳     |
| Accessibility  | 90+    | **\_** | ⏳     |
| Best Practices | 95+    | **\_** | ⏳     |
| SEO            | 100    | **\_** | ⏳     |
| PWA            | 100    | **\_** | ⏳     |

### Core Web Vitals

| Metric | Target  | Actual | Status |
| ------ | ------- | ------ | ------ |
| LCP    | < 2.5s  | **\_** | ⏳     |
| FID    | < 100ms | **\_** | ⏳     |
| CLS    | < 0.1   | **\_** | ⏳     |

### Issues Found

1. ***
2. ***
3. ***

### Action Items

1. ***
2. ***
3. ***

---

**Next Step**: If all tests pass → Proceed to Vercel Deployment

**If tests fail**: Fix issues → Re-test → Repeat until passing
