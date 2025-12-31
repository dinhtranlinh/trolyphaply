/**
 * Safe Mode Service
 * Global kill-switch to stop all automation instantly
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// In-memory cache (5 min TTL)
let cachedSafeMode: {
  enabled: boolean;
  reason: string | null;
  timestamp: number;
} | null = null;

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export interface SafeModeStatus {
  enabled: boolean;
  reason: string | null;
}

/**
 * Get safe mode status (with caching)
 */
export async function getSafeModeStatus(): Promise<SafeModeStatus> {
  const now = Date.now();
  
  // Return cached if fresh
  if (cachedSafeMode && now - cachedSafeMode.timestamp < CACHE_TTL_MS) {
    return {
      enabled: cachedSafeMode.enabled,
      reason: cachedSafeMode.reason,
    };
  }
  
  // Fetch from DB
  try {
    const { data, error } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'facebook_safe_mode')
      .single();
    
    if (error || !data) {
      console.error('[SafeMode] Error fetching:', error);
      // Default to safe (enabled = true blocks automation)
      return { enabled: false, reason: null };
    }
    
    const config = data.value as SafeModeStatus;
    
    // Update cache
    cachedSafeMode = {
      enabled: config.enabled,
      reason: config.reason,
      timestamp: now,
    };
    
    return config;
  } catch (error) {
    console.error('[SafeMode] Exception:', error);
    return { enabled: false, reason: null };
  }
}

/**
 * Enable safe mode (emergency stop)
 */
export async function enableSafeMode(reason: string): Promise<void> {
  try {
    await supabase
      .from('system_config')
      .update({
        value: {
          enabled: true,
          reason,
        },
      })
      .eq('key', 'facebook_safe_mode');
    
    // Clear cache to force refresh
    cachedSafeMode = null;
    
    console.log(`[SafeMode] ⛔ ENABLED: ${reason}`);
  } catch (error) {
    console.error('[SafeMode] Error enabling:', error);
    throw error;
  }
}

/**
 * Disable safe mode (resume automation)
 */
export async function disableSafeMode(): Promise<void> {
  try {
    await supabase
      .from('system_config')
      .update({
        value: {
          enabled: false,
          reason: null,
        },
      })
      .eq('key', 'facebook_safe_mode');
    
    // Clear cache
    cachedSafeMode = null;
    
    console.log('[SafeMode] ✅ DISABLED - Automation resumed');
  } catch (error) {
    console.error('[SafeMode] Error disabling:', error);
    throw error;
  }
}

/**
 * Check if automation is allowed (quick check)
 */
export async function isAutomationAllowed(): Promise<boolean> {
  const status = await getSafeModeStatus();
  return !status.enabled;
}

/**
 * Clear cache (for testing)
 */
export function clearSafeModeCache(): void {
  cachedSafeMode = null;
}
