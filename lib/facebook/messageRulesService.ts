/**
 * Message Rules Service
 * 
 * Manages auto-message rules for Facebook Page inbox automation.
 * Handles CRUD operations, trigger conditions, and cooldown checks.
 */

import { createClient } from '@supabase/supabase-js';
import { checkUserCooldown } from './cooldownService';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Types
export interface MessageRule {
  id: string;
  page_id: string;
  name: string;
  trigger_on: string[];
  message_template: string;
  cooldown_minutes: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateMessageRuleInput {
  page_id: string;
  name: string;
  trigger_on: string[];
  message_template: string;
  cooldown_minutes?: number;
  enabled?: boolean;
}

export interface UpdateMessageRuleInput {
  name?: string;
  trigger_on?: string[];
  message_template?: string;
  cooldown_minutes?: number;
  enabled?: boolean;
}

export interface TriggerEvent {
  type: 'comment' | 'reaction';
  user_id: string;
  user_name: string;
  post_id: string;
  comment_id?: string;
}

/**
 * Get all message rules
 */
export async function getAllMessageRules(filters?: {
  page_id?: string;
  enabled?: boolean;
}): Promise<MessageRule[]> {
  let query = supabase
    .from('auto_message_rules')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.page_id) {
    query = query.eq('page_id', filters.page_id);
  }

  if (filters?.enabled !== undefined) {
    query = query.eq('enabled', filters.enabled);
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ Failed to get message rules:', error);
    throw new Error(`Failed to get message rules: ${error.message}`);
  }

  return data || [];
}

/**
 * Get message rule by ID
 */
export async function getMessageRuleById(id: string): Promise<MessageRule | null> {
  const { data, error } = await supabase
    .from('auto_message_rules')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('❌ Failed to get message rule:', error);
    throw new Error(`Failed to get message rule: ${error.message}`);
  }

  return data;
}

/**
 * Get active rules for a specific page
 */
export async function getActiveRulesForPage(page_id: string): Promise<MessageRule[]> {
  const { data, error } = await supabase
    .from('auto_message_rules')
    .select('*')
    .eq('page_id', page_id)
    .eq('enabled', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Failed to get active rules:', error);
    throw new Error(`Failed to get active rules: ${error.message}`);
  }

  return data || [];
}

/**
 * Check if rule should trigger based on event type
 */
export function shouldTriggerRule(rule: MessageRule, event: TriggerEvent): boolean {
  // trigger_on is array: ['comment'] or ['reaction'] or ['comment', 'reaction']
  return rule.trigger_on.includes(event.type);
}

/**
 * Check if rule can be used (not at daily limit)
 * Note: daily_uses_count removed from DB schema, this always returns true now
 */
export async function isRuleWithinDailyLimit(rule: MessageRule): Promise<boolean> {
  // Feature removed - no daily limits in DB schema
  return true;
}

/**
 * Find matching rule for an event (with cooldown check)
 */
export async function findMatchingRule(
  page_id: string,
  event: TriggerEvent
): Promise<{ rule: MessageRule; canSend: boolean; reason?: string } | null> {
  // Get active rules
  const rules = await getActiveRulesForPage(page_id);

  if (rules.length === 0) {
    return null;
  }

  // Find first matching rule
  for (const rule of rules) {
    // Check trigger type
    if (!shouldTriggerRule(rule, event)) {
      console.log(`⊘ Rule "${rule.name}" skipped: trigger type mismatch`);
      continue;
    }

    // Check daily limit
    const withinLimit = await isRuleWithinDailyLimit(rule);
    if (!withinLimit) {
      console.log(`⊘ Rule "${rule.name}" skipped: daily limit reached`);
      continue;
    }

    // Check cooldown
    const cooldownCheck = await checkUserCooldown(
      page_id,
      event.user_id,
      rule.cooldown_minutes
    );

    if (!cooldownCheck.canSend) {
      console.log(
        `⊘ Rule "${rule.name}" skipped: user in cooldown (${cooldownCheck.remainingMinutes} min remaining)`
      );
      return {
        rule,
        canSend: false,
        reason: `User in cooldown period (${cooldownCheck.remainingMinutes} minutes remaining)`,
      };
    }

    // Rule matched and can send
    console.log(`✓ Rule "${rule.name}" matched for ${event.type} event`);
    return { rule, canSend: true };
  }

  return null;
}

/**
 * Create a new message rule
 */
export async function createMessageRule(input: CreateMessageRuleInput): Promise<MessageRule> {
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
    trigger_on: input.trigger_on,
    message_template: input.message_template,
    cooldown_minutes: input.cooldown_minutes ?? 1440, // Default 1 day
    enabled: input.enabled ?? true,
  };

  const { data, error } = await supabase
    .from('auto_message_rules')
    .insert(ruleData)
    .select()
    .single();

  if (error) {
    console.error('❌ Failed to create message rule:', error);
    throw new Error(`Failed to create message rule: ${error.message}`);
  }

  console.log(`✅ Message rule created: ${data.name} (ID: ${data.id})`);
  return data;
}

/**
 * Update an existing message rule
 */
export async function updateMessageRule(
  id: string,
  input: UpdateMessageRuleInput
): Promise<MessageRule> {
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) updateData.name = input.name;
  if (input.trigger_on !== undefined) updateData.trigger_on = input.trigger_on;
  if (input.message_template !== undefined)
    updateData.message_template = input.message_template;
  if (input.cooldown_minutes !== undefined)
    updateData.cooldown_minutes = input.cooldown_minutes;
  if (input.enabled !== undefined) updateData.enabled = input.enabled;

  const { data, error } = await supabase
    .from('auto_message_rules')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('❌ Failed to update message rule:', error);
    throw new Error(`Failed to update message rule: ${error.message}`);
  }

  console.log(`✅ Message rule updated: ${data.name} (ID: ${id})`);
  return data;
}

/**
 * Delete a message rule
 */
export async function deleteMessageRule(id: string): Promise<void> {
  const { error } = await supabase.from('auto_message_rules').delete().eq('id', id);

  if (error) {
    console.error('❌ Failed to delete message rule:', error);
    throw new Error(`Failed to delete message rule: ${error.message}`);
  }

  console.log(`✅ Message rule deleted: ${id}`);
}

/**
 * Increment daily usage counter
 */
export async function incrementRuleUsage(id: string): Promise<void> {
  const { error } = await supabase.rpc('increment_message_rule_usage', {
    rule_id: id,
  });

  if (error) {
    console.error('❌ Failed to increment rule usage:', error);
    // Don't throw - this is not critical
  }
}

/**
 * Get message rules statistics
 */
export async function getMessageRulesStats(page_id?: string) {
  let query = supabase.from('auto_message_rules').select('id, enabled');

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
    .from('auto_message_rules')
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
