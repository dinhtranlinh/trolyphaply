# SESSION 7 - VERCEL DEPLOYMENT CHECKLIST

## 📋 PRE-DEPLOYMENT CHECKLIST

Before deploying, ensure these are complete:

- [x] ✅ Code complete (Sessions 0-6)
- [x] ✅ Zero TypeScript errors
- [x] ✅ Dev server runs successfully
- [ ] ⏳ Manual testing completed
- [ ] ⏳ Lighthouse audits passed (90+ scores)
- [ ] ⏳ Environment variables prepared

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Install Vercel CLI

```powershell
# Install globally
npm install -g vercel

# Verify installation
vercel --version
```

Expected output: `Vercel CLI X.X.X`

---

### Step 2: Login to Vercel

```powershell
vercel login
```

**Choose login method**:

- GitHub (recommended)
- GitLab
- Bitbucket
- Email

Browser will open → Complete authentication → Return to terminal

**Expected output**: `Success! You are now logged in.`

---

### Step 3: Initialize Deployment

```powershell
# Navigate to project
cd D:\DTL\trolyphaply

# Deploy (first time)
vercel
```

**Answer prompts**:

```
? Set up and deploy "D:\DTL\trolyphaply"? [Y/n]
→ Y

? Which scope do you want to deploy to?
→ [Select your account/team]

? Link to existing project? [y/N]
→ N

? What's your project's name?
→ trolyphaply

? In which directory is your code located?
→ ./

? Want to override the settings? [y/N]
→ N
```

**Vercel will**:

1. Detect Next.js project
2. Build the application
3. Deploy to preview URL
4. Output deployment URL

**Expected output**:

```
✅ Production: https://trolyphaply.vercel.app
✅ Deployed to production. Run `vercel --prod` to deploy to production again.
```

**⚠️ Important**: This first deployment will likely FAIL because environment variables are not set yet. That's expected!

---

### Step 4: Configure Environment Variables

1. **Open Vercel Dashboard**

   - Go to: https://vercel.com/dashboard
   - Select project: `trolyphaply`
   - Go to: Settings → Environment Variables

2. **Add All Variables**

For each variable below, add it 3 times for different environments:

- ✅ Production
- ✅ Preview
- ✅ Development

#### Database Variables

```
Variable Name: DATABASE_URL
Value: postgresql://postgres.icqivkassoxfaukqbzyt:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
Environments: ✅ Production ✅ Preview ✅ Development

Variable Name: DIRECT_URL
Value: postgresql://postgres.icqivkassoxfaukqbzyt:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
Environments: ✅ Production ✅ Preview ✅ Development
```

**Get password from**: Supabase Dashboard → Settings → Database → Connection Pooling → Password

#### Supabase Variables

```
Variable Name: SUPABASE_URL
Value: https://icqivkassoxfaukqbzyt.supabase.co
Environments: ✅ Production ✅ Preview ✅ Development

Variable Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://icqivkassoxfaukqbzyt.supabase.co
Environments: ✅ Production ✅ Preview ✅ Development

Variable Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environments: ✅ Production ✅ Preview ✅ Development

Variable Name: SUPABASE_SERVICE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environments: ✅ Production ✅ Preview ✅ Development
```

**Get keys from**: Supabase Dashboard → Settings → API

#### Gemini API Variables

```
Variable Name: GEMINI_API_KEY_1
Value: AIzaSyB5nGWaghYxZH8FM52U5AV5wkJhIJMp2WI
Environments: ✅ Production ✅ Preview ✅ Development

Variable Name: GEMINI_API_KEY_2
Value: [YOUR_KEY_2]
Environments: ✅ Production ✅ Preview ✅ Development

Variable Name: GEMINI_API_KEY_3
Value: [YOUR_KEY_3]
Environments: ✅ Production ✅ Preview ✅ Development

Variable Name: GEMINI_API_KEY_4
Value: [YOUR_KEY_4]
Environments: ✅ Production ✅ Preview ✅ Development
```

**Get keys from**: https://aistudio.google.com/app/apikey

#### Admin Variables

```
Variable Name: ADMIN_EMAIL
Value: admin@trolyphaply.vn
Environments: ✅ Production ✅ Preview ✅ Development

Variable Name: ADMIN_PASSWORD
Value: TroLy@PhapLy2026
Environments: ✅ Production ✅ Preview ✅ Development
```

#### App Configuration

```
Variable Name: NEXT_PUBLIC_APP_URL
Value: https://trolyphaply.vn
Environments: ✅ Production

Variable Name: NEXT_PUBLIC_APP_URL
Value: https://trolyphaply-git-[branch].vercel.app
Environments: ✅ Preview

Variable Name: NEXT_PUBLIC_APP_URL
Value: http://localhost:3456
Environments: ✅ Development

Variable Name: NODE_ENV
Value: production
Environments: ✅ Production ✅ Preview
```

3. **Save All Variables**
   - Click "Save" after each variable
   - Verify total: ~14 variables x 3 environments = 42 entries

---

### Step 5: Redeploy with Environment Variables

```powershell
# From project directory
vercel --prod
```

**Vercel will**:

1. Use environment variables
2. Build the application
3. Deploy to production
4. Output production URL

**Expected output**:

```
🔍 Inspect: https://vercel.com/[your-account]/trolyphaply/[deployment-id]
✅ Production: https://trolyphaply.vercel.app [copied to clipboard]
```

**⏱️ Deployment time**: 2-5 minutes

---

### Step 6: Configure Custom Domain

#### 6.1 Add Domain in Vercel

1. Go to: Project Settings → Domains
2. Click "Add Domain"
3. Enter: `trolyphaply.vn`
4. Click "Add"

**Vercel will show DNS instructions**

#### 6.2 Update DNS Records

Go to your domain registrar (e.g., GoDaddy, Namecheap, Google Domains)

**Add these records**:

```
Type: A
Name: @ (or leave blank for root domain)
Value: 76.76.21.21
TTL: 3600 (or Auto)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600 (or Auto)
```

#### 6.3 Wait for DNS Propagation

- **Time**: 5 minutes to 48 hours (usually 10-30 minutes)
- **Check status**: Vercel Dashboard → Domains → Status indicator

**When ready**:

- ✅ Valid Configuration
- 🔒 SSL Certificate Issued (automatic)

---

### Step 7: Verify Production Deployment

#### Test URLs

Visit these URLs:

1. **Main Domain**

   ```
   https://trolyphaply.vn
   ```

   - Should load home page
   - Check for HTTPS (padlock icon)
   - No errors in console

2. **WWW Subdomain**

   ```
   https://www.trolyphaply.vn
   ```

   - Should redirect to https://trolyphaply.vn

3. **Vercel Domain**
   ```
   https://trolyphaply.vercel.app
   ```
   - Should also work (backup URL)

#### Test Key Features

**Home Page**:

- [ ] Q&A textarea loads
- [ ] Suggestion chips work
- [ ] Submit question to Gemini API
- [ ] Response displays correctly

**Legal Library**:

- [ ] Documents load from Supabase
- [ ] Search works
- [ ] Category filter works
- [ ] Click document → Detail page loads

**Prompts Hub**:

- [ ] Prompts load
- [ ] Search works
- [ ] Create new prompt
- [ ] Edit existing prompt
- [ ] Delete prompt

**AI Apps**:

- [ ] Apps list loads
- [ ] Click app → Execution page
- [ ] Fill form
- [ ] Generate result with Gemini
- [ ] Result displays

**Admin Dashboard**:

- [ ] Go to https://trolyphaply.vn/admin/login
- [ ] Login with: admin@trolyphaply.vn / TroLy@PhapLy2026
- [ ] Dashboard loads
- [ ] Test CRUD on Documents
- [ ] Test CRUD on Procedures
- [ ] Test CRUD on Prompts
- [ ] Test CRUD on Apps (including clone & stats)

**PWA Features**:

- [ ] Visit https://trolyphaply.vn
- [ ] F12 → Application → Manifest (should load)
- [ ] Service Worker should register
- [ ] Install icon appears in address bar
- [ ] Install app to desktop/home screen
- [ ] App opens in standalone mode

---

### Step 8: Post-Deployment Configuration

#### 8.1 Update Vercel Project Settings

**Build Settings**:

- Framework: Next.js (auto-detected)
- Build Command: `next build`
- Output Directory: `.next`
- Install Command: `npm install`

**No changes needed** (already correct)

#### 8.2 Enable Vercel Analytics (Optional)

1. Go to: Project → Analytics tab
2. Click "Enable Web Analytics"
3. Free tier: 100k events/month

**Benefits**:

- Real User Monitoring (RUM)
- Page views
- Performance metrics
- User engagement

#### 8.3 Setup Error Monitoring (Optional)

**Option A: Sentry** (Recommended)

```powershell
cd D:\DTL\trolyphaply
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Follow wizard prompts:

1. Create Sentry account (free tier)
2. Create new project: Next.js
3. Get DSN (Data Source Name)
4. Add to Vercel environment variables:
   ```
   SENTRY_DSN=[your-dsn]
   NEXT_PUBLIC_SENTRY_DSN=[your-dsn]
   ```

**Option B: Vercel Built-in Error Tracking**

1. Go to: Project → Settings → Error Tracking
2. Enable "Error Tracking"
3. Free tier included

#### 8.4 Setup External Analytics (Optional)

**Google Analytics**:

1. Get GA4 Measurement ID from https://analytics.google.com
2. Add to `app/layout.tsx`:
   ```tsx
   <Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" />
   <Script id="google-analytics">
     {`
       window.dataLayer = window.dataLayer || [];
       function gtag(){dataLayer.push(arguments);}
       gtag('js', new Date());
       gtag('config', 'G-XXXXXXXXXX');
     `}
   </Script>
   ```

**Plausible Analytics** (Privacy-friendly):

1. Create account at https://plausible.io
2. Add domain: trolyphaply.vn
3. Add to `app/layout.tsx`:
   ```tsx
   <Script
     defer
     data-domain="trolyphaply.vn"
     src="https://plausible.io/js/script.js"
   />
   ```

---

## ✅ POST-DEPLOYMENT VERIFICATION CHECKLIST

### Infrastructure

- [ ] Domain resolves: https://trolyphaply.vn
- [ ] WWW redirects: https://www.trolyphaply.vn → https://trolyphaply.vn
- [ ] HTTPS certificate valid (🔒 padlock icon)
- [ ] Service worker registers
- [ ] PWA installable

### Database & APIs

- [ ] Supabase connection works
- [ ] Documents load from database
- [ ] Procedures load from database
- [ ] Prompts load from database
- [ ] Apps load from database
- [ ] Gemini API responds correctly
- [ ] Image uploads work (Supabase Storage)

### User Features

- [ ] Home Q&A generates responses
- [ ] Legal library search works
- [ ] Document detail pages load
- [ ] Prompts CRUD works
- [ ] AI apps execute and generate results
- [ ] Share buttons work

### Admin Features

- [ ] Admin login works
- [ ] Dashboard statistics display
- [ ] Documents CRUD works
- [ ] Procedures CRUD works
- [ ] Prompts CRUD works
- [ ] Apps CRUD works (including clone & stats)

### Performance

- [ ] Pages load in < 3 seconds
- [ ] No console errors
- [ ] Images load properly
- [ ] Mobile responsive
- [ ] Works on Chrome, Firefox, Safari

### SEO & PWA

- [ ] Meta tags present (View Source)
- [ ] robots.txt accessible: /robots.txt
- [ ] Sitemap accessible: /sitemap.xml
- [ ] Manifest accessible: /manifest.json
- [ ] Icons load: /icon-192x192.png, /icon-512x512.png
- [ ] Can install to home screen
- [ ] Offline mode works (cached pages)

---

## 🔧 TROUBLESHOOTING

### Deployment Failed

**Error**: Build failed

**Solutions**:

1. Check build logs in Vercel Dashboard
2. Verify all environment variables are set
3. Test build locally: `npm run build`
4. Check for TypeScript errors: `npm run lint`

---

### Domain Not Working

**Error**: DNS_PROBE_FINISHED_NXDOMAIN

**Solutions**:

1. Wait longer (DNS propagation can take up to 48 hours)
2. Verify DNS records are correct (A record, CNAME)
3. Use DNS checker: https://dnschecker.org
4. Clear browser cache
5. Try incognito mode

---

### Environment Variables Not Working

**Error**: `undefined` or API errors

**Solutions**:

1. Verify variables are set for Production environment
2. Check variable names match exactly (case-sensitive)
3. Redeploy: `vercel --prod`
4. Check logs in Vercel Dashboard

---

### Database Connection Failed

**Error**: Can't connect to Supabase

**Solutions**:

1. Verify DATABASE_URL is correct
2. Check password includes special characters (may need URL encoding)
3. Test connection in Supabase SQL Editor
4. Verify service role key has correct permissions
5. Check Supabase project is active (not paused)

---

### Gemini API Not Working

**Error**: API key invalid or quota exceeded

**Solutions**:

1. Verify API keys are correct
2. Check quota at https://aistudio.google.com
3. Test with single key first
4. Verify keys have Gemini 1.5 Pro access
5. Check for rate limiting errors in logs

---

### PWA Not Installing

**Error**: Install button doesn't appear

**Solutions**:

1. Verify HTTPS is enabled (required for PWA)
2. Check manifest.json is accessible
3. Verify service worker registers
4. Check icons exist and are correct format
5. Clear browser cache and try again
6. Test in incognito mode

---

## 📊 SUCCESS CRITERIA

### Technical Requirements

- ✅ Build succeeds on Vercel
- ✅ All environment variables set
- ✅ Custom domain configured
- ✅ HTTPS certificate issued
- ✅ Zero console errors

### Feature Requirements

- ✅ All pages load correctly
- ✅ Database queries work
- ✅ Gemini API responds
- ✅ Admin CRUD operations work
- ✅ PWA installable

### Performance Requirements

- ✅ Lighthouse Performance: 90+
- ✅ Lighthouse Accessibility: 90+
- ✅ Lighthouse Best Practices: 95+
- ✅ Lighthouse SEO: 100
- ✅ Lighthouse PWA: 100

---

## 🎉 DEPLOYMENT COMPLETE!

**Production URL**: https://trolyphaply.vn

**Next Steps**:

1. Monitor Vercel Analytics for traffic
2. Check error logs daily (first week)
3. Gather user feedback
4. Plan feature enhancements
5. Add more legal documents and AI apps

**Support**:

- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://supabase.com/dashboard/project/icqivkassoxfaukqbzyt
- Google AI Studio: https://aistudio.google.com

---

**Document Version**: 1.0  
**Last Updated**: December 2, 2025  
**Status**: Ready for deployment
