# Environment Setup Guide

## Development vs Production

TroLyPhapLy sử dụng 2 môi trường riêng biệt:

### Development Environment

- **Port**: 3456
- **URL**: http://localhost:3456
- **Database**: Supabase development instance
- **Debug**: Enabled
- **Hot reload**: Enabled

### Production Environment

- **Port**: 8686
- **URL**: https://trolyphaply.vn
- **Database**: Supabase production instance
- **Debug**: Disabled
- **Optimized build**: Yes

---

## Quick Start

### 1. Development

```bash
# Chạy dev server
npm run dev

# Hoặc dùng PM2
pm2 start ecosystem.config.js --only trolyphaply-dev
```

Truy cập: http://localhost:3456

### 2. Production

```bash
# Build production
npm run build:prod

# Start production server
npm run start:prod

# Hoặc dùng PM2 (khuyến nghị)
pm2 start ecosystem.config.js --only trolyphaply-prod
pm2 save
```

Truy cập: http://localhost:8686 (hoặc https://trolyphaply.vn qua Cloudflare Tunnel)

---

## Environment Files

- `.env.development` - Development config (committed to git)
- `.env.production` - Production config (committed to git)
- `.env.local` - Local overrides (NOT committed, highest priority)
- `.env.example` - Template for new developers

**Priority order**: `.env.local` > `.env.production` / `.env.development` > `.env`

---

## PM2 Management

### Start both environments

```bash
pm2 start ecosystem.config.js
```

### Start specific environment

```bash
pm2 start ecosystem.config.js --only trolyphaply-dev
pm2 start ecosystem.config.js --only trolyphaply-prod
```

### Monitor

```bash
pm2 status
pm2 logs trolyphaply-dev
pm2 logs trolyphaply-prod
pm2 monit
```

### Stop/Restart

```bash
pm2 stop trolyphaply-dev
pm2 restart trolyphaply-prod
pm2 delete all
```

### Auto-start on boot (Windows)

```bash
npm install -g pm2-windows-service
pm2-startup install
pm2 save
```

---

## Cloudflare Tunnel

Production sử dụng Cloudflare Tunnel:

```bash
# Check tunnel status
cloudflared tunnel list

# Start tunnel (nếu chưa dùng service)
cloudflared tunnel run trolyphaply

# Service status
sc query cloudflared
```

---

## Database

### Development

- Dùng Supabase Studio: https://icqivkassoxfaukqbzyt.supabase.co
- Có thể seed dữ liệu test thoải mái

### Production

- **KHÔNG seed dữ liệu test**
- Backup định kỳ
- Khuyến nghị: Tạo Supabase project riêng cho production

---

## Feature Flags

Trong `.env.development` / `.env.production`:

```env
ENABLE_DEBUG=true          # Hiển thị error stack traces
ENABLE_ANALYTICS=false     # Google Analytics / tracking
```

---

## Common Tasks

### Switch từ Dev sang Prod trên cùng 1 máy

```bash
# Stop dev
pm2 stop trolyphaply-dev

# Start prod
pm2 start trolyphaply-prod

# Hoặc chạy cả 2 cùng lúc (khác port)
pm2 start ecosystem.config.js
```

### Deploy code mới lên Production

```bash
# 1. Test ở dev trước
npm run dev

# 2. Build production
npm run build:prod

# 3. Restart PM2
pm2 restart trolyphaply-prod

# 4. Check logs
pm2 logs trolyphaply-prod --lines 50
```

### Rollback nếu có lỗi

```bash
git checkout <commit-cũ>
npm install
npm run build:prod
pm2 restart trolyphaply-prod
```

---

## Troubleshooting

### Port đã được sử dụng

```bash
# Tìm process đang dùng port
netstat -ano | findstr :3456
netstat -ano | findstr :8686

# Kill process
taskkill /PID <process_id> /F
```

### PM2 không start

```bash
pm2 kill
pm2 start ecosystem.config.js
```

### Cloudflare Tunnel lỗi

```bash
# Restart service
sc stop cloudflared
sc start cloudflared

# Hoặc reinstall
cloudflared service uninstall
cloudflared service install <token>
```

---

## Best Practices

✅ **DO**:

- Test kỹ ở dev trước khi deploy prod
- Commit `.env.development` và `.env.production` để đồng bộ config
- Dùng `.env.local` cho secrets cá nhân (API keys test)
- Chạy production với PM2 để auto-restart
- Backup database trước khi deploy

❌ **DON'T**:

- Commit `.env.local` (chứa secrets thật)
- Test trực tiếp trên production
- Dùng chung database dev và prod
- Hardcode URLs hoặc API keys trong code
