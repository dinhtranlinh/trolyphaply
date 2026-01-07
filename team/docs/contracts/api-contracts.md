# API Contracts

## Conventions

- Base URL (dev): `http://localhost:3456`
- Base URL (prod): `https://trolyphaply.vn`
- Content-Type: `application/json`
- Error format: xem `error-codes.md`
- Auth (admin):
  - Cookie: `admin_session` (httpOnly)
  - Client token (localStorage): `adminToken` (used by UI)
  - `/admin/customers` có thêm 2FA gate (PIN + TOTP)

---

## Public APIs

### POST /api/qa

Request:

```json
{ "question": "string", "styleGuideId": "uuid?" }
```

Response:

```json
{ "success": true, "answer": "string", "question": "string", "fromCache": true, "styleGuide": { "id": "uuid", "name": "string" } }
```

### POST /api/share-text

Request:

```json
{ "answer": "string", "question": "string?" }
```

Response:

```json
{ "success": true, "shareText": "string", "fromCache": false, "usedFallback": false }
```

### GET /api/law/documents

Query: `?search=&category=&limit=&offset=`

### GET /api/law/documents/[id]

### GET /api/law/procedures

Query: `?search=&category=&limit=&offset=`

### GET /api/ai-prompts

Query: `?search=&category=&creatorCode=&sortBy=&limit=&offset=`

### POST /api/ai-prompts

Request:

```json
{ "title": "string", "prompt_template": "string", "category": "string", "description": "string?", "tags": ["string"], "creator_code": "string?" }
```

### GET /api/apps

### GET /api/apps/[slug]

### POST /api/run/[slug]

Request: app input JSON theo `apps.input_schema`

---

## Admin Auth APIs

### POST /api/admin/login

Request:

```json
{ "email": "string", "password": "string" }
```

Response:

```json
{ "success": true, "token": "admin_xxx", "admin": { "id": "uuid", "email": "string" } }
```

### POST /api/admin/logout

### GET /api/admin/session

---

## Admin Customers (Bảo mật cao)

### GET /api/admin/customers/2fa/status

Response:

```json
{ "success": true, "verified": false }
```

### POST /api/admin/customers/2fa/verify

Request:

```json
{ "pin": "string", "code": "string" }
```

### GET /api/admin/customers

Query: `?search=&tag=`

### POST /api/admin/customers

Request:

```json
{ "name": "string", "phone": "string", "tagIds": ["uuid"] }
```

### PATCH /api/admin/customers/[id]

### DELETE /api/admin/customers/[id]

### POST /api/admin/customers/import

Request:

```json
{ "content": "name|phone\\n...", "tagIds": ["uuid"] }
```

---

## Admin Customers Tags

### GET /api/admin/customer-tags

### POST /api/admin/customer-tags

### PATCH /api/admin/customer-tags/[id]

### DELETE /api/admin/customer-tags/[id]

---

## Admin Content APIs (tóm tắt)

- `/api/admin/documents` + `/[id]`
- `/api/admin/procedures` + `/[id]`
- `/api/admin/apps` + `/[id]` + `/clone` + `/stats`
- `/api/admin/prompts` + `/[id]` + `/versions`
- `/api/admin/style-guides` + `/[id]` + `/examples`
- `/api/admin/legal-writing-styles` + `/[id]`
- `/api/admin/qa-prompts` + `/[id]` + `/activate` + `/history`
- `/api/admin/legal-library/import` + `/export`

---

## Facebook Automation APIs (tóm tắt)

- `/api/facebook/webhooks` (GET verify, POST events)
- `/api/facebook/connection` + `/verify`
- `/api/facebook/pages` + `/[id]` + `/subscribe` + `/subscribe-all`
- `/api/facebook/reply-rules` + `/[id]` + `/test` + `/preview` + `/bulk`
- `/api/facebook/message-rules` + `/[id]` + `/test` + `/bulk`
- `/api/facebook/queue/status`
- `/api/facebook/logs` + `/export` + `/[id]`
- `/api/facebook/events` + `/[id]` + `/stats`
