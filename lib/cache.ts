// SESSION 5 OPTIMIZATION: In-memory cache layer
// Reduces API calls by caching answers and shareText for 24h

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Cache TTL: 24 hours
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// In-memory caches
const answerCache = new Map<string, CacheEntry<string>>();
const shareTextCache = new Map<string, CacheEntry<string>>();

/**
 * Hash question for cache key (normalize: lowercase, trim, remove extra spaces)
 */
export function hashQuestion(question: string): string {
  return question
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
    .replace(/[^\w\sàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/gi, ''); // Remove special chars except Vietnamese
}

/**
 * Check if cache entry is still valid (not expired)
 */
function isValid(entry: CacheEntry<any> | undefined): boolean {
  if (!entry) return false;
  const age = Date.now() - entry.timestamp;
  return age < CACHE_TTL_MS;
}

// ============= ANSWER CACHE =============

/**
 * Get cached answer for question (null if not found or expired)
 */
export function getAnswerFromCache(question: string): string | null {
  const key = hashQuestion(question);
  const entry = answerCache.get(key);
  
  if (!isValid(entry)) {
    if (entry) {
      answerCache.delete(key); // Cleanup expired entry
    }
    return null;
  }
  
  return entry!.data;
}

/**
 * Save answer to cache
 */
export function saveAnswerToCache(question: string, answer: string): void {
  const key = hashQuestion(question);
  answerCache.set(key, {
    data: answer,
    timestamp: Date.now(),
  });
}

/**
 * Get cache stats for monitoring
 */
export function getAnswerCacheStats() {
  return {
    size: answerCache.size,
    keys: Array.from(answerCache.keys()).slice(0, 5), // First 5 keys for debugging
  };
}

// ============= SHARETEXT CACHE =============

/**
 * Get cached shareText for question+answer combo (null if not found or expired)
 */
export function getShareTextFromCache(question: string, answer: string): string | null {
  // Use combined hash for cache key
  const key = hashQuestion(question + '|||' + answer.substring(0, 100));
  const entry = shareTextCache.get(key);
  
  if (!isValid(entry)) {
    if (entry) {
      shareTextCache.delete(key); // Cleanup expired entry
    }
    return null;
  }
  
  return entry!.data;
}

/**
 * Save shareText to cache
 */
export function saveShareTextToCache(question: string, answer: string, shareText: string): void {
  const key = hashQuestion(question + '|||' + answer.substring(0, 100));
  shareTextCache.set(key, {
    data: shareText,
    timestamp: Date.now(),
  });
}

/**
 * Get cache stats for monitoring
 */
export function getShareTextCacheStats() {
  return {
    size: shareTextCache.size,
    keys: Array.from(shareTextCache.keys()).slice(0, 5),
  };
}

// ============= CLEANUP =============

/**
 * Periodic cleanup of expired entries (optional, garbage collection)
 * Call this periodically (e.g., every hour) to free memory
 */
export function cleanupExpiredCache(): void {
  const now = Date.now();
  let cleanedAnswer = 0;
  let cleanedShareText = 0;
  
  // Cleanup answer cache
  for (const [key, entry] of answerCache.entries()) {
    if (now - entry.timestamp >= CACHE_TTL_MS) {
      answerCache.delete(key);
      cleanedAnswer++;
    }
  }
  
  // Cleanup shareText cache
  for (const [key, entry] of shareTextCache.entries()) {
    if (now - entry.timestamp >= CACHE_TTL_MS) {
      shareTextCache.delete(key);
      cleanedShareText++;
    }
  }
  
  if (cleanedAnswer > 0 || cleanedShareText > 0) {
    console.log(`[Cache] Cleaned up ${cleanedAnswer} answer + ${cleanedShareText} shareText expired entries`);
  }
}

// Auto cleanup every hour
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredCache, 60 * 60 * 1000);
}
