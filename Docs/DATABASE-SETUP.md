# DATABASE SETUP INSTRUCTIONS

## ✅ Supabase Connection: SUCCESSFUL

Connection to Supabase project `icqivkassoxfaukqbzyt` is working correctly.

## 📋 Next Step: Execute SQL Schema

Since Prisma 7 has configuration issues with the CLI, we'll execute the SQL schema directly in Supabase.

### Option 1: Supabase SQL Editor (RECOMMENDED - Easiest)

1. Go to https://supabase.com/dashboard/project/icqivkassoxfaukqbzyt
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire content from `prisma/schema.sql`
5. Paste it into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned" - this is correct!

### Option 2: Use psql CLI (Advanced)

If you have `psql` installed:

```bash
# Get your direct connection string from Supabase dashboard
psql "postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@[HOST]:5432/postgres" -f prisma/schema.sql
```

## 🎯 What Gets Created

The schema will create **8 tables**:

1. **admin_users** - Admin authentication
2. **legal_documents** - Legal documents (laws, decrees, circulars)
3. **procedures** - Administrative procedures
4. **prompts** - AI prompts library
5. **apps** - Mini-app definitions
6. **results** - Generated results from apps
7. **app_stats_daily** - Daily statistics per app
8. **app_events** - Event tracking

Plus:

- All necessary indexes for performance
- Foreign key constraints
- Auto-updating `updated_at` triggers

## ✅ After Execution

1. Verify tables exist in **Table Editor**
2. Run `node test-connection.js` to test Prisma client
3. Continue to SESSION 1 (Seed Data)

---

**Files Created:**

- `prisma/schema.sql` - Complete SQL schema
- `test-supabase.js` - Connection test (✅ passed)
- This file - Instructions

**Status**: Ready to execute SQL in Supabase Dashboard
