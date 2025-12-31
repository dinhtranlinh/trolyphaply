/**
 * Cooldown Service
 * 
 * Manages cooldown periods for auto-messaging to prevent spam.
 * Tracks when messages were last sent to each user.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface CooldownCheck {
  canSend: boolean;
  lastMessageAt?: string;
  cooldownEndsAt?: string;
  remainingMinutes?: number;
}

/**
 * Check if user is within cooldown period
 * Returns true if user can receive a message (cooldown expired or no previous message)
 */
export async function checkUserCooldown(
  page_id: string,
  user_id: string,
  cooldownMinutes: number
): Promise<CooldownCheck> {
  try {
    // Get last message sent to this user from this page
    const { data: lastLog, error } = await supabase
      .from('automation_logs')
      .select('created_at')
      .eq('page_id', page_id)
      .eq('target_id', user_id)
      .eq('action_type', 'message_sent')
      .eq('status', 'success')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // PGRST116 = no rows found, user has never been messaged
      if (error.code === 'PGRST116') {
        return { canSend: true };
      }
      console.error('❌ Failed to check cooldown:', error);
      throw new Error(`Failed to check cooldown: ${error.message}`);
    }

    if (!lastLog) {
      // No previous message
      return { canSend: true };
    }

    const lastMessageAt = new Date(lastLog.created_at);
    const now = new Date();
    const cooldownMs = cooldownMinutes * 60 * 1000;
    const cooldownEndsAt = new Date(lastMessageAt.getTime() + cooldownMs);
    const remainingMs = cooldownEndsAt.getTime() - now.getTime();

    if (remainingMs <= 0) {
      // Cooldown expired
      return {
        canSend: true,
        lastMessageAt: lastLog.created_at,
      };
    }

    // Still in cooldown
    return {
      canSend: false,
      lastMessageAt: lastLog.created_at,
      cooldownEndsAt: cooldownEndsAt.toISOString(),
      remainingMinutes: Math.ceil(remainingMs / 60000),
    };
  } catch (error: any) {
    console.error('❌ Error checking cooldown:', error);
    throw error;
  }
}

/**
 * Record that a message was sent to user
 * This is called after successfully sending a message
 */
export async function recordMessageSent(
  page_id: string,
  user_id: string,
  rule_id: string,
  messageText: string
): Promise<void> {
  try {
    const { error } = await supabase.from('automation_logs').insert({
      page_id,
      rule_id,
      action_type: 'message_sent',
      target_id: user_id,
      content_sent: messageText,
      status: 'success',
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('❌ Failed to record message sent:', error);
      throw new Error(`Failed to record message sent: ${error.message}`);
    }

    console.log(`✅ Recorded message sent to user ${user_id}`);
  } catch (error: any) {
    console.error('❌ Error recording message:', error);
    throw error;
  }
}

/**
 * Get last message sent to user from page
 */
export async function getLastMessageToUser(
  page_id: string,
  user_id: string
): Promise<{ created_at: string; messageText: string } | null> {
  try {
    const { data, error } = await supabase
      .from('automation_logs')
      .select('created_at, content_sent')
      .eq('page_id', page_id)
      .eq('target_id', user_id)
      .eq('action_type', 'message_sent')
      .eq('status', 'success')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No message found
      }
      console.error('❌ Failed to get last message:', error);
      throw new Error(`Failed to get last message: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return {
      created_at: data.created_at,
      messageText: data.content_sent || '',
    };
  } catch (error: any) {
    console.error('❌ Error getting last message:', error);
    throw error;
  }
}

/**
 * Get all users currently in cooldown period for a page
 */
export async function getUsersInCooldown(
  page_id: string,
  cooldownMinutes: number
): Promise<string[]> {
  try {
    const since = new Date();
    since.setMinutes(since.getMinutes() - cooldownMinutes);

    const { data, error } = await supabase
      .from('automation_logs')
      .select('target_id')
      .eq('page_id', page_id)
      .eq('action_type', 'message_sent')
      .eq('status', 'success')
      .gte('created_at', since.toISOString());

    if (error) {
      console.error('❌ Failed to get users in cooldown:', error);
      throw new Error(`Failed to get users in cooldown: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Get unique user IDs
    const userIds = [...new Set(data.map((log) => log.target_id))];
    return userIds;
  } catch (error: any) {
    console.error('❌ Error getting users in cooldown:', error);
    throw error;
  }
}

/**
 * Get cooldown stats for a page
 */
export async function getCooldownStats(page_id: string, cooldownMinutes: number) {
  try {
    const usersInCooldown = await getUsersInCooldown(page_id, cooldownMinutes);

    // Get total unique users messaged (all time)
    const { data: allUsers, error } = await supabase
      .from('automation_logs')
      .select('target_id')
      .eq('page_id', page_id)
      .eq('action_type', 'message_sent')
      .eq('status', 'success');

    if (error) {
      throw new Error(`Failed to get cooldown stats: ${error.message}`);
    }

    const totalUsers = allUsers ? new Set(allUsers.map((log) => log.target_id)).size : 0;

    return {
      usersInCooldown: usersInCooldown.length,
      totalUsersMessaged: totalUsers,
      cooldownMinutes,
    };
  } catch (error: any) {
    console.error('❌ Error getting cooldown stats:', error);
    throw error;
  }
}

/**
 * Clear cooldown for a specific user (for testing/admin override)
 */
export async function clearUserCooldown(page_id: string, user_id: string): Promise<void> {
  try {
    // Delete all message logs for this user from this page
    const { error } = await supabase
      .from('automation_logs')
      .delete()
      .eq('page_id', page_id)
      .eq('target_id', user_id)
      .eq('action_type', 'message_sent');

    if (error) {
      console.error('❌ Failed to clear cooldown:', error);
      throw new Error(`Failed to clear cooldown: ${error.message}`);
    }

    console.log(`✅ Cleared cooldown for user ${user_id}`);
  } catch (error: any) {
    console.error('❌ Error clearing cooldown:', error);
    throw error;
  }
}
