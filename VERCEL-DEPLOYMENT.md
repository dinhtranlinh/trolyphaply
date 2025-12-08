# 🚀 VERCEL DEPLOYMENT QUICK START

> **TroLyPhapLy** - Legal Assistant Platform  
> **Ready for Production Deployment**

---

## ✅ PRE-DEPLOYMENT STATUS

- ✅ **Code Complete**: All features implemented (Sessions 0-6)
- ✅ **TypeScript**: Zero compilation errors
- ✅ **Database**: 8 tables created and seeded in Supabase
- ✅ **PWA**: Manifest, service worker, icons ready
- ✅ **SEO**: Meta tags, robots.txt, sitemap.xml configured
- 🎯 **Next Step**: Deploy to Vercel

---

## 📦 DEPLOYMENT STEPS

### 1. Install Vercel CLI

```powershell
npm install -g vercel
```

### 2. Login to Vercel

```powershell
vercel login
```

### 3. Deploy Project

```powershell
# Navigate to project
cd D:\DTL\trolyphaply

# Deploy (first time)
vercel

# Or deploy to production immediately
vercel --prod
```

**Follow prompts**:

- Set up and deploy? → Yes
- Which scope? → [Your account]
- Link to existing project? → No
- Project name? → trolyphaply
- Directory? → ./
- Override settings? → No

### 4. Configure Environment Variables

**In Vercel Dashboard** → Project Settings → Environment Variables

Add these variables for **Production**, **Preview**, and **Development**:

```env
# Database
DATABASE_URL=postgresql://postgres.icqivkassoxfaukqbzyt:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
DIRECT_URL=postgresql://postgres.icqivkassoxfaukqbzyt:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres

# Supabase Public
NEXT_PUBLIC_SUPABASE_URL=https://icqivkassoxfaukqbzyt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Private
SUPABASE_URL=https://icqivkassoxfaukqbzyt.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Gemini API (4 keys for rotation)
GEMINI_API_KEY_1=AIzaSyB5nGWaghYxZH8FM52U5AV5wkJhIJMp2WI
GEMINI_API_KEY_2=[YOUR_KEY_2]
GEMINI_API_KEY_3=[YOUR_KEY_3]
GEMINI_API_KEY_4=[YOUR_KEY_4]

# Admin Credentials
ADMIN_EMAIL=admin@trolyphaply.vn
ADMIN_PASSWORD=TroLy@PhapLy2026

# App URL (update after deployment)
NEXT_PUBLIC_APP_URL=https://trolyphaply.vn

# Environment
NODE_ENV=production
```

### 5. Configure Custom Domain

**In Vercel Dashboard** → Project Settings → Domains

1. Add domain: `trolyphaply.vn`
2. Add domain: `www.trolyphaply.vn` (optional)

**Update DNS at domain registrar**:

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

**Wait for DNS propagation** (5-60 minutes)

### 6. Verify Deployment

**Check these URLs**:

- ✅ https://trolyphaply.vn → Home page
- ✅ https://trolyphaply.vn/law → Legal library
- ✅ https://trolyphaply.vn/prompts → Prompts hub
- ✅ https://trolyphaply.vn/apps → AI apps
- ✅ https://trolyphaply.vn/admin/login → Admin login
- ✅ https://trolyphaply.vn/manifest.json → PWA manifest
- ✅ https://trolyphaply.vn/robots.txt → SEO robots

**Test PWA**:

1. Open Chrome DevTools (F12)
2. Go to Application tab
3. Check Manifest loads
4. Check Service Worker registers
5. Click install icon in address bar
6. Verify app installs to desktop/home screen

**Test Admin**:

1. Go to https://trolyphaply.vn/admin/login
2. Login with credentials:
   - Email: `admin@trolyphaply.vn`
   - Password: `TroLy@PhapLy2026`
3. Verify dashboard loads
4. Test CRUD operations

---

## 🔧 TROUBLESHOOTING

### Build Fails

**Error**: `Module not found` or `Cannot find module`

**Solution**:

```powershell
# Clear cache and reinstall
rm -rf node_modules package-lock.json .next
npm install
npm run build
```

### Environment Variables Not Working

**Error**: `undefined` or `null` values

**Solution**:

1. Verify all variables are set in Vercel Dashboard
2. Redeploy: `vercel --prod`
3. Check variable names match exactly (case-sensitive)

### Database Connection Failed

**Error**: `Can't reach database server`

**Solution**:

1. Verify DATABASE_URL is correct
2. Check Supabase project is active
3. Test connection: Go to Supabase Dashboard → SQL Editor → Run `SELECT 1;`
4. Verify service role key has correct permissions

### PWA Not Installing

**Error**: `Add to Home Screen` not available

**Solution**:

1. Verify HTTPS is enabled (Vercel auto-provisions)
2. Check manifest.json is accessible
3. Check service worker registers (DevTools → Application)
4. Verify icons exist: /icon-192x192.png, /icon-512x512.png
5. Clear browser cache and retry

### Admin Login Failed

**Error**: `Invalid credentials` or `Unauthorized`

**Solution**:

1. Verify ADMIN_EMAIL and ADMIN_PASSWORD in Vercel env vars
2. Check bcryptjs is installed: `npm list bcryptjs`
3. Verify admin user exists in database:
   ```sql
   SELECT * FROM admin_users WHERE email = 'admin@trolyphaply.vn';
   ```
4. Reseed if needed: `npx tsx prisma/seed.ts`

---

## 📊 POST-DEPLOYMENT CHECKLIST

### Immediate (Day 1)

- [ ] Verify all pages load correctly
- [ ] Test admin login and CRUD operations
- [ ] Test PWA installation (desktop + mobile)
- [ ] Check service worker caching
- [ ] Test Gemini API responses
- [ ] Verify Supabase storage access
- [ ] Check SEO meta tags (View Source)
- [ ] Test on mobile devices (iOS + Android)

### Week 1

- [ ] Monitor error logs (Vercel Dashboard → Logs)
- [ ] Check performance metrics (Vercel Analytics)
- [ ] Run Lighthouse audits (target 90+ all categories)
- [ ] Test all user flows end-to-end
- [ ] Gather initial user feedback

### Month 1

- [ ] Review analytics data
- [ ] Optimize slow pages (if any)
- [ ] Fix reported bugs
- [ ] Plan feature enhancements
- [ ] Update content (add more legal documents, prompts, apps)

---

## 🎯 SUCCESS METRICS

**Technical**:

- ✅ Lighthouse Performance: 90+
- ✅ Lighthouse Accessibility: 90+
- ✅ Lighthouse Best Practices: 95+
- ✅ Lighthouse SEO: 100
- ✅ Lighthouse PWA: 100
- ✅ Uptime: 99.9%
- ✅ Page load time: < 2 seconds

**User Engagement**:

- ✅ PWA install rate: 10%+
- ✅ Daily active users
- ✅ Average session duration
- ✅ Bounce rate: < 50%

---

## 📚 DOCUMENTATION

**Full Guides**:

- `TESTING-DEPLOYMENT-GUIDE.md` - Comprehensive testing & deployment (500+ lines)
- `PWA-SETUP.md` - PWA implementation details
- `UX-UI-SPEC.md` - Complete UX/UI specifications
- `IMPLEMENTATION-ROADMAP.md` - Development roadmap
- `TODO-TroLyPhapLy.md` - Task tracking
- `DATABASE-SETUP.md` - Database schema

**Quick Links**:

- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://supabase.com/dashboard/project/icqivkassoxfaukqbzyt
- Google AI Studio: https://aistudio.google.com/

---

## 🆘 SUPPORT

**Issues?**

1. Check troubleshooting section above
2. Review Vercel deployment logs
3. Check Supabase project status
4. Verify environment variables
5. Test locally first: `npm run dev`

**Rollback**:

```powershell
# List deployments
vercel ls

# Promote previous deployment
vercel promote [deployment-url]
```

---

**Ready to Deploy?** Run: `vercel --prod` 🚀

**Need Testing First?** See: `TESTING-DEPLOYMENT-GUIDE.md`

**Questions?** Review project documentation in repo root.
