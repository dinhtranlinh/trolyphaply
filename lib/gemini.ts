// Google Gemini AI wrapper
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKeys = [
  process.env.GEMINI_API_KEY_1!,
  process.env.GEMINI_API_KEY_2!,
  process.env.GEMINI_API_KEY_3!,
  process.env.GEMINI_API_KEY_4!,
].filter(Boolean);

let currentKeyIndex = 0;

function getNextApiKey(): string {
  const key = apiKeys[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  return key;
}

export async function callGeminiText(
  prompt: string,
  options?: {
    temperature?: number;
    maxOutputTokens?: number;
    model?: string;
  }
): Promise<string> {
  const maxRetries = 3;
  const models = [
    options?.model || 'gemini-2.5-flash',
    'gemini-1.5-pro', // Fallback to stable model
    'gemini-pro', // Final fallback
  ];
  
  for (let modelIndex = 0; modelIndex < models.length; modelIndex++) {
    const modelName = models[modelIndex];
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const apiKey = getNextApiKey();
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: modelName,
        });

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: options?.temperature ?? 0.9,
            maxOutputTokens: options?.maxOutputTokens ?? 2048,
          },
        });

        const response = result.response;
        return response.text();
      } catch (error: any) {
        const isOverloaded = error.status === 503 || error.message?.includes('overloaded');
        const isLastAttempt = attempt === maxRetries - 1;
        const isLastModel = modelIndex === models.length - 1;
        
        if (isOverloaded && !isLastAttempt) {
          // Wait before retry (exponential backoff)
          const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
          await new Promise(resolve => setTimeout(resolve, waitTime));
          console.log(`Retry ${attempt + 1}/${maxRetries} for model ${modelName}...`);
          continue;
        }
        
        if (isOverloaded && !isLastModel) {
          // Try next model
          console.log(`Model ${modelName} overloaded, trying ${models[modelIndex + 1]}...`);
          break;
        }
        
        // Re-throw error if all retries failed
        if (isLastAttempt && isLastModel) {
          throw error;
        }
      }
    }
  }
  
  throw new Error('All models failed after retries');
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
