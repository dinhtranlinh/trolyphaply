/**
 * Share Templates for Social Media
 * Generate share content for Facebook, Zalo with optimized text
 */

interface ShareContentData {
  // Common fields
  title: string;
  description?: string;
  url: string;
  
  // Q&A specific
  question?: string;
  answer?: string;
  
  // Prompt specific
  promptTemplate?: string;
  category?: string;
  creatorCode?: string;
  
  // Law article specific (future)
  articleTitle?: string;
  summary?: string;
}

interface ShareContent {
  title: string;
  description: string;
  url: string;
  hashtags: string[];
}

/**
 * Truncate text with ellipsis
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Generate share content for Q&A
 */
export function generateQAShareContent(data: ShareContentData): ShareContent {
  const question = data.question || data.title;
  const answer = data.answer || data.description || '';
  
  const title = `💬 Câu hỏi pháp lý: "${truncate(question, 100)}"`;
  
  const answerPreview = answer 
    ? `✅ Câu trả lời: ${truncate(answer, 150)}`
    : 'Xem câu trả lời đầy đủ tại TroLyPhapLy.vn';
  
  const description = `${answerPreview}\n\n📎 Xem chi tiết: ${data.url}\n🤖 TroLyPhapLy.vn - Trợ lý pháp lý AI miễn phí`;
  
  return {
    title,
    description,
    url: data.url,
    hashtags: ['PhapLuat', 'TuVanPhapLy', 'TroLyPhapLy', 'AI'],
  };
}

/**
 * Generate share content for AI Prompt
 */
export function generatePromptShareContent(data: ShareContentData): ShareContent {
  const title = `🎨 AI Prompt: "${truncate(data.title, 80)}"`;
  
  const descriptionText = data.description || data.promptTemplate || '';
  const preview = truncate(descriptionText, 120);
  
  const creatorTag = data.creatorCode ? `👤 @${data.creatorCode}` : '👤 Ẩn danh';
  const categoryTag = data.category ? `📁 ${data.category}` : '';
  
  const description = `✨ ${preview}\n\n${creatorTag}${categoryTag ? ' • ' + categoryTag : ''}\n\n📎 Sử dụng prompt này: ${data.url}\n🎯 TroLyPhapLy.vn - Thư viện AI Prompts miễn phí`;
  
  return {
    title,
    description,
    url: data.url,
    hashtags: ['AIPrompt', 'MidJourney', 'AI', 'TroLyPhapLy'],
  };
}

/**
 * Generate share content for Law Article (future)
 */
export function generateLawArticleShareContent(data: ShareContentData): ShareContent {
  const title = `⚖️ Pháp luật: ${truncate(data.articleTitle || data.title, 100)}`;
  
  const summary = data.summary || data.description || '';
  const preview = truncate(summary, 150);
  
  const description = `${preview}\n\n📎 Đọc bài viết đầy đủ: ${data.url}\n⚖️ TroLyPhapLy.vn - Cổng thông tin pháp luật`;
  
  return {
    title,
    description,
    url: data.url,
    hashtags: ['PhapLuatVietNam', 'TroLyPhapLy', 'PhapLuat'],
  };
}

/**
 * Main function: Generate share content based on type
 */
export function generateShareContent(
  type: 'qa' | 'prompt' | 'law',
  data: ShareContentData
): ShareContent {
  switch (type) {
    case 'qa':
      return generateQAShareContent(data);
    case 'prompt':
      return generatePromptShareContent(data);
    case 'law':
      return generateLawArticleShareContent(data);
    default:
      // Fallback generic share
      return {
        title: data.title,
        description: data.description || '',
        url: data.url,
        hashtags: ['TroLyPhapLy'],
      };
  }
}

/**
 * Generate deep link URL for Q&A
 * Encode question to base64 for URL
 */
export function generateQADeepLink(question: string, baseUrl: string = 'https://trolyphaply.vn'): string {
  if (typeof window !== 'undefined') {
    // Client-side: use current origin if available
    const origin = window.location.origin;
    baseUrl = origin || baseUrl;
  }
  
  // Encode question to base64
  const encoded = typeof window !== 'undefined'
    ? btoa(encodeURIComponent(question))
    : Buffer.from(question).toString('base64');
  
  return `${baseUrl}/law?q=${encoded}`;
}

/**
 * Decode Q&A deep link
 * Extract question from URL parameter
 */
export function decodeQADeepLink(encodedQuestion: string): string {
  try {
    if (typeof window !== 'undefined') {
      return decodeURIComponent(atob(encodedQuestion));
    } else {
      return Buffer.from(encodedQuestion, 'base64').toString('utf-8');
    }
  } catch (err) {
    console.error('Failed to decode Q&A deep link:', err);
    return '';
  }
}
