/**
 * Reply Rules Service
 * 
 * Manages auto-reply rules for Facebook Page comments.
 * Handles CRUD operations, rule matching, and validation.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Types
export interface ReplyRule {
  id: string;
  page_id: string;
  post_id?: string;
  name: string;
  trigger_type: 'all' | 'keyword';
  keywords?: string[];
  exclude_keywords?: string[];
  reply_templates: string[];
  priority: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateReplyRuleInput {
  page_id: string;
  post_id?: string;
  name: string;
  trigger_type: 'all' | 'keyword';
  keywords?: string[];
  exclude_keywords?: string[];
  reply_templates: string[];
  priority?: number;
  enabled?: boolean;
}

export interface UpdateReplyRuleInput {
  name?: string;
  post_id?: string;
  trigger_type?: 'all' | 'keyword';
  keywords?: string[];
  exclude_keywords?: string[];
  reply_templates?: string[];
  priority?: number;
  enabled?: boolean;
}

/**
 * Get all reply rules
 */
export async function getAllReplyRules(filters?: {
  page_id?: string;
  enabled?: boolean;
}): Promise<ReplyRule[]> {
  let query = supabase
    .from('auto_reply_rules')
    .select('*')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false });

  if (filters?.page_id) {
    query = query.eq('page_id', filters.page_id);
  }

  if (filters?.enabled !== undefined) {
    query = query.eq('enabled', filters.enabled);
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ Failed to get reply rules:', error);
    throw new Error(`Failed to get reply rules: ${error.message}`);
  }

  return data || [];
}

/**
 * Get reply rule by ID
 */
export async function getReplyRuleById(id: string): Promise<ReplyRule | null> {
  const { data, error } = await supabase
    .from('auto_reply_rules')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('❌ Failed to get reply rule:', error);
    throw new Error(`Failed to get reply rule: ${error.message}`);
  }

  return data;
}

/**
 * Get active rules for a specific page
 * Returns rules in priority order (high to low)
 */
export async function getActiveRulesForPage(page_id: string): Promise<ReplyRule[]> {
  const { data, error } = await supabase
    .from('auto_reply_rules')
    .select('*')
    .eq('page_id', page_id)
    .eq('enabled', true)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Failed to get active rules:', error);
    throw new Error(`Failed to get active rules: ${error.message}`);
  }

  return data || [];
}

/**
 * Create a new reply rule
 */
export async function createReplyRule(input: CreateReplyRuleInput): Promise<ReplyRule> {
  // Lookup internal page UUID from Facebook page_id
  const { data: pageData, error: pageError } = await supabase
    .from('facebook_pages')
    .select('id')
    .eq('page_id', input.page_id)
    .single();

  if (pageError || !pageData) {
    console.error('❌ Failed to find page:', input.page_id, pageError);
    throw new Error(`Page not found: ${input.page_id}`);
  }

  const ruleData = {
    page_id: pageData.id, // Use internal UUID, not Facebook page_id
    name: input.name,
    post_id: input.post_id,
    trigger_type: input.trigger_type,
    keywords: input.keywords || [],
    exclude_keywords: input.exclude_keywords || [],
    reply_templates: input.reply_templates,
    priority: input.priority ?? 0,
    enabled: input.enabled ?? true,
  };

  const { data, error } = await supabase
    .from('auto_reply_rules')
    .insert(ruleData)
    .select()
    .single();

  if (error) {
    console.error('❌ Failed to create reply rule:', error);
    throw new Error(`Failed to create reply rule: ${error.message}`);
  }

  console.log(`✅ Reply rule created: ${data.name} (ID: ${data.id})`);
  return data;
}

/**
 * Update an existing reply rule
 */
export async function updateReplyRule(
  id: string,
  input: UpdateReplyRuleInput
): Promise<ReplyRule> {
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) updateData.name = input.name;
  if (input.post_id !== undefined) updateData.post_id = input.post_id;
  if (input.trigger_type !== undefined) updateData.trigger_type = input.trigger_type;
  if (input.keywords !== undefined) updateData.keywords = input.keywords;
  if (input.exclude_keywords !== undefined) updateData.exclude_keywords = input.exclude_keywords;
  if (input.reply_templates !== undefined) updateData.reply_templates = input.reply_templates;
  if (input.priority !== undefined) updateData.priority = input.priority;
  if (input.enabled !== undefined) updateData.enabled = input.enabled;

  const { data, error } = await supabase
    .from('auto_reply_rules')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('❌ Failed to update reply rule:', error);
    throw new Error(`Failed to update reply rule: ${error.message}`);
  }

  console.log(`✅ Reply rule updated: ${data.name} (ID: ${id})`);
  return data;
}

/**
 * Delete a reply rule
 */
export async function deleteReplyRule(id: string): Promise<void> {
  const { error } = await supabase
    .from('auto_reply_rules')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('❌ Failed to delete reply rule:', error);
    throw new Error(`Failed to delete reply rule: ${error.message}`);
  }

  console.log(`✅ Reply rule deleted: ${id}`);
}

/**
 * Increment daily usage counter
 */
export async function incrementRuleUsage(id: string): Promise<void> {
  const { error } = await supabase.rpc('increment_rule_usage', {
    rule_id: id,
  });

  if (error) {
    console.error('❌ Failed to increment rule usage:', error);
    // Don't throw - this is not critical
  }
}

/**
 * Check if rule has reached daily limit
 * Note: daily_uses_count/max_daily_uses removed from DB schema, this always returns true now
 */
export async function isRuleWithinDailyLimit(rule: ReplyRule): Promise<boolean> {
  // Feature removed - no daily limits in DB schema
  return true;
}

/**
 * Get rules statistics
 */
export async function getReplyRulesStats(page_id?: string) {
  let query = supabase.from('auto_reply_rules').select('id, enabled');

  if (page_id) {
    query = query.eq('page_id', page_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ Failed to get rules stats:', error);
    throw new Error(`Failed to get rules stats: ${error.message}`);
  }

  const stats = {
    total: data.length,
    active: data.filter((r) => r.enabled).length,
    inactive: data.filter((r) => !r.enabled).length,
  };

  return stats;
}

/**
 * Bulk update rules (enable/disable multiple rules)
 */
export async function bulkUpdateRules(
  ruleIds: string[],
  enabled: boolean
): Promise<number> {
  const { data, error } = await supabase
    .from('auto_reply_rules')
    .update({
      enabled: enabled,
      updated_at: new Date().toISOString(),
    })
    .in('id', ruleIds)
    .select('id');

  if (error) {
    console.error('❌ Failed to bulk update rules:', error);
    throw new Error(`Failed to bulk update rules: ${error.message}`);
  }

  const count = data?.length || 0;
  console.log(`✅ Bulk updated ${count} rules (active: ${enabled})`);
  return count;
}

/**
 * Get recently sent messages for a rule (for deduplication)
 */
export async function getRecentSentMessages(
  rule_id: string,
  hours: number = 24
): Promise<string[]> {
  const since = new Date();
  since.setHours(since.getHours() - hours);

  const { data, error } = await supabase
    .from('automation_logs')
    .select('content_sent')
    .eq('rule_id', rule_id)
    .eq('action_type', 'reply_sent')
    .eq('status', 'success')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Failed to get recent sent messages:', error);
    return [];
  }

  return data.map((log) => log.content_sent).filter(Boolean);
}
