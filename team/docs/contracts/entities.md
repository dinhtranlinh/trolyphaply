# Entities (Domain Models)

## Admin

- AdminUser: { id, email, passwordHash, createdAt }
  - Map: `admin_users`

## Content

- LegalDocument: { id, title, docNumber, type, authority, issueDate, effectiveDate, summary, content, tags, category, status }
  - Map: `legal_documents`
- Procedure: { id, title, authority, timeEst, category, steps, documents, fees, notes, tags, status }
  - Map: `procedures`
- Prompt: { id, title, body, category, tags, isPublic }
  - Map: `prompts`, `prompt_versions`
- StyleGuide: { id, name, description, characteristics, tone, language, isDefault, examples[] }
  - Map: `style_guides`, `style_guide_examples`

## Q&A Prompt System

- QAPrompt: { id, name, promptText, description, isActive, version }
  - Map: `qa_prompts`, `qa_prompt_history`
- LegalWritingStyle: { id, name, description, exampleContent, tone, characteristics }
  - Map: `legal_writing_styles`
- QAPromptWritingStyle: { promptId, styleId, priority }
  - Map: `qa_prompt_writing_styles`
- QASessionContext: { sessionId, context, updatedAt }
  - Map: `qa_session_contexts`

## Apps & Analytics

- App: { id, slug, name, type, inputSchema, promptTemplate, outputSchema, renderConfig, shareConfig, limits, status }
  - Map: `apps`
- Result: { id, appId, inputData, outputData, imageUrl, metadata, createdAt }
  - Map: `results`
- AppStatsDaily: { appId, date, views, submits, shares, affiliateClicks }
  - Map: `app_stats_daily`
- AppEvent: { id, appId, eventType, resultId, metadata, createdAt }
  - Map: `app_events`

## Customers (Admin)

- CustomerTag: { id, name }
  - Map: `customer_tags`
- Customer: { id, name, phoneEncrypted, phoneHash, phoneLast4, createdAt }
  - Map: `customers`
- CustomerTagLink: { customerId, tagId }
  - Map: `customer_tag_links`

## Facebook Automation

- FacebookConnection: { id, userAccessToken, scopes, status, tokenExpiresAt }
  - Map: `facebook_connection`
- FacebookPage: { id, pageId, pageName, pageAccessToken, status, automationEnabled }
  - Map: `facebook_pages`
- AutoReplyRule: { id, pageId, postId, triggerType, keywords, excludeKeywords, replyTemplates, enabled }
  - Map: `auto_reply_rules`
- AutoMessageRule: { id, pageId, triggerOn, messageTemplate, cooldownMinutes, enabled }
  - Map: `auto_message_rules`
- FacebookEvent: { id, eventType, pageId, postId, commentId, userId, dedupeKey, payload, status }
  - Map: `facebook_events`
- AutomationQueue: { id, jobType, pageId, targetId, payload, scheduledAt, attempts, status }
  - Map: `automation_queue`
- AutomationLog: { id, actionType, pageId, targetId, ruleId, contentSent, status, metadata }
  - Map: `automation_logs`
