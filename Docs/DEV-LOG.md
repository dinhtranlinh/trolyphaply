# 📝 Development Log & Lessons Learned

Tài liệu này ghi nhận các bài học kinh nghiệm trong quá trình phát triển.
**AI Agents PHẢI đọc file này trước khi code bất kỳ tính năng nào.**

---

## 🔴 Critical Gotchas (Phải nhớ!)

### 1. PowerShell và folders có ký tự đặc biệt `[id]`

```powershell
# ❌ WRONG - PowerShell interpret [id] as wildcard
Copy-Item "path\[id]\page.tsx" -Destination "..."

# ✅ CORRECT - Use -LiteralPath
Copy-Item -LiteralPath "path\[id]\page.tsx" -Destination "..."
Get-Content -LiteralPath "path\[id]\page.tsx"
```

### 2. page_id Confusion (UUID vs Facebook ID)

```
Database:
- facebook_pages.id = UUID (internal primary key)
- facebook_pages.page_id = "1752765411621435" (Facebook's ID)

- auto_message_rules.page_id = UUID (FK to facebook_pages.id)
- webhook receives Facebook's page_id

ALWAYS lookup UUID before insert:
```

```typescript
// ✅ CORRECT
const { data: pageData } = await supabase
  .from('facebook_pages')
  .select('id')
  .eq('page_id', facebookPageId)  // Facebook ID
  .single();

await supabase.from('auto_message_rules').insert({
  page_id: pageData.id,  // Use UUID!
  ...
});
```

### 3. API Response Format

Tất cả API phải trả về format chuẩn:

```typescript
// ✅ CORRECT
return NextResponse.json({
  success: true,
  pages: [...],     // hoặc rules, data, etc.
  stats: {...}
});

// Frontend check
if (data.success) {
  setPages(data.pages || []);
}
```

### 4. Interface Field Names

**LUÔN dùng `page_name`** không phải `name`:

```typescript
// ✅ CORRECT
interface Page {
  id: string;
  page_id: string;
  page_name: string; // ← ĐÚNG
}

// ❌ WRONG
interface Page {
  name: string; // ← SAI!
}
```

### 5. trigger_on là Array

```typescript
// ✅ Database schema
trigger_on TEXT[] -- PostgreSQL array

// ✅ TypeScript
trigger_on: ('comment' | 'reaction')[]

// ✅ Validation
if (!Array.isArray(input.trigger_on)) {
  return error;
}

// ❌ WRONG - đừng dùng boolean riêng lẻ
trigger_on_comment: boolean  // ← Không dùng cái này!
trigger_on_reaction: boolean
```

### 6. Next.js 16 Async Params

```typescript
// ✅ CORRECT - await params
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
}

// ✅ Client component
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  useEffect(() => {
    params.then((p) => {
      setId(p.id);
    });
  }, [params]);
}
```

---

## 🟡 Common Patterns

### Supabase Query Pattern

```typescript
// Always use Supabase, never Prisma client
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const { data, error } = await supabase
  .from("table_name")
  .select("*")
  .eq("field", value)
  .single();

if (error) throw error;
```

### Error Handling

```typescript
try {
  // ... operation
  return NextResponse.json({ success: true, data });
} catch (error: any) {
  console.error("Operation failed:", error);
  return NextResponse.json(
    { success: false, error: error.message },
    { status: 500 }
  );
}
```

### Webhook Dual Job Creation

Khi nhận comment, tạo CẢ HAI jobs:

```typescript
// 1. Reply to comment
await enqueueJob({ jobType: 'reply_comment', ... });

// 2. Send inbox message
await enqueueJob({
  jobType: 'send_message',
  payload: { ...jobPayload, triggerType: 'comment' }
});
```

---

## 🟢 Deployment Checklist

Trước khi deploy:

- [ ] Run `npm run check` (comprehensive check)
- [ ] Check `types/facebook-schemas.ts` for type changes
- [ ] Verify DB schema matches code interfaces
- [ ] Run deploy script: `.\scripts\deploy-to-prod.ps1 -DryRun` first
- [ ] After deploy, test on localhost:8686 before tunnel

---

## 📊 Database Schema Quick Reference

```sql
-- facebook_pages
id UUID PRIMARY KEY,
page_id TEXT UNIQUE,        -- Facebook's numeric ID
page_name TEXT,
automation_enabled BOOLEAN,
status TEXT

-- auto_message_rules
id UUID PRIMARY KEY,
page_id UUID REFERENCES facebook_pages(id),  -- FK to UUID!
name TEXT,
trigger_on TEXT[],          -- Array: ['comment', 'reaction']
message_template TEXT,
cooldown_minutes INTEGER,
enabled BOOLEAN

-- automation_queue
id UUID PRIMARY KEY,
job_type TEXT,              -- 'reply_comment' | 'send_message'
page_id TEXT,               -- Facebook page_id (NOT UUID)
target_id TEXT,
payload JSONB,
status TEXT
```

---

## 📅 Change Log

### 2025-12-26

- Fixed: message-rules page dropdown not loading (page.name → page_name)
- Fixed: Webhook now creates dual jobs (reply + message)
- Added: Schema registry (types/facebook-schemas.ts)
- Added: Deploy script (scripts/deploy-to-prod.ps1)

### 2025-12-25

- Fixed: UUID lookup for message rules (createMessageRule)
- Fixed: trigger_on validation (string → array)
- Implemented: Message rules CRUD UI
- Added: Facebook API permission testing scripts
  - `scripts/test-fb-permissions.ts` - TypeScript (recommended)
  - `scripts/test_facebook_permissions.py` - Python version
  - `scripts/get_page_token.py` - Helper to get token from DB

---

## 🔗 Key Files Reference

| Purpose           | File                                      |
| ----------------- | ----------------------------------------- |
| Schema types      | `types/facebook-schemas.ts`               |
| AI abstraction    | `lib/ai.ts`                               |
| Circuit breaker   | `lib/gemini.ts`                           |
| Supabase client   | `lib/supabase.ts`                         |
| Webhook handler   | `app/api/facebook/webhooks/route.ts`      |
| Job processor     | `lib/facebook/automationEngine.ts`        |
| Message rules API | `app/api/facebook/message-rules/route.ts` |
| Reply rules API   | `app/api/facebook/reply-rules/route.ts`   |
