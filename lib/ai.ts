import { callGeminiText, callGeminiTextForShareText } from "./gemini";

/**
 * Call AI text generation - Direct Gemini only (OpenAI removed for quota optimization)
 */
export async function callAIText(
  prompt: string,
  options?: {
    temperature?: number;
    maxOutputTokens?: number;
    model?: string;
    geminiModel?: string;
    geminiModels?: string[];
  }
): Promise<string> {
  // Direct call to Gemini (no OpenAI fallback)
  return callGeminiText(prompt, {
    temperature: options?.temperature,
    maxOutputTokens: options?.maxOutputTokens,
    model: options?.geminiModel || options?.model,
    models: options?.geminiModels,
  });
}

// SESSION 7: Dedicated ShareText generation with separate key pool
export async function callAITextForShareText(
  prompt: string,
  options?: {
    temperature?: number;
    maxOutputTokens?: number;
  }
): Promise<string> {
  return callGeminiTextForShareText(prompt, options);
}
