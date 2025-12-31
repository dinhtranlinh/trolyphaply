# 📘 Facebook Page Automation - User Guide

> **For**: Admin users of TroLyPhapLy  
> **Version**: 1.0.0  
> **Last Updated**: December 23, 2025

---

## 📑 Table of Contents

1. [Getting Started](#getting-started)
2. [Connection Setup](#connection-setup)
3. [Managing Pages](#managing-pages)
4. [Auto Reply Rules](#auto-reply-rules)
5. [Auto Message Rules](#auto-message-rules)
6. [Monitoring Events](#monitoring-events)
7. [Viewing Logs](#viewing-logs)
8. [Safe Mode](#safe-mode)
9. [Template Syntax Guide](#template-syntax-guide)
10. [Troubleshooting](#troubleshooting)

---

## 🚀 Getting Started

### What is Facebook Page Automation?

Facebook Page Automation automatically responds to user interactions on your Facebook pages:

- **Auto Reply**: Responds to comments on posts
- **Auto Message**: Sends inbox messages when users comment or react

### Access the Admin Panel

Navigate to: `/admin/facebook` in your browser

**Navigation Tabs**:

- **Dashboard** - Overview and statistics
- **Connection** - Facebook token management
- **Pages** - Manage connected pages
- **Reply Rules** - Comment auto-replies
- **Message Rules** - Inbox automation
- **Events** - Webhook event stream
- **Logs** - Action history

---

## 🔗 Connection Setup

### Step 1: Get Facebook Access Token

1. Go to [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app from the dropdown
3. Click **"Get Token"** → **"Get User Access Token"**
4. Select these permissions:
   - `pages_manage_metadata`
   - `pages_read_engagement`
   - `pages_messaging`
   - `pages_manage_posts`
   - `pages_read_user_content`
5. Click **"Generate Access Token"**
6. Copy the token

### Step 2: Save Token in TroLyPhapLy

1. Go to **Connection** tab
2. Paste token in the textarea
3. Click **"Verify Token"** to check validity
4. If valid, click **"Save & Connect"**

✅ **Connection Status**: Green badge in header means connected

### Token Expiration

Tokens expire after 60 days. You'll see:

- Yellow badge: Token expires soon (< 7 days)
- Red badge: Token expired

**To renew**: Repeat Step 1-2 with new token

---

## 📄 Managing Pages

### Sync Pages from Facebook

1. Go to **Pages** tab
2. Click **"Sync Pages"** button
3. All pages you manage will appear in the table

### Enable/Disable Automation

**Per Page**:

- Toggle the switch in the **Automation** column
- Green = Active, Gray = Inactive

**Bulk Operation**:

- Currently not available (coming soon)

### View Page Details

Click **"View"** to see:

- Page information (name, category, followers)
- Today's statistics (sent, failed, success rate)
- Recent activity logs
- Quick links to rules

### Remove Page

1. Click **"Remove"** in page row
2. Confirm deletion
3. ⚠️ This also deletes all associated rules and logs

---

## 💬 Auto Reply Rules

Auto Reply Rules respond to comments on your posts.

### Create New Rule

1. Go to **Reply Rules** tab
2. Click **"+ Create Rule"**
3. Fill in the form:

#### Basic Information

- **Rule Name**: Descriptive name (e.g., "Welcome New Commenters")
- **Facebook Page**: Select target page
- **Post ID** (optional): Reply only on specific post

#### Trigger Settings

- **All Comments**: Reply to every comment
- **Keyword Match**: Reply only if comment contains keywords

If using keywords:

- **Keywords**: Type and press Enter to add (e.g., "giá", "mua", "liên hệ")
- **Exclude Keywords**: Blacklist words (e.g., "spam", "bad")

#### Reply Template

Use the template editor with:

- **Placeholders**: `{full_name}`, `{first_name}`
- **Spin Syntax**: `[option1|option2|option3]` for variations
- Click **"Show Help"** for syntax guide

Example:

```
[Xin chào|Chào bạn] {full_name}!

[Cảm ơn|Thanks] đã [comment|bình luận] về [vấn đề|chủ đề] này.

[Chúng tôi sẽ|Team mình sẽ] [trả lời|phản hồi] [sớm nhất|ngay] có thể. 🙏
```

#### Advanced Settings

- **Priority** (1-10): Higher = checked first (default: 5)
- **Daily Limit**: Max replies per day (optional)
- **Enable**: Activate immediately

4. Click **"Preview"** to see variations
5. Click **"Save Rule"**

### Edit Existing Rule

1. Click rule name in table
2. Modify fields
3. Click **"Save Rule"**

### Enable/Disable Rule

Toggle the status badge in the rules table:

- Click **"Active"** → becomes **"Inactive"**
- Click **"Inactive"** → becomes **"Active"**

### Delete Rule

1. Click **"Delete"** in rule row
2. Click **"Confirm?"** to proceed

---

## 📨 Auto Message Rules

Auto Message Rules send inbox messages when users interact.

### Create New Rule

1. Go to **Message Rules** tab
2. Click **"+ Create Rule"**
3. Fill in the form:

#### Basic Information

- **Rule Name**: Descriptive name
- **Facebook Page**: Select target page

#### Trigger Settings

Select when to send message:

- ☑️ **Comments on a post**: User leaves comment
- ☑️ **Reacts to a post**: User reacts (like, love, etc.)

⚠️ At least one trigger must be selected

**Cooldown Period** (minutes):

- Minimum time between messages to same user
- Default: 60 minutes
- Prevents spam

#### Message Template

Same as Reply Rules:

- Use placeholders and spin syntax
- Click **"Preview"** to test

#### Advanced Settings

- **Priority** (1-10)
- **Daily Limit**: Max messages per day
- **Enable**: Activate immediately

4. Click **"Save Rule"**

### How Cooldown Works

1. User triggers action (comment/reaction)
2. System checks: Has user received message in last X minutes?
   - ✅ No → Send message, start cooldown timer
   - ❌ Yes → Skip (user in cooldown)
3. After X minutes, user can receive again

**Example**: 60-minute cooldown

- 10:00 AM - User comments → Message sent
- 10:30 AM - Same user reacts → Skipped (in cooldown)
- 11:05 AM - Same user comments again → Message sent

---

## 📡 Monitoring Events

Events are webhook notifications from Facebook.

### View Event Stream

1. Go to **Events** tab
2. Events display in real-time timeline

### Event Types

- 💬 **Comment**: User commented on post
- 👍 **Reaction**: User reacted to post
- ✉️ **Message**: User sent inbox message
- 📢 **Mention**: User mentioned page

### Filter Events

Use dropdowns to filter by:

- **Page**: Specific page or all pages
- **Event Type**: comment/reaction/message/mention
- **Status**: pending/processed/failed

### Auto-Refresh

Toggle **"Auto-refresh (10s)"** to:

- ✅ Checked: Updates every 10 seconds
- ☐ Unchecked: Manual refresh only

### View Event Details

Click any event to see:

- Event ID, type, status
- Page ID and name
- User ID
- Post ID, Comment ID (if applicable)
- Timestamp

---

## 📊 Viewing Logs

Logs record every automated action.

### View Logs

1. Go to **Logs** tab
2. Logs display in table format

### Filter Logs

Use 5 filter fields:

- **Page**: Specific page or all
- **Action Type**: Comment Reply / Inbox Message
- **Status**: Sent / Failed
- **Start Date**: Beginning of date range
- **End Date**: End of date range

Click **"Clear Filters"** to reset

### Export to CSV

1. Apply filters (optional)
2. Click **"📥 Export CSV"**
3. File downloads automatically
4. Filename: `facebook-logs-YYYY-MM-DD.csv`

**CSV Columns**:

- ID, Page ID, Rule ID
- Action Type, Status
- User ID, User Name
- Comment Text, Response Text
- Error Message (if failed)
- Trigger, Sent At, Created At

### View Log Details

Click **"View"** to see:

- Basic information (action, status, page, rule)
- User information (name, ID)
- User comment (blue box)
- Bot response (green box)
- Error message (red box, if failed)
- Trigger details

---

## 🛡️ Safe Mode

Safe Mode is a **global kill-switch** that disables all automation.

### When to Use Safe Mode

- Emergency: Stop all automated replies/messages
- Maintenance: Pause while updating rules
- Testing: Prevent accidental sends

### Enable/Disable Safe Mode

**From Dashboard**:

1. Go to **Dashboard** tab
2. Find "Safe Mode" card
3. Toggle switch

**Status Colors**:

- 🟢 Green "Running" - Automation active
- 🟡 Yellow "Paused" - Automation disabled

### What Safe Mode Does

When **enabled** (paused):

- ❌ Webhook events still received
- ❌ Jobs enqueued but NOT processed
- ❌ No replies or messages sent
- ✅ Queue builds up

When **disabled** (running):

- ✅ Queue processing resumes
- ✅ Pending jobs executed
- ✅ Automation runs normally

⚠️ **Important**: Safe mode does NOT delete queued jobs, only pauses processing

---

## 📝 Template Syntax Guide

### Placeholders

Replace with user information:

| Placeholder    | Replaced With     | Example        |
| -------------- | ----------------- | -------------- |
| `{full_name}`  | User's full name  | "Nguyễn Văn A" |
| `{first_name}` | User's first name | "Nguyễn"       |

**Usage**:

```
Xin chào {full_name}!
```

### Spin Syntax

Create random variations:

**Format**: `[option1|option2|option3]`

**Example**:

```
[Xin chào|Chào bạn|Hi] {full_name}!
```

**Generates**:

- "Xin chào Nguyễn Văn A!"
- "Chào bạn Nguyễn Văn A!"
- "Hi Nguyễn Văn A!"

### Nested Spin

Spin within spin:

```
[Xin chào [bạn|anh|chị]|Chào {first_name}]!
```

**Generates**:

- "Xin chào bạn!"
- "Xin chào anh!"
- "Xin chào chị!"
- "Chào Nguyễn!"

### Best Practices

✅ **DO**:

- Use 3-5 variations per spin group
- Mix formal and informal language
- Keep templates 50-500 characters
- Test with preview before saving
- Ensure all variations sound natural

❌ **DON'T**:

- Leave empty options: `[option1||option3]`
- Use only one option: `[single-option]`
- Forget closing bracket: `[option1|option2`
- Overuse spin (2-4 groups is ideal)

### Template Requirements

- Minimum: 10 characters
- Maximum: 2000 characters
- Must generate at least 5 unique variations
- No empty spin groups
- Balanced brackets `[]` and braces `{}`

---

## 🔧 Troubleshooting

### Connection Issues

**Problem**: Token expired (red badge)

**Solution**:

1. Get new token from Graph Explorer
2. Save in Connection tab
3. Token auto-extends every 60 days

---

**Problem**: Token invalid after saving

**Solution**:

1. Check permissions (need all 5 scopes)
2. Verify app is not in Development mode
3. Check app has Pages API access

---

### Pages Not Syncing

**Problem**: Sync button doesn't add pages

**Solution**:

1. Check token has `pages_manage_metadata` permission
2. Verify you're admin of those pages
3. Check Facebook page status (not deleted/disabled)

---

### Rules Not Triggering

**Problem**: Comment posted but no auto-reply

**Checklist**:

1. ✅ Page automation enabled?
2. ✅ Rule is active (not inactive)?
3. ✅ Safe mode disabled (not paused)?
4. ✅ Keywords match comment (if keyword trigger)?
5. ✅ Daily limit not exceeded?
6. ✅ Not excluded by blacklist?

**Check Logs**:

- Go to Logs tab
- Filter by page and status=failed
- View error message for details

---

**Problem**: Message rule not sending inbox message

**Checklist**:

1. ✅ User in cooldown period? (check cooldown minutes)
2. ✅ Trigger type matches action? (comment vs reaction)
3. ✅ Token has `pages_messaging` permission?
4. ✅ Daily limit not exceeded?

---

### Template Issues

**Problem**: Preview shows error

**Solution**:

1. Check balanced brackets: every `[` has `]`
2. Check balanced braces: every `{` has `}`
3. No empty options: `[option1||option3]` is invalid
4. At least 2 options per spin group
5. Only use valid placeholders: `{full_name}` or `{first_name}`

---

**Problem**: Template saved but variations identical

**Solution**:

- Add more spin syntax groups
- Ensure variations are different
- System requires at least 5 unique outputs

---

### Performance Issues

**Problem**: Slow admin panel loading

**Solution**:

1. Clear browser cache
2. Check date range filters (don't query 1 year)
3. Limit results (use pagination)
4. Check server resources

---

**Problem**: Webhook delays (replies sent late)

**Solution**:

1. Check queue status: `/admin/facebook` → Dashboard
2. If many pending jobs, check safe mode
3. Verify cron jobs running
4. Check rate limits not blocking

---

### API Errors

**Problem**: "Rate limit exceeded" in logs

**Explanation**: Facebook API has rate limits:

- Page reply: 10 per minute
- User message: 1 per 5 minutes
- Page message: 50 per hour

**Solution**:

- System automatically enforces limits
- Wait for rate limit to reset
- Reduce daily limits in rules

---

**Problem**: "Invalid user ID" or "User not found"

**Explanation**: User may have:

- Deleted their Facebook account
- Blocked the page
- Restricted page messaging

**Solution**:

- Error is logged but safe to ignore
- System won't retry these users
- Rule continues working for other users

---

### Data Issues

**Problem**: Missing logs or events

**Explanation**:

- Events: Auto-deleted after 7 days
- Logs: Retained permanently (export regularly)

**Solution**:

- Export logs to CSV monthly
- Archive for compliance

---

**Problem**: Wrong statistics on dashboard

**Solution**:

1. Check date displayed (today vs yesterday)
2. Refresh browser (Ctrl+F5)
3. Check timezone settings
4. Verify counters reset at midnight UTC

---

## 📞 Support

### Need Help?

1. **Check This Guide**: Search for keywords above
2. **Check Logs**: Go to Logs tab, filter by status=failed
3. **Check Events**: Go to Events tab, verify webhooks received
4. **Test Performance**: Run `node test-facebook-automation.js`

### Report Issues

Include in your report:

- Page name and ID
- Rule name and ID
- Screenshot of error
- Relevant log entries
- Steps to reproduce

---

## 🎯 Quick Reference

### Common Tasks

| Task                | Steps                                     |
| ------------------- | ----------------------------------------- |
| Add new page        | Connection → Sync Pages                   |
| Create reply rule   | Reply Rules → Create → Fill form → Save   |
| Create message rule | Message Rules → Create → Fill form → Save |
| Pause automation    | Dashboard → Toggle Safe Mode              |
| Export logs         | Logs → Set filters → Export CSV           |
| Check today's stats | Dashboard → View KPI cards                |
| Test template       | Rule editor → Type → Click Preview        |
| View error details  | Logs → Filter status=failed → View        |

### Keyboard Shortcuts

None currently available (coming soon)

---

**Document Version**: 1.0.0  
**Last Updated**: December 23, 2025  
**Feedback**: Contact admin for improvements
