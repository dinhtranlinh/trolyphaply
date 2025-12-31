/**
 * Automation Engine
 * Core logic for processing reply and message jobs
 */

import { createClient } from '@supabase/supabase-js';
import { QueueJob } from './queueService';
import { isAutomationAllowed } from './safeMode';
import { checkRateLimit, recordAction } from './rateLimit';
import { spinContent, getStandardPlaceholders, selectTemplate } from './spinContent';
import { replyToComment, sendPageMessage, getComment } from './graphApi';
import { decryptToken } from './tokenManager';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface ProcessResult {
  success: boolean;
  action?: string;
  reason?: string;
  error?: string;
}

/**
 * Process a reply comment job
 */
export async function processReplyJob(job: QueueJob): Promise<ProcessResult> {
  console.log(`[AutoEngine] 💬 Processing reply job: ${job.target_id}`);
  
  try {
    // 1. Check safe mode
    if (!(await isAutomationAllowed())) {
      return { success: false, reason: 'safe_mode_enabled' };
    }
    
    // 2. Get page info
    const { data: page, error: pageError } = await supabase
      .from('facebook_pages')
      .select('*')
      .eq('page_id', job.page_id)
      .single();
    
    if (pageError || !page) {
      return { success: false, error: 'Page not found' };
    }
    
    // 3. Check page automation enabled
    if (!page.automation_enabled) {
      return { success: false, reason: 'page_disabled' };
    }
    
    // 3.5. Decrypt page access token
    const pageAccessToken = decryptToken(page.page_access_token);
    
    // 4. Get comment details from Graph API
    const commentId = job.payload.comment_id;
    let commentData;
    try {
      commentData = await getComment(commentId, pageAccessToken);
    } catch (error: any) {
      return { success: false, error: `Graph API error: ${error.message}` };
    }
    
    // 4.5. Use userInfo from webhook if Graph API doesn't return 'from' (Reels limitation)
    if (!commentData.from || !commentData.from.id) {
      // Fallback to webhook payload userInfo (for Reels/Videos)
      if (job.payload.userInfo && job.payload.userInfo.id) {
        commentData.from = job.payload.userInfo;
        console.log('[AutoEngine] Using userInfo from webhook (Reels fallback):', commentData.from);
      } else {
        return { success: false, reason: 'comment_no_author' };
      }
    }
    
    // 4.6. Use message from webhook if Graph API doesn't return it
    if (!commentData.message && job.payload.originalMessage) {
      commentData.message = job.payload.originalMessage;
    }
    
    // 5. Check if self-comment (page commenting on itself)
    if (commentData.from.id === page.page_id) {
      return { success: false, reason: 'self_comment' };
    }
    
    // 6. Load applicable rules (priority order)
    const postId = job.payload.post_id;
    const { data: rules, error: rulesError } = await supabase
      .from('auto_reply_rules')
      .select('*')
      .eq('page_id', page.id)
      .eq('enabled', true)
      .or(`post_id.is.null,post_id.eq.${postId}`)
      .order('priority', { ascending: false });
    
    if (rulesError || !rules || rules.length === 0) {
      return { success: false, reason: 'no_rules' };
    }
    
    // 7. Match rule conditions
    let matchedRule = null;
    for (const rule of rules) {
      // Check trigger type
      if (rule.trigger_type === 'all') {
        matchedRule = rule;
        break;
      }
      
      if (rule.trigger_type === 'keyword') {
        const message = commentData.message.toLowerCase();
        
        // Check exclude keywords first
        const hasExclude = rule.exclude_keywords.some((keyword: string) =>
          message.includes(keyword.toLowerCase())
        );
        if (hasExclude) {
          continue;
        }
        
        // Check include keywords
        const hasKeyword = rule.keywords.some((keyword: string) =>
          message.includes(keyword.toLowerCase())
        );
        if (hasKeyword) {
          matchedRule = rule;
          break;
        }
      }
    }
    
    if (!matchedRule) {
      return { success: false, reason: 'no_match' };
    }
    
    // 8. Check rate limits
    const rateLimitCheck = await checkRateLimit({
      type: 'reply',
      page_id: page.page_id,
      user_id: commentData.from.id,
    });
    
    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        reason: 'rate_limited',
        error: rateLimitCheck.reason,
      };
    }
    
    // 9. Generate content
    const placeholders = getStandardPlaceholders(commentData.from);
    
    // Get recent messages to avoid duplicates
    const { data: recentLogs } = await supabase
      .from('automation_logs')
      .select('content_sent')
      .eq('page_id', page.page_id)
      .eq('action_type', 'reply_sent')
      .eq('status', 'success')
      .order('created_at', { ascending: false })
      .limit(10);
    
    const recentMessages = recentLogs?.map(log => log.content_sent).filter(Boolean) || [];
    
    const content = selectTemplate(
      matchedRule.reply_templates,
      recentMessages,
      placeholders
    );
    
    // 10. Send reply via Graph API
    try {
      await replyToComment(commentId, content, pageAccessToken);
    } catch (error: any) {
      return { success: false, error: `Failed to send reply: ${error.message}` };
    }
    
    // 11. Log success
    await recordAction({
      action_type: 'reply_sent',
      page_id: page.page_id,
      target_id: commentId,
      rule_id: matchedRule.id,
      content_sent: content,
      status: 'success',
      metadata: {
        post_id: postId,
        user_id: commentData.from.id,
        user_name: commentData.from.name,
      },
    });
    
    // 12. Update page stats
    await incrementPageStats(page.id, 'replies_sent');
    
    console.log(`[AutoEngine] ✅ Reply sent to ${commentData.from.name}`);
    
    return { success: true, action: 'reply_sent' };
  } catch (error: any) {
    console.error('[AutoEngine] Error processing reply:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Process a message job
 */
export async function processMessageJob(job: QueueJob): Promise<ProcessResult> {
  console.log(`[AutoEngine] 📨 Processing message job: ${job.target_id}`);
  
  try {
    // 1. Check safe mode
    if (!(await isAutomationAllowed())) {
      return { success: false, reason: 'safe_mode_enabled' };
    }
    
    // 2. Get page info
    const { data: page, error: pageError } = await supabase
      .from('facebook_pages')
      .select('*')
      .eq('page_id', job.page_id)
      .single();
    
    if (pageError || !page) {
      return { success: false, error: 'Page not found' };
    }
    
    // 3. Check page automation enabled
    if (!page.automation_enabled) {
      return { success: false, reason: 'page_disabled' };
    }
    
    // 4. Load message rules
    const { data: rules, error: rulesError } = await supabase
      .from('auto_message_rules')
      .select('*')
      .eq('page_id', page.id)
      .eq('enabled', true);
    
    if (rulesError || !rules || rules.length === 0) {
      console.log('[AutoEngine] No message rules found for page');
      return { success: false, reason: 'no_rules' };
    }
    
    // 5. Find matching rule based on trigger type
    const triggerType = job.payload.triggerType || 'comment';
    const matchingRule = rules.find(r => 
      r.trigger_on && r.trigger_on.includes(triggerType)
    );
    
    if (!matchingRule) {
      console.log(`[AutoEngine] No rule matches trigger type: ${triggerType}`);
      return { success: false, reason: 'no_matching_rule' };
    }
    
    const rule = matchingRule;
    
    // 6. Check rate limits
    const rateLimitCheck = await checkRateLimit({
      type: 'message',
      page_id: page.page_id,
    });
    
    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        reason: 'rate_limited',
        error: rateLimitCheck.reason,
      };
    }
    
    // 7. Check cooldown for this user
    const userId = job.payload.user_id;
    const { data: lastMessage } = await supabase
      .from('automation_logs')
      .select('created_at')
      .eq('page_id', page.page_id)
      .eq('target_id', userId)
      .eq('action_type', 'message_sent')
      .eq('status', 'success')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (lastMessage) {
      const lastMessageTime = new Date(lastMessage.created_at).getTime();
      const cooldownMs = rule.cooldown_minutes * 60 * 1000;
      const timeSince = Date.now() - lastMessageTime;
      
      if (timeSince < cooldownMs) {
        return { success: false, reason: 'cooldown_active' };
      }
    }
    
    // 8. Generate content
    const userName = job.payload.userName || job.payload.userInfo?.name;
    const placeholders = userName ? 
      getStandardPlaceholders({ name: userName, id: userId }) : 
      {};
    
    const content = spinContent({
      message_template: rule.message_template,
      placeholders,
    }).spun;
    
    // 9. Send message via Graph API
    const pageAccessToken = decryptToken(page.page_access_token);
    try {
      await sendPageMessage(page.page_id, userId, content, pageAccessToken);
    } catch (error: any) {
      return { success: false, error: `Failed to send message: ${error.message}` };
    }
    
    // 10. Log success
    await recordAction({
      action_type: 'message_sent',
      page_id: page.page_id,
      target_id: userId,
      rule_id: rule.id,
      content_sent: content,
      status: 'success',
      metadata: job.payload,
    });
    
    // 11. Update page stats
    await incrementPageStats(page.id, 'messages_sent');
    
    console.log(`[AutoEngine] ✅ Message sent to user ${userId}`);
    
    return { success: true, action: 'message_sent' };
  } catch (error: any) {
    console.error('[AutoEngine] Error processing message:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Increment page stats counter
 */
async function incrementPageStats(
  page_id: string,
  counter: 'replies_sent' | 'messages_sent' | 'failed_jobs'
): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Upsert stats
    const { data: existing } = await supabase
      .from('page_stats')
      .select('*')
      .eq('page_id', page_id)
      .eq('date', today)
      .single();
    
    if (existing) {
      // Update existing
      await supabase
        .from('page_stats')
        .update({
          [counter]: existing[counter] + 1,
        })
        .eq('page_id', page_id)
        .eq('date', today);
    } else {
      // Insert new
      await supabase
        .from('page_stats')
        .insert({
          page_id: page_id,
          date: today,
          [counter]: 1,
        });
    }
  } catch (error) {
    console.error('[AutoEngine] Error updating stats:', error);
  }
}
