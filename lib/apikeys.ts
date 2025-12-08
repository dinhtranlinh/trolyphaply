/**
 * API Key Rotation Helper
 * Rotates between multiple Google API keys to avoid rate limits
 */

const API_KEYS = [
  process.env.GOOGLE_API_KEY,
  process.env.GOOGLE_API_KEY_2,
  process.env.GOOGLE_API_KEY_3,
  process.env.GOOGLE_API_KEY_4,
].filter(Boolean); // Remove undefined keys

if (API_KEYS.length === 0) {
  throw new Error('No Google API keys configured. Please set GOOGLE_API_KEY in .env');
}

// Track usage count for each key
const keyUsageCount: Record<string, number> = {};
const keyLastUsed: Record<string, number> = {};
const keyErrors: Record<string, number> = {};

// Initialize counters
API_KEYS.forEach((key) => {
  if (key) {
    keyUsageCount[key] = 0;
    keyLastUsed[key] = 0;
    keyErrors[key] = 0;
  }
});

/**
 * Get the next available API key using round-robin strategy
 * with error tracking and cooldown
 */
export function getNextApiKey(): string {
  const now = Date.now();
  const COOLDOWN_MS = 60 * 1000; // 1 minute cooldown after error
  const MAX_ERRORS = 3; // Mark key as bad after 3 errors
  
  // Filter out keys with too many errors or in cooldown
  const availableKeys = API_KEYS.filter((key) => {
    if (!key) return false;
    
    const errors = keyErrors[key] || 0;
    const lastUsed = keyLastUsed[key] || 0;
    const timeSinceLastUse = now - lastUsed;
    
    // Skip keys with too many errors
    if (errors >= MAX_ERRORS) {
      return false;
    }
    
    // Skip keys in cooldown after error
    if (errors > 0 && timeSinceLastUse < COOLDOWN_MS) {
      return false;
    }
    
    return true;
  });
  
  if (availableKeys.length === 0) {
    // Reset all error counts if no keys available
    console.warn('⚠️  All API keys exhausted, resetting error counts');
    API_KEYS.forEach((key) => {
      if (key) {
        keyErrors[key] = 0;
      }
    });
    // Return the first key as fallback
    return API_KEYS[0]!;
  }
  
  // Find key with lowest usage count
  let selectedKey = availableKeys[0]!;
  let minUsage = keyUsageCount[selectedKey] || 0;
  
  for (const key of availableKeys) {
    if (!key) continue;
    const usage = keyUsageCount[key] || 0;
    if (usage < minUsage) {
      minUsage = usage;
      selectedKey = key;
    }
  }
  
  // Update usage stats
  keyUsageCount[selectedKey] = (keyUsageCount[selectedKey] || 0) + 1;
  keyLastUsed[selectedKey] = now;
  
  return selectedKey;
}

/**
 * Report error for a specific API key
 */
export function reportKeyError(apiKey: string, error?: any): void {
  if (!apiKey || !API_KEYS.includes(apiKey)) return;
  
  keyErrors[apiKey] = (keyErrors[apiKey] || 0) + 1;
  
  console.error(`❌ API Key error (${keyErrors[apiKey]} errors):`, {
    keyPrefix: apiKey.substring(0, 15) + '...',
    error: error?.message || 'Unknown error',
  });
}

/**
 * Report success for a specific API key (resets error count)
 */
export function reportKeySuccess(apiKey: string): void {
  if (!apiKey || !API_KEYS.includes(apiKey)) return;
  
  // Reset error count on success
  if (keyErrors[apiKey] > 0) {
    console.log(`✅ API Key recovered:`, apiKey.substring(0, 15) + '...');
    keyErrors[apiKey] = 0;
  }
}

/**
 * Get usage statistics for all keys
 */
export function getKeyStats() {
  return {
    totalKeys: API_KEYS.length,
    keys: API_KEYS.map((key) => ({
      keyPrefix: key?.substring(0, 15) + '...',
      usageCount: keyUsageCount[key || ''] || 0,
      errors: keyErrors[key || ''] || 0,
      lastUsed: keyLastUsed[key || ''] || 0,
    })),
  };
}

/**
 * Get total number of available API keys
 */
export function getTotalApiKeys(): number {
  return API_KEYS.length;
}

console.log(`🔑 Loaded ${API_KEYS.length} Google API key(s) for rotation`);
