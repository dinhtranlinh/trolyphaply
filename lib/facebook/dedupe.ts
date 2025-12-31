/**
 * Event Deduplication Service
 * Prevent processing duplicate webhook events
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Generate dedupe key from webhook event
 */
export function generateDedupeKey(event: {
  page_id: string;
  post_id?: string;
  comment_id?: string;
  user_id?: string;
  eventType: string;
  timestamp: number;
}): string {
  const parts = [
    event.page_id,
    event.eventType,
    event.post_id || '',
    event.comment_id || '',
    event.user_id || '',
    Math.floor(event.timestamp / 1000), // Round to second
  ];
  
  return parts.filter(Boolean).join('_');
}

/**
 * Check if event already processed
 */
export async function isDuplicate(dedupeKey: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('facebook_events')
      .select('id')
      .eq('dedupe_key', dedupeKey)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 = not found (which is good, means not duplicate)
      console.error('[Dedupe] Error checking:', error);
      return false; // Fail open - process the event
    }
    
    return !!data; // true if found = duplicate
  } catch (error) {
    console.error('[Dedupe] Exception:', error);
    return false; // Fail open
  }
}

/**
 * Record event in database (for dedupe)
 */
export async function recordEvent(event: {
  eventType: string;
  page_id: string;
  post_id?: string;
  comment_id?: string;
  user_id?: string;
  dedupeKey: string;
  payload: any;
}): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('facebook_events')
      .insert({
        event_type: event.eventType,
        page_id: event.page_id,
        post_id: event.post_id,
        comment_id: event.comment_id,
        user_id: event.user_id,
        dedupe_key: event.dedupeKey,
        payload: event.payload,
        status: 'received',
      })
      .select('id')
      .single();
    
    if (error) {
      // Check if duplicate key violation
      if (error.code === '23505') {
        console.log('[Dedupe] Event already exists:', event.dedupeKey);
        return null;
      }
      throw error;
    }
    
    return data.id;
  } catch (error) {
    console.error('[Dedupe] Error recording event:', error);
    return null;
  }
}

/**
 * Mark event as processed
 */
export async function markProcessed(eventId: string): Promise<void> {
  try {
    await supabase
      .from('facebook_events')
      .update({
        status: 'processed',
        processed_at: new Date().toISOString(),
      })
      .eq('id', eventId);
  } catch (error) {
    console.error('[Dedupe] Error marking processed:', error);
  }
}

/**
 * Mark event as failed
 */
export async function markFailed(eventId: string): Promise<void> {
  try {
    await supabase
      .from('facebook_events')
      .update({
        status: 'failed',
        processed_at: new Date().toISOString(),
      })
      .eq('id', eventId);
  } catch (error) {
    console.error('[Dedupe] Error marking failed:', error);
  }
}

/**
 * Clean up old events (older than 7 days)
 */
export async function cleanupOldEvents(): Promise<number> {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data, error } = await supabase
      .from('facebook_events')
      .delete()
      .lt('created_at', sevenDaysAgo.toISOString())
      .select('id');
    
    if (error) {
      throw error;
    }
    
    const count = data?.length || 0;
    console.log(`[Dedupe] Cleaned up ${count} old events`);
    return count;
  } catch (error) {
    console.error('[Dedupe] Error cleaning up:', error);
    return 0;
  }
}

/**
 * Get recent events for a page (for debugging)
 */
export async function getRecentEvents(
  page_id: string,
  limit: number = 20
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('facebook_events')
      .select('*')
      .eq('page_id', page_id)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('[Dedupe] Error getting events:', error);
    return [];
  }
}
