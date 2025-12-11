# TRỢ LÝ PHÁP LÝ (LexiGov / TroLyPhapLy) - UX/UI SPECIFICATION

> **Document version**: 1.0  
> **Date**: 2026  
> **Project**: TroLyPhapLy - Legal Assistant & Q&A Platform  
> **Tech Stack**: Next.js 16 + TypeScript + Prisma 7 + Supabase + Gemini AI

---

## 1. PROJECT OVERVIEW

### 1.1. Product Name

- **Internal name**: TroLyPhapLy
- **Display name**: Trợ Lý Pháp Lý (can show as "LexiGov" in English contexts)
- **Domain**: trolyphaply.vn
- **Subdomain cho tử vi**: tuvi.trolyphaply.vn (FacebookApp project)

### 1.2. Product Goals

A mobile-first PWA web application for:

1. **Legal Q&A**: Ask questions about Vietnamese law and administrative procedures
2. **Legal Information Library**: Browse legal documents, case law, and guidance
3. **Prompt Management**: Share and manage useful AI prompts for various purposes
4. **Fun AI Apps**: 20-30+ mini-apps for social sharing (horoscope, greeting cards, poems, etc.)
   - **Note**: Migrate existing apps from FacebookApp project:
     - `van-menh` (Vận Mệnh Của Bạn)
     - `tu-vi-chuyen-sau` (Tử Vi Chuyên Sâu)

### 1.3. Tone & Style

- **Legal**: Credible, trustworthy, professional
- **Design**: Clean, minimal, modern
- **Platform**: Mobile-first, PWA-ready (installable to home screen)
- **Target users**: Vietnamese citizens seeking legal guidance

---

## 2. TECHNICAL ASSUMPTIONS

### 2.1. Framework & Tools

- **Frontend**: Next.js 16 (App Router, TypeScript, React 19)
- **Styling**: Tailwind CSS (mobile-first utilities)
- **Database**: PostgreSQL via Supabase + Prisma 7 ORM
- **Storage**: Supabase Storage (images, documents)
- **AI**: Google Gemini API (text generation, vision)
- **Auth**: bcryptjs + session cookies (admin-only, simple)
- **PWA**: Web app manifest + service worker

### 2.2. Routing Structure

```
/                          → Home (Legal Q&A Hub)
/law                       → Legal Information Library (documents, procedures, case law)
/law/doc/:id              → Legal Document Detail
/prompts                   → Prompt Hub (list + search)
/prompts/:id              → Prompt Detail
/apps                      → Fun AI Apps Catalog
/apps/:slug               → Single Mini-App (generator screen)
/profile                   → User Profile / Saved Items (future)
/admin                     → Admin Dashboard (CRUD for all content)
/admin/login              → Admin Login
```

### 2.3. Persistent Layout Components

- **`<AppShell>`**: Top-level layout with header + bottom nav
- **`<BottomNav>`**: Mobile navigation bar with 4 main tabs (Home, Law, Prompts, Apps)
- **`<Header>`**: Compact top bar with logo and optional back button

---

## 3. DESIGN SYSTEM

### 3.1. Color Palette (Legal - Trustworthy Theme)

```css
/* Primary Colors */
--color-primary: #0b3b70; /* Dark navy blue - main brand */
--color-primary-light: #1f4e82; /* Lighter navy for hover states */
--color-primary-soft: #e6eef7; /* Very light navy for backgrounds */

/* Accent Colors */
--color-accent: #e5a100; /* Golden accent for CTAs, highlights */
--color-accent-soft: #fff4d6; /* Light gold for subtle highlights */

/* Background Colors */
--color-bg: #f5f7fa; /* Main page background */
--color-surface: #ffffff; /* Card/surface background */

/* Text Colors */
--color-text-main: #1f2933; /* Primary text */
--color-text-muted: #6b7280; /* Secondary/muted text */
--color-border-subtle: #e5e7eb; /* Borders and dividers */

/* Status Colors */
--color-success: #16a34a; /* Success states */
--color-warning: #f59e0b; /* Warning states */
--color-error: #dc2626; /* Error states */
```

**Usage guidelines**:

- Use primary navy + white + grey as base
- Use accent gold sparingly (buttons, highlights, CTAs)
- Never mix accent gold with error red (confusing)

### 3.2. Typography

**Font Family**: `"Inter", "Roboto", system-ui, -apple-system, BlinkMacSystemFont, sans-serif`

**Type Scale (Mobile-First)**:

```css
/* Page Titles */
.page-title {
  font-size: 1.25rem; /* text-xl */
  font-weight: 600; /* font-semibold */
  line-height: 1.75rem;
}

/* Section Titles */
.section-title {
  font-size: 1.125rem; /* text-lg */
  font-weight: 600; /* font-semibold */
  line-height: 1.5rem;
}

/* Body Text */
.body-text {
  font-size: 0.875rem; /* text-sm */
  font-weight: 400; /* font-normal */
  line-height: 1.25rem;
}

/* Labels & Meta */
.label-text {
  font-size: 0.75rem; /* text-xs */
  font-weight: 400;
  color: var(--color-text-muted);
}
```

### 3.3. UI Elements

#### Cards

```css
.card {
  border-radius: 0.75rem; /* rounded-xl */
  border: 1px solid var(--color-border-subtle);
  background: var(--color-surface);
  padding: 0.75rem 1rem; /* p-3 or p-4 */
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); /* shadow-sm (only important cards) */
}
```

#### Buttons

```css
/* Primary Button */
.btn-primary {
  background: var(--color-primary);
  color: white;
  border-radius: 0.5rem; /* rounded-lg */
  padding: 0.5rem 1rem;
  font-weight: 500;
}

/* Secondary Button */
.btn-secondary {
  background: white;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
}

/* Accent Button (CTA) */
.btn-accent {
  background: var(--color-accent);
  color: var(--color-text-main);
  border-radius: 9999px; /* rounded-full */
  padding: 0.5rem 1.5rem;
  font-weight: 600;
}
```

#### Icons

- **Icon set**: Heroicons or Lucide (consistent throughout)
- **Icon size**: 18-22px on mobile, 20-24px on desktop
- **Icon color**: Inherit text color or use `text-gray-500` for muted

---

## 4. GLOBAL LAYOUT & NAVIGATION

### 4.1. AppShell Component

**Responsibility**: Wrap all pages with shared header and bottom navigation

**Layout**:

```
┌─────────────────────────┐
│  <Header />             │  ← Top: Logo / Back button
├─────────────────────────┤
│                         │
│  {children}             │  ← Scrollable content area
│  (page content)         │
│                         │
├─────────────────────────┤
│  <BottomNav />          │  ← Fixed at bottom on mobile
└─────────────────────────┘
```

**Desktop behavior**: Constrain width (max-width: 480-640px centered)

### 4.2. Header Component

**Props**:

```ts
interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  rightAction?: ReactNode;
}
```

**Behavior**:

- **Homepage**: Show logo + "Trợ Lý Pháp Lý" text
- **Inner pages**: Show back button + page title
- **Right action**: Optional (e.g., search icon, settings icon)

### 4.3. Bottom Navigation

**Component**: `BottomNav`

**4 Tabs**:

1. **Home** - Icon: `HomeIcon` - Route: `/`
2. **Law** - Icon: `BookOpenIcon` - Route: `/law`
3. **Prompts** - Icon: `LightBulbIcon` - Route: `/prompts`
4. **Apps** - Icon: `SparklesIcon` - Route: `/apps`

**Behavior**:

- Fixed at bottom on mobile (`fixed bottom-0 left-0 right-0 z-50`)
- Highlight active route with primary color
- On desktop: Can be moved to left sidebar or kept at bottom

---

## 5. PAGE SPECIFICATIONS

### 5.1. Home Page (`/`) - Legal Q&A Hub

**Goal**: Let users instantly ask legal/administrative questions and see suggested topics

**Layout (Top to Bottom)**:

#### 1. Intro Block

```
┌─────────────────────────────────────┐
│  🏛️ Hỏi về Pháp Luật & Thủ Tục     │  ← Heading (text-xl font-semibold)
│  Tư vấn nhanh, không thay thế       │  ← Subtext (text-sm text-gray-600)
│  dịch vụ pháp lý chính thức         │
└─────────────────────────────────────┘
```

#### 2. Main Q&A Input Section

```
┌─────────────────────────────────────┐
│  ┌─────────────────────────────────┐ │
│  │  Nhập câu hỏi của bạn...        │ │  ← Textarea (4-5 rows)
│  │                                 │ │
│  │                                 │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │  [Thủ tục dân sự] [Thuế & DN]   │ │  ← Suggestion chips (horizontal scroll)
│  │  [Hộ khẩu] [Phạt hành chính]   │ │
│  └─────────────────────────────────┘ │
│  [🎤]            [Hỏi ngay] ➡️     │  ← Voice input (optional) + Primary button
└─────────────────────────────────────┘
```

#### 3. Suggested Questions

```
┌─────────────────────────────────────┐
│  Câu hỏi phổ biến                  │  ← Section title
│  ┌─────────────────────────────────┐ │
│  │ ❓ Thủ tục đăng ký kết hôn?    │ │  ← Clickable question rows
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │ ❓ Cách tính thuế TNCN 2026?   │ │
│  └─────────────────────────────────┘ │
│  ...                                 │
└─────────────────────────────────────┘
```

#### 4. Quick Links

```
┌─────────────────────────────────────┐
│  Truy cập nhanh                     │  ← Section title
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐       │  ← Horizontal scroll cards
│  │📋 │ │📚 │ │⚖️ │ │📖 │       │
│  │Thủ │ │Văn │ │Án  │ │Hướng│       │
│  │tục │ │bản │ │lệ  │ │dẫn │       │
│  └────┘ └────┘ └────┘ └────┘       │
└─────────────────────────────────────┘
```

**States**:

- **Empty state**: Show suggestions + quick links
- **Loading state**: Skeleton loader for answer area
- **Error state**: "Không thể lấy câu trả lời, vui lòng thử lại"

---

### 5.2. Legal Information Page (`/law`)

**Content Types (4 main)**:

1. Legal info / articles
2. Legal documents (văn bản pháp luật)
3. Administrative procedures (thủ tục hành chính)
4. Case law (án lệ)

**Layout**:

#### 1. Filter Bar

```
┌─────────────────────────────────────┐
│  [Tất cả] [Văn bản] [Thủ tục] [Án lệ]  ← Tabs (segmented control)
│  ┌─────────────────────────────────┐ │
│  │ 🔍 Tìm theo từ khóa, số văn bản... │  ← Search input
│  └─────────────────────────────────┘ │
│  [🔽 Bộ lọc]                         │  ← Filter button (opens bottom sheet)
└─────────────────────────────────────┘
```

**Filter Bottom Sheet**:

- **Category**: Dân sự, Hình sự, Thuế, Đất đai, etc.
- **Year**: 2020, 2021, ..., 2026
- **Authority**: Quốc hội, Chính phủ, Bộ, etc.

#### 2. List of Items (Card List)

**For Documents**:

```
┌─────────────────────────────────────┐
│  Luật Dân sự 2015 (sửa đổi 2023)   │  ← Title
│  Quy định về các quan hệ dân sự...  │  ← Short description
│  [Luật] • [Quốc hội] • 01/01/2026   │  ← Meta row
│  [Dân sự] [Quyền sở hữu] [Hợp đồng] │  ← Tags
└─────────────────────────────────────┘
```

**For Procedures**:

```
┌─────────────────────────────────────┐
│  Thủ tục đăng ký kết hôn            │  ← Title
│  ⏱️ 7-10 ngày • 📍 Phường/Xã       │  ← Estimated time + Level
│  [Hộ tịch] [Kết hôn]                │  ← Tags
└─────────────────────────────────────┘
```

**For Case Law**:

```
┌─────────────────────────────────────┐
│  Án lệ 05/2023/AL                   │  ← Case number
│  Tranh chấp hợp đồng mua bán đất... │  ← Brief description
│  ⚖️ Tòa án Tối cao • 2023           │  ← Court level + Year
└─────────────────────────────────────┘
```

#### 3. Document Detail Page (`/law/doc/:id`)

**Layout**:

```
┌─────────────────────────────────────┐
│  Luật Dân sự 2015                   │  ← Title (text-xl font-bold)
│  [Luật] • [91/2015/QH13] • 24/11/2015  ← Meta row
│  Hiệu lực: 01/01/2026               │
│  ┌─────────────────────────────────┐ │
│  │  📋 Tóm tắt                     │ │  ← Overview card
│  │  Luật Dân sự quy định các quan  │ │
│  │  hệ dân sự giữa các chủ thể...  │ │
│  └─────────────────────────────────┘ │
│  ▼ Chương I: Quy định chung         │  ← Accordion sections
│  ▼ Chương II: Chủ thể dân sự        │
│  ▼ Chương III: Giao dịch dân sự     │
│  ...                                 │
│  [Hỏi về văn bản này] [📑 Lưu]      │  ← CTAs
└─────────────────────────────────────┘
```

**CTAs**:

- **"Hỏi về văn bản này"**: Pre-fills question on Home page with context
- **"Lưu"**: Bookmark (if user accounts implemented)

---

### 5.3. Prompt Hub (`/prompts`)

**Goal**: Share, browse, and manage useful AI prompts

**Layout**:

#### 1. Header Area

```
┌─────────────────────────────────────┐
│  Thư viện Prompt         [+ Tạo mới]│  ← Title + New button
└─────────────────────────────────────┘
```

#### 2. Search & Filters

```
┌─────────────────────────────────────┐
│  🔍 Tìm prompt...                    │  ← Search input
│  [Pháp luật] [Giáo dục] [Marketing]  │  ← Filter chips (horizontal scroll)
│  [Viết lách] [Năng suất]            │
│  [📋 List] [⊞ Grid]                  │  ← Toggle view
└─────────────────────────────────────┘
```

#### 3. Prompt Cards

```
┌─────────────────────────────────────┐
│  Phân tích hợp đồng mua bán        │  ← Title
│  Prompt giúp phân tích các điều...  │  ← Short description
│  [Pháp luật] [Hợp đồng]             │  ← Tags
│  [Công khai] [📋 Copy]              │  ← Badge + Action
└─────────────────────────────────────┘
```

#### 4. Prompt Detail (`/prompts/:id`)

```
┌─────────────────────────────────────┐
│  Phân tích hợp đồng mua bán        │  ← Title
│  [Pháp luật] [Hợp đồng]             │  ← Category + Tags
│  ┌─────────────────────────────────┐ │
│  │  Bạn là luật sư chuyên nghiệp.  │ │  ← Full prompt body
│  │  Hãy phân tích hợp đồng sau:    │ │  (monospace font)
│  │  {{contract_text}}              │ │
│  │  Đưa ra nhận xét về...          │ │
│  └─────────────────────────────────┘ │
│  [📋 Copy prompt] [✏️ Sửa] [🔄 Nhân bản]  ← Actions
└─────────────────────────────────────┘
```

**Prompt Data Structure**:

```ts
type Prompt = {
  id: string;
  title: string;
  body: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt?: string;
};
```

---

### 5.4. Fun AI Apps Catalog (`/apps`)

**Note**: This section will have 20-30+ mini-apps, so design must scale

**Layout**:

#### 1. Intro

```
┌─────────────────────────────────────┐
│  ✨ Ứng dụng AI Vui                │  ← Title
│  Tạo lời chúc, thơ, tử vi và nhiều hơn  ← Subtitle
└─────────────────────────────────────┘
```

#### 2. Category Filters

```
┌─────────────────────────────────────┐
│  [🔮 Tử vi] [🎉 Lời chúc] [✍️ Thơ]  │  ← Chips (horizontal scroll)
│  [💬 Caption] [🎨 Khác]              │
└─────────────────────────────────────┘
```

#### 3. App Grid/List

```
┌─────────────────────────────────────┐
│  ┌──────────┐ ┌──────────┐          │
│  │ 🎂       │ │ 🔮       │          │  ← Icon
│  │ Lời chúc │ │ Vận Mệnh │          │  ← App name
│  │ Sinh nhật│ │ Của Bạn  │          │
│  └──────────┘ └──────────┘          │
│  ┌──────────┐ ┌──────────┐          │
│  │ ✨       │ │ ✍️       │          │
│  │ Tử Vi    │ │ Thơ Tình │          │
│  │ Chuyên Sâu│ │ Yêu     │          │
│  └──────────┘ └──────────┘          │
└─────────────────────────────────────┘
```

**Migrated Apps** (from FacebookApp):

1. **van-menh** (Vận Mệnh Của Bạn)
2. **tu-vi-chuyen-sau** (Tử Vi Chuyên Sâu)

### 5.5. Single Mini-App Page (`/apps/:slug`)

**Goal**: Simple form → generate result → easy copy/share

**Example: Birthday Wish Generator**

```
┌─────────────────────────────────────┐
│  🎂 Lời Chúc Sinh Nhật              │  ← Title
│  Tạo lời chúc sinh nhật độc đáo...  │  ← Short description
│  ┌─────────────────────────────────┐ │
│  │  Tên người được chúc:           │ │  ← Input fields
│  │  ┌─────────────────────────────┐ │ │
│  │  │ Nhập tên...                 │ │ │
│  │  └─────────────────────────────┘ │ │
│  │  Dịp chúc:                      │ │
│  │  [Sinh nhật] [Tuổi mới] [Khác]  │ │
│  │  Phong cách:                    │ │
│  │  [Vui vẻ] [Trang trọng] [Hài]   │ │
│  └─────────────────────────────────┘ │
│  [Tạo lời chúc] ✨                  │  ← Primary button (accent color)
│  ┌─────────────────────────────────┐ │
│  │  📝 Kết quả                     │ │  ← Result area (after generation)
│  │  Chúc [Tên] sinh nhật vui vẻ... │ │
│  │  [📋 Copy] [📤 Chia sẻ FB]      │ │  ← Action buttons
│  └─────────────────────────────────┘ │
│  [🔄 Tạo lại]                        │  ← Regenerate button (optional)
└─────────────────────────────────────┘
```

**MiniApp Data Structure**:

```ts
type MiniApp = {
  slug: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  fields: {
    id: string;
    label: string;
    type: "text" | "textarea" | "select" | "radio" | "checkbox";
    placeholder?: string;
    options?: string[];
    required?: boolean;
  }[];
};
```

**Share Behavior**:

- **Copy**: Copy result text to clipboard
- **Share FB**: Open `https://www.facebook.com/sharer/sharer.php?u=[resultUrl]` or copy text for user to paste

---

## 6. PWA BEHAVIOR

### 6.1. Web App Manifest

**File**: `public/manifest.json`

```json
{
  "name": "Trợ Lý Pháp Lý",
  "short_name": "TroLyPhapLy",
  "description": "Legal Q&A and Assistant for Vietnamese Citizens",
  "theme_color": "#0B3B70",
  "background_color": "#FFFFFF",
  "display": "standalone",
  "orientation": "portrait-primary",
  "scope": "/",
  "start_url": "/",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### 6.2. Service Worker (Basic)

**Strategy**:

- **Cache app shell**: HTML, JS, CSS for offline use
- **Network first**: API calls (legal documents, Q&A)
- **Cache then network**: Images, static assets

**Optional**: Show in-app banner "Cài đặt ứng dụng" (Add to home screen prompt)

### 6.3. PWA Criteria Checklist

- ✅ Served over HTTPS
- ✅ Has valid manifest.json
- ✅ Has registered service worker
- ✅ Responsive on all screen sizes
- ✅ Works offline (at least app shell)

---

## 7. SHARED COMPONENTS LIBRARY

### Core Reusable Components

#### Layout Components

- **`AppShell`**: Top-level layout wrapper
- **`Header`**: Top navigation bar
- **`BottomNav`**: Bottom navigation tabs (mobile)

#### UI Components

- **`SearchBar`**: Search input with icon
- **`Chip`**: Filter/tag chip (clickable, selectable)
- **`Card`**: Base card component with variants
- **`PrimaryButton`**: Primary CTA button
- **`SecondaryButton`**: Secondary button
- **`AccentButton`**: Accent/highlight button

#### Content Components

- **`PromptCard`**: Card for displaying prompts
- **`MiniAppCard`**: Card for mini-app in catalog
- **`LegalDocCard`**: Card for legal documents
- **`ProcedureCard`**: Card for administrative procedures
- **`CaseLawCard`**: Card for case law

#### Interactive Components

- **`Accordion`**: Collapsible sections (for document chapters)
- **`TagList`**: List of tags/chips
- **`EmptyState`**: Icon + text for empty states
- **`BottomSheet`**: Modal drawer from bottom (filters)
- **`Toast`**: Notification toast (success, error, info)

#### Form Components

- **`TextInput`**: Single-line text input
- **`TextArea`**: Multi-line text input
- **`Select`**: Dropdown select
- **`RadioGroup`**: Radio button group
- **`CheckboxGroup`**: Checkbox group

---

## 8. EXAMPLE: ROUTE & COMPONENT SKELETON

### AppShell Component (Pseudo-code)

```tsx
// File: src/components/layout/AppShell.tsx

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto max-w-md w-full mx-auto px-4 py-3">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
```

### Header Component (Pseudo-code)

```tsx
// File: src/components/layout/Header.tsx

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  rightAction?: React.ReactNode;
}

function Header({ title, showBackButton, rightAction }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 bg-[var(--color-primary)] text-white shadow-md z-40">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {showBackButton ? (
          <button onClick={() => router.back()} className="p-1">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <ScaleIcon className="w-6 h-6" />
            <span className="font-semibold">Trợ Lý Pháp Lý</span>
          </div>
        )}
        {title && <h1 className="text-lg font-semibold">{title}</h1>}
        {rightAction && <div>{rightAction}</div>}
      </div>
    </header>
  );
}
```

### BottomNav Component (Pseudo-code)

```tsx
// File: src/components/layout/BottomNav.tsx

function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    { href: "/", icon: HomeIcon, label: "Trang chủ" },
    { href: "/law", icon: BookOpenIcon, label: "Pháp luật" },
    { href: "/prompts", icon: LightBulbIcon, label: "Prompt" },
    { href: "/apps", icon: SparklesIcon, label: "Ứng dụng" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto grid grid-cols-4">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center py-2 px-1 ${
                isActive ? "text-[var(--color-primary)]" : "text-gray-500"
              }`}
            >
              <tab.icon className="w-6 h-6" />
              <span className="text-xs mt-1">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

---

## 9. MIGRATION NOTES (from FacebookApp)

### 9.1. Apps to Migrate

1. **van-menh** (Vận Mệnh Của Bạn)

   - Input: Names (array), style
   - Output: Calligraphy text on background image
   - Background: `backgrounds/van-menh.jpg`

2. **tu-vi-chuyen-sau** (Tử Vi Chuyên Sâu)
   - Input: Name, date of birth, gender, question
   - Output: Detailed horoscope reading
   - Background: `backgrounds/tu-vi.jpg`

### 9.2. Migration Strategy

- **Code**: Copy UI components, form logic, rendering logic
- **Database**: Copy app records (definition only)
- **Assets**: Copy background images to `public/backgrounds/`
- **Results**: DO NOT migrate historical results (fresh start)

### 9.3. Shared Libraries to Copy

From FacebookApp `src/lib/`:

- **`gemini.ts`**: Gemini API wrapper (callGeminiText, parseGeminiJSON)
- **`storage.ts`**: Supabase upload/delete helpers
- **`analytics.ts`**: Event logging, stats tracking
- **`auth.ts`**: bcrypt hash/compare
- **`render.ts`**: renderTextOnImage (Sharp + SVG)

---

## 10. ACCESSIBILITY CONSIDERATIONS

### 10.1. WCAG 2.1 Level AA Compliance

- **Color contrast**: All text must have at least 4.5:1 contrast ratio
- **Focus indicators**: Visible focus outlines on all interactive elements
- **Keyboard navigation**: All features accessible via keyboard
- **Screen reader support**: Proper ARIA labels and semantic HTML

### 10.2. Mobile Accessibility

- **Touch targets**: Minimum 44x44px tap targets
- **Font size**: Minimum 14px (0.875rem) for body text
- **Zoom**: Support up to 200% zoom without layout breaking

---

## 11. PERFORMANCE TARGETS

### 11.1. Core Web Vitals

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### 11.2. Optimization Strategies

- **Image optimization**: Use Next.js Image component, WebP format
- **Code splitting**: Dynamic imports for heavy components
- **Font loading**: Use font-display: swap
- **API caching**: Cache legal documents, prompts for 1 hour

---

## 12. RESPONSIVE DESIGN BREAKPOINTS

```css
/* Mobile First (default) */
/* 0px - 639px */

/* Tablet */
@media (min-width: 640px) {
  /* sm */
}

/* Desktop */
@media (min-width: 768px) {
  /* md */
}
@media (min-width: 1024px) {
  /* lg */
}
```

**Note**: Primary focus is mobile (320px - 428px), desktop is secondary

---

## 13. LOCALIZATION NOTES

### 13.1. Language

- **Primary**: Vietnamese (vi-VN)
- **Fallback**: English (en-US) for error messages, tech terms

### 13.2. Date/Time Format

- **Date**: DD/MM/YYYY (Vietnamese standard)
- **Time**: HH:mm (24-hour format)
- **Relative time**: "5 phút trước", "2 giờ trước", "3 ngày trước"

### 13.3. Currency

- **Format**: 1.000.000 VND (dot as thousands separator)

---

## 14. ANALYTICS & TRACKING

### 14.1. Events to Track

- **Page views**: All page navigations
- **Q&A submissions**: Question text (anonymized), category
- **Document views**: Document ID, title
- **Prompt usage**: Prompt ID, copy action
- **Mini-app usage**: App slug, submission count
- **Share actions**: Share platform, app slug

### 14.2. Metrics to Track

- **Daily Active Users** (DAU)
- **Most asked questions** (top 10)
- **Most viewed documents** (top 10)
- **Most used prompts** (top 10)
- **Most popular mini-apps** (top 10)

---

## 15. FUTURE ENHANCEMENTS (Post-MVP)

### 15.1. User Accounts

- **Registration**: Email/password or social login
- **Profile**: Save favorite documents, prompts, apps
- **History**: View past questions, generated results

### 15.2. Advanced Features

- **Voice input**: Speech-to-text for Q&A
- **Document upload**: Upload PDF/image for analysis
- **Chat mode**: Multi-turn conversation for complex questions
- **Notifications**: Push notifications for legal updates

### 15.3. Monetization (Optional)

- **Premium prompts**: Paid access to advanced prompts
- **Ad-free tier**: Subscription for no ads
- **API access**: For developers to integrate legal Q&A

---

## APPENDIX: COLOR PALETTE REFERENCE

### Full Color System (Tailwind Config)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0B3B70",
          light: "#1F4E82",
          soft: "#E6EEF7",
        },
        accent: {
          DEFAULT: "#E5A100",
          soft: "#FFF4D6",
        },
        // ... other colors
      },
    },
  },
};
```

---

**END OF UX/UI SPECIFICATION**

---

**Document prepared by**: GitHub Copilot Agent  
**For project**: TroLyPhapLy (Legal Assistant & Q&A Platform)  
**Date**: 2026  
**Version**: 1.0
