/**
 * Rate Limiter Service
 * Prevent spam and comply with Facebook rate limits
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// In-memory cache for rate limiting (Redis would be better for production)
const rateCache = new Map<string, number[]>();

export interface RateLimitConfig {
  replies_per_page_per_minute: number;
  replies_per_user_per_minutes: number;
  messages_per_page_per_hour: number;
}

export interface RateLimitCheck {
  allowed: boolean;
  reason?: string;
  retryAfter?: number; // seconds
}

/**
 * Get rate limit config from database
 */
async function getRateLimitConfig(): Promise<RateLimitConfig> {
  try {
    const { data, error } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'facebook_rate_limits')
      .single();
    
    if (error || !data) {
      // Return defaults
      return {
        replies_per_page_per_minute: 10,
        replies_per_user_per_minutes: 5,
        messages_per_page_per_hour: 50,
      };
    }
    
    return data.value as RateLimitConfig;
  } catch (error) {
    console.error('[RateLimit] Error getting config:', error);
    return {
      replies_per_page_per_minute: 10,
      replies_per_user_per_minutes: 5,
      messages_per_page_per_hour: 50,
    };
  }
}

/**
 * Check rate limit for page replies
 */
export async function checkPageReplyLimit(
  page_id: string
): Promise<RateLimitCheck> {
  const config = await getRateLimitConfig();
  const key = `page_reply_${page_id}`;
  const now = Date.now();
  const oneMinuteAgo = now - 60 * 1000;
  
  // Get recent timestamps
  const timestamps = rateCache.get(key) || [];
  
  // Filter to last minute
  const recentTimestamps = timestamps.filter(ts => ts > oneMinuteAgo);
  
  if (recentTimestamps.length >= config.replies_per_page_per_minute) {
    const oldestTimestamp = Math.min(...recentTimestamps);
    const retryAfter = Math.ceil((oldestTimestamp + 60 * 1000 - now) / 1000);
    
    return {
      allowed: false,
      reason: `Page rate limit: ${config.replies_per_page_per_minute} replies/minute`,
      retryAfter,
    };
  }
  
  // Update cache
  recentTimestamps.push(now);
  rateCache.set(key, recentTimestamps);
  
  return { allowed: true };
}

/**
 * Check rate limit for user replies (anti-spam)
 */
export async function checkUserReplyLimit(
  page_id: string,
  user_id: string
): Promise<RateLimitCheck> {
  const config = await getRateLimitConfig();
  const cooldownMinutes = config.replies_per_user_per_minutes;
  
  try {
    // Check last reply to this user
    const { data, error } = await supabase
      .from('automation_logs')
      .select('created_at')
      .eq('page_id', page_id)
      .eq('target_id', user_id)
      .eq('action_type', 'reply_sent')
      .eq('status', 'success')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('[RateLimit] Error checking user limit:', error);
      return { allowed: true }; // Fail open
    }
    
    if (data) {
      const lastReplyTime = new Date(data.created_at).getTime();
      const now = Date.now();
      const cooldownMs = cooldownMinutes * 60 * 1000;
      const timeSinceLastReply = now - lastReplyTime;
      
      if (timeSinceLastReply < cooldownMs) {
        const retryAfter = Math.ceil((cooldownMs - timeSinceLastReply) / 1000);
        
        return {
          allowed: false,
          reason: `User cooldown: ${cooldownMinutes} minutes between replies`,
          retryAfter,
        };
      }
    }
    
    return { allowed: true };
  } catch (error) {
    console.error('[RateLimit] Exception checking user limit:', error);
    return { allowed: true }; // Fail open
  }
}

/**
 * Check rate limit for page messages
 */
export async function checkPageMessageLimit(
  page_id: string
): Promise<RateLimitCheck> {
  const config = await getRateLimitConfig();
  const key = `page_message_${page_id}`;
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  
  // Get recent timestamps
  const timestamps = rateCache.get(key) || [];
  
  // Filter to last hour
  const recentTimestamps = timestamps.filter(ts => ts > oneHourAgo);
  
  if (recentTimestamps.length >= config.messages_per_page_per_hour) {
    const oldestTimestamp = Math.min(...recentTimestamps);
    const retryAfter = Math.ceil((oldestTimestamp + 60 * 60 * 1000 - now) / 1000);
    
    return {
      allowed: false,
      reason: `Page message limit: ${config.messages_per_page_per_hour} messages/hour`,
      retryAfter,
    };
  }
  
  // Update cache
  recentTimestamps.push(now);
  rateCache.set(key, recentTimestamps);
  
  return { allowed: true };
}

/**
 * Combined rate limit check
 */
export async function checkRateLimit(params: {
  type: 'reply' | 'message';
  page_id: string;
  user_id?: string;
}): Promise<RateLimitCheck> {
  const { type, page_id, user_id } = params;
  
  if (type === 'reply') {
    // Check page limit
    const pageCheck = await checkPageReplyLimit(page_id);
    if (!pageCheck.allowed) {
      return pageCheck;
    }
    
    // Check user limit if user_id provided
    if (user_id) {
      const userCheck = await checkUserReplyLimit(page_id, user_id);
      if (!userCheck.allowed) {
        return userCheck;
      }
    }
  } else if (type === 'message') {
    // Check message limit
    const messageCheck = await checkPageMessageLimit(page_id);
    if (!messageCheck.allowed) {
      return messageCheck;
    }
  }
  
  return { allowed: true };
}

/**
 * Record action (for database-based rate limiting)
 */
export async function recordAction(params: {
  action_type: 'reply_sent' | 'message_sent';
  page_id: string;
  target_id: string;
  rule_id?: string;
  content_sent: string;
  status: 'success' | 'failed';
  metadata?: any;
}): Promise<void> {
  try {
    await supabase
      .from('automation_logs')
      .insert({
        action_type: params.action_type,
        page_id: params.page_id,
        target_id: params.target_id,
        rule_id: params.rule_id,
        content_sent: params.content_sent,
        status: params.status,
        metadata: params.metadata,
      });
  } catch (error) {
    console.error('[RateLimit] Error recording action:', error);
  }
}

/**
 * Clear rate limit cache (for testing or manual reset)
 */
export function clearRateCache(key?: string): void {
  if (key) {
    rateCache.delete(key);
  } else {
    rateCache.clear();
  }
}

/**
 * Get current rate limit status (for debugging)
 */
export function getRateLimitStatus(page_id: string): {
  replyCount: number;
  messageCount: number;
  replyTimestamps: number[];
  messageTimestamps: number[];
} {
  const now = Date.now();
  const oneMinuteAgo = now - 60 * 1000;
  const oneHourAgo = now - 60 * 60 * 1000;
  
  const replyKey = `page_reply_${page_id}`;
  const messageKey = `page_message_${page_id}`;
  
  const replyTimestamps = (rateCache.get(replyKey) || []).filter(ts => ts > oneMinuteAgo);
  const messageTimestamps = (rateCache.get(messageKey) || []).filter(ts => ts > oneHourAgo);
  
  return {
    replyCount: replyTimestamps.length,
    messageCount: messageTimestamps.length,
    replyTimestamps,
    messageTimestamps,
  };
}
