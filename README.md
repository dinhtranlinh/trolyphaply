# Trợ Lý Pháp Lý (TroLyPhapLy)

Ứng dụng web tư vấn pháp luật và thủ tục hành chính với AI.

## Công nghệ

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma 7
- **AI:** Google Gemini API
- **Storage:** Supabase Storage

## Cấu trúc dự án

\\\
trolyphaply/
 app/                    # Next.js App Router
    (main)/            # Route group chính
       page.tsx       # Home (Q&A Hub)
       law/           # Legal Library
       prompts/       # Prompt Hub
       apps/          # Fun AI Apps
    api/               # Backend APIs
    admin/             # Admin Dashboard
 components/
    layout/            # AppShell, Header, BottomNav
    ui/                # Atomic components
    legal/             # Legal-specific components
 lib/
    prisma.ts          # DB client
    gemini.ts          # Gemini AI wrapper
    storage.ts         # Supabase storage
    auth.ts            # Admin authentication
 prisma/
     schema.prisma      # Database schema
\\\

## Database Models

- \\AdminUser\\ - Admin authentication
- \\LegalDocument\\ - Văn bản pháp luật
- \\Procedure\\ - Thủ tục hành chính
- \\Prompt\\ - AI prompts library
- \\App\\ - Fun AI apps (migrated from FacebookApp)
- \\Result\\ - App execution results

## Setup Development

\\\ash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Seed data
npm run db:seed

# Run dev server (port 6666)
npm run dev
\\\

## Environment Variables

See \\.env.example\\ for required environment variables.

## Deployment

- **Domain:** trolyphaply.vn
- **Platform:** Vercel
- **Database:** Supabase (Production)

## Related Projects

- **FacebookApp** (Tử Vi) - tuvi.trolyphaply.vn

---

**Version:** 1.0.0  
**Created:** December 2025
