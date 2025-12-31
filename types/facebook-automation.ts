/**
 * TypeScript types for Facebook Page Automation
 * Generated: 2024-12-23
 */

// ============================================
// FACEBOOK CONNECTION
// ============================================
export interface FacebookConnection {
  id: string;
  userAccessToken: string;
  tokenExpiresAt: Date | null;
  scopes: string[];
  status: 'active' | 'expired' | 'revoked';
  lastVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// FACEBOOK PAGE
// ============================================
export interface FacebookPage {
  id: string;
  pageId: string;
  pageName: string;
  pageAccessToken: string;
  category: string | null;
  followerCount: number | null;
  automationEnabled: boolean;
  status: 'active' | 'inactive';
  lastSyncAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// AUTO REPLY RULE
// ============================================
export interface AutoReplyRule {
  id: string;
  name: string;
  pageId: string;
  postId: string | null; // null = apply to all posts
  triggerType: 'all' | 'keyword';
  keywords: string[];
  excludeKeywords: string[];
  replyTemplates: string[]; // Spin syntax: [option1|option2], {placeholders}
  priority: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AutoReplyRuleCreate {
  name: string;
  pageId: string;
  postId?: string | null;
  triggerType?: 'all' | 'keyword';
  keywords?: string[];
  excludeKeywords?: string[];
  replyTemplates: string[];
  priority?: number;
  enabled?: boolean;
}

// ============================================
// AUTO MESSAGE RULE
// ============================================
export interface AutoMessageRule {
  id: string;
  name: string;
  pageId: string;
  triggerOn: ('comment' | 'reaction')[];
  messageTemplate: string;
  cooldownMinutes: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AutoMessageRuleCreate {
  name: string;
  pageId: string;
  triggerOn: ('comment' | 'reaction')[];
  messageTemplate: string;
  cooldownMinutes?: number;
  enabled?: boolean;
}

// ============================================
// FACEBOOK EVENT (Webhook payload)
// ============================================
export interface FacebookEvent {
  id: string;
  eventType: 'comment' | 'reaction' | 'post' | 'feed';
  pageId: string;
  postId: string | null;
  commentId: string | null;
  userId: string | null;
  dedupeKey: string;
  payload: WebhookPayload;
  status: 'received' | 'processed' | 'failed';
  processedAt: Date | null;
  createdAt: Date;
}

export interface WebhookPayload {
  entry: WebhookEntry[];
  object: string;
}

export interface WebhookEntry {
  id: string;
  time: number;
  changes: WebhookChange[];
}

export interface WebhookChange {
  field: string;
  value: WebhookChangeValue;
}

export interface WebhookChangeValue {
  item?: string;
  verb?: string;
  post_id?: string;
  comment_id?: string;
  parent_id?: string;
  from?: {
    id: string;
    name: string;
  };
  message?: string;
  created_time?: number;
  reaction_type?: string;
  [key: string]: any;
}

// ============================================
// AUTOMATION QUEUE
// ============================================
export interface AutomationQueue {
  id: string;
  jobType: 'reply_comment' | 'send_message';
  pageId: string;
  targetId: string; // comment_id or user_id
  payload: AutomationJobPayload;
  scheduledAt: Date;
  attempts: number;
  maxAttempts: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error: string | null;
  completedAt: Date | null;
  createdAt: Date;
}

export interface AutomationJobPayload {
  ruleId?: string;
  content: string;
  postId?: string;
  commentId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

// ============================================
// AUTOMATION LOG
// ============================================
export interface AutomationLog {
  id: string;
  actionType: 'reply_sent' | 'message_sent' | 'rule_matched' | 'skipped' | 'failed';
  pageId: string;
  postId: string | null;
  targetId: string | null;
  ruleId: string | null;
  contentSent: string | null;
  status: 'success' | 'failed' | 'skipped';
  metadata: Record<string, any> | null;
  createdAt: Date;
}

// ============================================
// PAGE STATS
// ============================================
export interface PageStats {
  pageId: string;
  date: Date;
  commentsTotal: number;
  repliesSent: number;
  messagesSent: number;
  reactionsTotal: number;
  failedJobs: number;
}

// ============================================
// SYSTEM CONFIG
// ============================================
export interface SystemConfig {
  key: string;
  value: any;
  updatedAt: Date;
}

export interface SafeModeConfig {
  enabled: boolean;
  reason: string | null;
}

export interface RateLimitConfig {
  replies_per_page_per_minute: number;
  replies_per_user_per_minutes: number;
  messages_per_page_per_hour: number;
}

// ============================================
// GRAPH API TYPES
// ============================================
export interface GraphAPIPage {
  id: string;
  name: string;
  access_token: string;
  category?: string;
  followers_count?: number;
  tasks?: string[];
}

export interface GraphAPIPost {
  id: string;
  message?: string;
  story?: string;
  created_time: string;
  updated_time: string;
  permalink_url?: string;
  comments?: {
    data: GraphAPIComment[];
    summary: {
      total_count: number;
    };
  };
  reactions?: {
    summary: {
      total_count: number;
    };
  };
}

export interface GraphAPIComment {
  id: string;
  message: string;
  from: {
    id: string;
    name: string;
  };
  created_time: string;
  parent?: {
    id: string;
  };
  can_reply_privately?: boolean;
}

// ============================================
// SPIN CONTENT TYPES
// ============================================
export interface SpinConfig {
  placeholders: Record<string, string>; // {full_name: "Nguyễn Văn A"}
  spinSyntax: string; // "[Hello|Hi|Hey] {full_name}"
}

export interface SpinResult {
  original: string;
  spun: string;
  placeholdersUsed: string[];
}

// ============================================
// RATE LIMITER TYPES
// ============================================
export interface RateLimitCheck {
  allowed: boolean;
  reason?: string;
  retryAfter?: number; // seconds
}

export interface RateLimitKey {
  type: 'page_reply' | 'user_reply' | 'page_message';
  pageId: string;
  userId?: string;
}
