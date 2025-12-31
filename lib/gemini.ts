// Google Gemini AI wrapper
import { GoogleGenerativeAI } from '@google/generative-ai';

// === CIRCUIT BREAKER STATE ===
interface KeyHealth {
  failures: number;
  lastFailure: number | null;
  lastSuccess: number | null;
}

const keyHealthMap = new Map<string, KeyHealth>();

const CIRCUIT_BREAKER_CONFIG = {
  COOLDOWN_MS: 60 * 1000, // 60 seconds
  FAILURE_THRESHOLD: 3, // 3 consecutive failures
};

function getKeyHealth(apiKey: string): KeyHealth {
  if (!keyHealthMap.has(apiKey)) {
    keyHealthMap.set(apiKey, {
      failures: 0,
      lastFailure: null,
      lastSuccess: null,
    });
  }
  return keyHealthMap.get(apiKey)!;
}

function isKeyHealthy(apiKey: string): boolean {
  const health = getKeyHealth(apiKey);
  
  // If failures below threshold, key is healthy
  if (health.failures < CIRCUIT_BREAKER_CONFIG.FAILURE_THRESHOLD) {
    return true;
  }
  
  // If failures above threshold, check cooldown
  if (health.lastFailure) {
    const cooldownExpired = Date.now() - health.lastFailure > CIRCUIT_BREAKER_CONFIG.COOLDOWN_MS;
    if (cooldownExpired) {
      // Reset after cooldown
      health.failures = 0;
      return true;
    }
  }
  
  return false;
}

function markKeySuccess(apiKey: string): void {
  const health = getKeyHealth(apiKey);
  health.failures = 0;
  health.lastSuccess = Date.now();
}

function markKeyFailure(apiKey: string, error: any): void {
  const health = getKeyHealth(apiKey);
  health.failures += 1;
  health.lastFailure = Date.now();
  
  console.warn(
    `[Circuit Breaker] Key ...${apiKey.slice(-6)} failed (${health.failures}/${CIRCUIT_BREAKER_CONFIG.FAILURE_THRESHOLD}): ${error?.message || error}`
  );
}

// Collect all configured Gemini keys (GEMINI_API_KEY, GEMINI_API_KEY_1..n)
let apiKeys = Object.entries(process.env)
  .filter(([key, value]) =>
    (key === 'GEMINI_API_KEY' || key.startsWith('GEMINI_API_KEY_')) &&
    typeof value === 'string' &&
    value.trim().length > 0
  )
  .sort((a, b) => {
    // Keep deterministic order by numeric suffix
    const getNum = (k: string) => {
      const parts = k.split('_');
      const maybeNum = parts[parts.length - 1];
      const parsed = parseInt(maybeNum, 10);
      return Number.isNaN(parsed) ? 0 : parsed;
    };
    return getNum(a[0]) - getNum(b[0]);
  })
  .map(([, value]) => value!.trim());

let currentKeyIndex = 0;

function getNextApiKey(): string {
  if (apiKeys.length === 0) {
    throw new Error('No Gemini API key configured');
  }

  const key = apiKeys[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  return key;
}

function dropApiKey(badKey: string) {
  apiKeys = apiKeys.filter((key) => key !== badKey);
  if (currentKeyIndex >= apiKeys.length) {
    currentKeyIndex = 0;
  }
}

function isQuotaOrAuthError(error: any): boolean {
  const status = error?.status || error?.code;
  const message = (error?.message || '').toString().toLowerCase();
  return (
    status === 429 ||
    status === 403 ||
    status === 'RESOURCE_EXHAUSTED' ||
    message.includes('quota') ||
    message.includes('exceeded') ||
    message.includes('rate limit') ||
    message.includes('permission') ||
    message.includes('billing')
  );
}

export async function callGeminiText(
  prompt: string,
  options?: {
    temperature?: number;
    maxOutputTokens?: number;
    model?: string;
    topP?: number;
    topK?: number;
    models?: string[];
  }
): Promise<string> {
  // Single model only (no cascade) - Optimization: Reduce API calls
  const modelName = options?.model || process.env.MODEL_NAME || 'gemini-2.5-flash';

  let lastError: any = null;

  // Filter healthy keys only (Circuit Breaker)
  const healthyKeys = apiKeys.filter(isKeyHealthy);
  
  if (healthyKeys.length === 0) {
    console.error('[Circuit Breaker] All keys are unhealthy. Waiting for cooldown...');
    // Fallback: Try all keys anyway (emergency mode)
    healthyKeys.push(...apiKeys);
  }
  
  // Log circuit breaker status
  const unhealthyCount = apiKeys.length - healthyKeys.length;
  if (unhealthyCount > 0) {
    console.warn(`[Circuit Breaker] ${unhealthyCount}/${apiKeys.length} keys are unhealthy and skipped`);
  }

  // Round-robin across healthy keys
  const startIndex = currentKeyIndex % healthyKeys.length;
  const keyCount = healthyKeys.length;

  for (let offset = 0; offset < keyCount; offset++) {
    const keyIndex = (startIndex + offset) % keyCount;
    const apiKey = healthyKeys[keyIndex];

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
      });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options?.temperature ?? 0.2,
          maxOutputTokens: options?.maxOutputTokens ?? 8192,
          topP: options?.topP ?? 0.95,
          topK: options?.topK ?? 40,
        },
      });

      const response = result.response;
      
      // Mark success and advance pointer
      markKeySuccess(apiKey);
      currentKeyIndex = (keyIndex + 1) % keyCount;
      
      console.log(`[Gemini] Success with model: ${modelName}, key: ...${apiKey.slice(-6)}`);
      return response.text();
    } catch (error: any) {
      lastError = error;
      const isOverloaded =
        error?.status === 503 || error?.code === 503 || error?.message?.toLowerCase().includes('overloaded');
      const isQuota = isQuotaOrAuthError(error);

      if (isQuota || isOverloaded) {
        // Mark key as failed (Circuit Breaker)
        markKeyFailure(apiKey, error);
        
        console.warn(
          `[Gemini] Key issue (${modelName} / ...${apiKey.slice(-6)}): ${error?.message || error}. Trying next key...`
        );
        // Try next key immediately
        continue;
      }

      // Non-quota errors: Mark failure but throw immediately
      markKeyFailure(apiKey, error);
      throw error;
    }
  }

  const aggregatedError: any = new Error(
    `All Gemini keys exhausted for model ${modelName}. Please try again later.`
  );
  aggregatedError.status = 503;
  aggregatedError.code = 503;
  aggregatedError.cause = lastError || undefined;
  throw aggregatedError;
}

// SESSION 7: Dedicated function for ShareText with separate key pool strategy
// Use last 2-3 keys in rotation to reduce contention with main Answer generation
export async function callGeminiTextForShareText(
  prompt: string,
  options?: {
    temperature?: number;
    maxOutputTokens?: number;
  }
): Promise<string> {
  const modelName = 'gemini-2.5-flash';
  
  // Use LAST 2 keys for ShareText (less contention)
  const shareTextKeys = apiKeys.slice(-2).filter(isKeyHealthy);
  
  if (shareTextKeys.length === 0) {
    console.warn('[ShareText] No healthy keys in shareText pool, falling back to main pool');
    // Fallback to main pool
    return callGeminiText(prompt, options);
  }
  
  // Simple round-robin within shareText pool
  const keyIndex = Date.now() % shareTextKeys.length;
  const apiKey = shareTextKeys[keyIndex];
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: options?.temperature ?? 0.3,
        maxOutputTokens: options?.maxOutputTokens ?? 300,
        topP: 0.95,
        topK: 40,
      },
    });

    markKeySuccess(apiKey);
    console.log(`[ShareText] Success with key: ...${apiKey.slice(-6)}`);
    return result.response.text();
  } catch (error: any) {
    markKeyFailure(apiKey, error);
    console.warn(`[ShareText] Key ...${apiKey.slice(-6)} failed: ${error?.message}`);
    throw error;
  }
}

export async function parseGeminiJSON<T = any>(
  prompt: string,
  options?: {
    temperature?: number;
    maxOutputTokens?: number;
  }
): Promise<T> {
  const result = await callGeminiText(prompt, {
    ...options,
    temperature: options?.temperature ?? 0.3, // Lower temperature for JSON
  });

  // Extract JSON from markdown code blocks if present
  const jsonMatch = result.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const jsonStr = jsonMatch ? jsonMatch[1] : result;

  try {
    return JSON.parse(jsonStr.trim());
  } catch (error) {
    console.error('Failed to parse JSON from Gemini response:', result);
    throw new Error(`Invalid JSON response from Gemini: ${error}`);
  }
}

export async function callGeminiVision(
  prompt: string,
  imageData: string | Buffer,
  options?: {
    temperature?: number;
    maxOutputTokens?: number;
  }
): Promise<string> {
  const apiKey = getNextApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
  });

  // Convert Buffer to base64 if needed
  const base64Image =
    typeof imageData === 'string'
      ? imageData
      : imageData.toString('base64');

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: options?.temperature ?? 0.7,
      maxOutputTokens: options?.maxOutputTokens ?? 2048,
    },
  });

  return result.response.text();
}
