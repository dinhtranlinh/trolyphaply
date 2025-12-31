/**
 * FACEBOOK AUTOMATION SCHEMA REGISTRY
 * ====================================
 * Single source of truth for all Facebook automation types.
 * 
 * RULES:
 * 1. ALL components must import from this file
 * 2. Field names must match database columns EXACTLY
 * 3. Update this file FIRST when changing DB schema
 * 
 * Last updated: 2025-12-26
 */

// ============================================
// DATABASE TABLES → TypeScript Interfaces
// ============================================

/**
 * Table: facebook_pages
 * Primary key: id (UUID)
 */
export interface FacebookPage {
  id: string;                    // UUID - internal ID
  page_id: string;               // Facebook Page ID (numeric string)
  page_name: string;             // Display name
  category: string | null;
  access_token: string | null;   // Encrypted
  automation_enabled: boolean;
  status: 'active' | 'inactive' | 'error';
  last_sync_at: string | null;   // ISO timestamp
  created_at: string;
  updated_at: string;
}

/**
 * Table: auto_reply_rules
 * Foreign key: page_id → facebook_pages.id (UUID)
 */
export interface ReplyRule {
  id: string;                    // UUID
  page_id: string;               // UUID (NOT Facebook page_id!)
  name: string;
  keywords: string[];            // PostgreSQL TEXT[]
  match_type: 'any' | 'all' | 'exact';
  reply_template: string;        // Spin syntax supported
  cooldown_minutes: number;
  priority: number;
  enabled: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Table: auto_message_rules
 * Foreign key: page_id → facebook_pages.id (UUID)
 */
export interface MessageRule {
  id: string;                    // UUID
  page_id: string;               // UUID (NOT Facebook page_id!)
  name: string;
  trigger_on: ('comment' | 'reaction')[];  // PostgreSQL TEXT[]
  message_template: string;      // Spin syntax supported
  cooldown_minutes: number;
  enabled: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Table: automation_queue
 */
export interface AutomationJob {
  id: string;                    // UUID
  job_type: 'reply_comment' | 'send_message';
  page_id: string;               // Facebook Page ID (NOT UUID!)
  target_id: string;
  payload: JobPayload;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts: number;
  max_attempts: number;
  error: string | null;
  scheduled_at: string;
  created_at: string;
  updated_at: string;
}

export interface JobPayload {
  eventType: string;
  post_id?: string;
  comment_id?: string;
  user_id?: string;
  userName?: string;
  userInfo?: { id: string; name: string };
  originalMessage?: string;
  triggerType?: 'comment' | 'reaction' | 'other';
  metadata?: Record<string, unknown>;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * GET /api/facebook/pages response
 */
export interface PagesResponse {
  success: boolean;
  pages: FacebookPage[];
  stats: {
    total: number;
    active: number;
    inactive: number;
  };
}

/**
 * GET /api/facebook/message-rules response
 */
export interface MessageRulesResponse {
  success: boolean;
  rules: MessageRule[];
  stats: {
    total: number;
    active: number;
    inactive: number;
  };
}

/**
 * POST /api/facebook/message-rules request body
 */
export interface CreateMessageRuleInput {
  page_id: string;               // Facebook page_id (will be converted to UUID)
  name: string;
  trigger_on: ('comment' | 'reaction')[];
  message_template: string;
  cooldown_minutes?: number;     // Default: 60
  enabled?: boolean;             // Default: true
}

// ============================================
// FRONTEND COMPONENT PROPS
// ============================================

/**
 * For dropdowns that show page list
 * Simplified version of FacebookPage
 */
export interface PageOption {
  id: string;           // UUID for React key
  page_id: string;      // Facebook Page ID for value
  page_name: string;    // Display text
}

// ============================================
// FIELD MAPPING NOTES
// ============================================
/**
 * CRITICAL: page_id confusion!
 * 
 * - facebook_pages.id = UUID (internal)
 * - facebook_pages.page_id = Facebook's numeric ID
 * 
 * - auto_message_rules.page_id = UUID (FK to facebook_pages.id)
 * - BUT webhook receives Facebook's page_id
 * 
 * ALWAYS lookup UUID from Facebook page_id before insert:
 * 
 *   const { data: pageData } = await supabase
 *     .from('facebook_pages')
 *     .select('id')
 *     .eq('page_id', facebookPageId)
 *     .single();
 *   
 *   // Use pageData.id (UUID) for FK
 */
