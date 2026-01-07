# DB Schema

> Nguồn: `prisma/schema.prisma`, migrations trong `prisma/migrations`, và truy vết code (`.from('table')`).

## Core content

### legal_documents

- id (uuid, PK)
- title, doc_number, type, authority
- issue_date, effective_date
- summary (text), content (jsonb), tags (text[])
- category, status
- created_at, updated_at

### procedures

- id (uuid, PK)
- title, authority, time_est, category
- steps (jsonb), documents (jsonb), fees, notes
- tags (text[]), status
- created_at, updated_at

### prompts

- id (uuid, PK), title, body (text), category, tags (text[])
- is_public (bool)
- created_at, updated_at

### style_guides

- id (uuid, PK), name, description (text)
- characteristics (text[]), tone, language, is_default
- created_at, updated_at

### style_guide_examples

- id (uuid, PK)
- style_guide_id (FK -> style_guides.id)
- question, answer (text)
- created_at

### ai_image_prompts

- id (uuid, PK)
- title, description, prompt_template
- example_image_url, creator_code
- category, tags, is_public
- likes_count, views_count
- created_at, updated_at

### prompt_versions

- id (uuid, PK)
- prompt_id (FK -> prompts.id)
- version, title, body, category, tags
- created_at

### data_sources

- id (uuid, PK)
- name, source_type, config (jsonb)
- created_at, updated_at

### apps / results / analytics

- apps: id, slug (unique), name, type, input_schema, prompt_template, output_schema, render_config, share_config, limits, status, created_at, updated_at
- results: id, app_id (FK), input_data, output_data, image_url, metadata, created_at
- app_stats_daily: app_id + date (PK), views, submits, shares, affiliate_clicks
- app_events: id (bigint), app_id, event_type, result_id, metadata, created_at

## Q&A prompt system

### qa_prompts

- id (uuid, PK)
- name, prompt_text (text), description
- is_active (bool), version (int)
- created_at, updated_at

### qa_prompt_history

- id (uuid, PK)
- prompt_id (FK), version, prompt_text
- changed_by, change_description
- created_at

### legal_writing_styles

- id (uuid, PK)
- name, description, example_content
- tone, characteristics
- created_at, updated_at

### qa_prompt_writing_styles

- prompt_id (FK), style_id (FK), priority

### qa_session_contexts

- session_id (uuid, PK)
- context (text)
- created_at, updated_at

## Admin auth

### admin_users

- id (uuid, PK)
- email (unique)
- password (bcrypt hash)
- created_at, updated_at

## Customers (admin/customers)

### customer_tags

- id (uuid, PK), name (unique)
- created_at, updated_at

### customers

- id (uuid, PK)
- name
- phone (legacy, nullable)
- phone_encrypted (text)
- phone_hash (unique)
- phone_last4
- created_at, updated_at

### customer_tag_links

- customer_id (FK), tag_id (FK)
- created_at

## Facebook automation

### facebook_connection

- id (uuid, PK)
- user_access_token (text)
- token_expires_at, scopes (text[])
- status, last_verified_at
- created_at, updated_at

### facebook_pages

- id (uuid, PK)
- page_id (unique), page_name
- page_access_token (text), category, follower_count
- automation_enabled, status, last_sync_at
- created_at, updated_at

### auto_reply_rules

- id (uuid, PK)
- page_id (FK), post_id
- trigger_type, keywords, exclude_keywords
- reply_templates (text[])
- priority, enabled
- created_at, updated_at

### auto_message_rules

- id (uuid, PK)
- page_id (FK)
- trigger_on (text[]), message_template (text)
- cooldown_minutes, enabled
- created_at, updated_at

### facebook_events

- id (uuid, PK)
- event_type, page_id, post_id, comment_id, user_id
- dedupe_key (unique), payload (jsonb)
- status, processed_at, created_at

### automation_queue

- id (uuid, PK)
- job_type, page_id, target_id
- payload (jsonb)
- scheduled_at, attempts, max_attempts
- status, error, completed_at, created_at

### automation_logs

- id (uuid, PK)
- action_type, page_id, post_id, target_id, rule_id
- content_sent, status, metadata
- created_at

### page_stats

- page_id + date (PK)
- comments_total, replies_sent, messages_sent, reactions_total, failed_jobs

### system_config

- key (PK), value (jsonb), updated_at

### user_cooldowns / webhook_events / rate_limits

- Được dùng trong code hoặc script, cần xác nhận schema thực tế trong Supabase.

## Migration notes

- Migrations: `prisma/migrations/*/migration.sql`
- Customer phone encryption: `20260106_customers_phone_encryption`
- QA session context: `20260101_qa_session_contexts`
