import { NextRequest, NextResponse } from 'next/server';
import { callAIText, callAITextForShareText } from '@/lib/ai';
import { getShareTextFromCache, saveShareTextToCache } from '@/lib/cache';

const SHARE_PROMPT_VERSION = 'v2';
const SHARE_MIN_WORDS = 80;
const SHARE_MIN_CHARS = 450;
const SHARE_MAX_WORDS = 220;
const SHARE_MAX_CHARS = 1500;

const SHARE_DEFAULT_TITLE = '\u2753 C\u00e2u h\u1ecfi ph\u00e1p lu\u1eadt';
const SHARE_CTA_LINE = '\uD83D\uDC49 Tra c\u1ee9u chi ti\u1ebft t\u1ea1i: https://trolyphaply.vn/';
const SHARE_HASHTAGS = '#Trolyphaply #Phapluat';
const SHARE_SOURCE = 'Ngu\u1ed3n: https://trolyphaply.vn';
const SHARE_FALLBACK_BULLETS = [
  '\u00c1p d\u1ee5ng t\u00f9y h\u1ed3 s\u01a1 v\u00e0 quy \u0111\u1ecbnh \u0111\u1ecba ph\u01b0\u01a1ng.',
  'N\u00ean li\u00ean h\u1ec7 c\u01a1 quan ch\u1ee9c n\u0103ng \u0111\u1ec3 x\u00e1c nh\u1eadn chi ti\u1ebft.',
  'Chu\u1ea9n b\u1ecb gi\u1ea5y t\u1edd c\u01a1 b\u1ea3n v\u00e0 ki\u1ec3m tra th\u1ee7 t\u1ee5c.',
];

const SHARE_PROMPT_HEADER = [
  '\u0042\u1ea1n l\u00e0 admin fanpage ph\u00e1p lu\u1eadt th\u00e2n thi\u1ec7n.',
  '\u0048\u00e3y vi\u1ebft 1 status Facebook b\u1eb1ng ti\u1ebfng Vi\u1ec7t C\u00d3 D\u1ea4U, r\u00f5 r\u00e0ng, ng\u1eafn g\u1ecdn nh\u01b0ng \u0111\u1ee7 \u00fd.',
  '\u0110\u1ed9 d\u00e0i: 120-180 t\u1eeb (~700-1100 k\u00fd t\u1ef1), kh\u00f4ng qu\u00e1 8 d\u00f2ng.',
  '\u0042\u1eaeT BU\u1ed8C:',
  '1) D\u00f2ng ti\u00eau \u0111\u1ec1 ng\u1eafn 1 c\u00e2u, c\u00f3 emoji ph\u00f9 h\u1ee3p (\u2753/\u2696\uFE0F/\uD83D\uDD25/\u2705).',
  '2) 3-4 \u00fd ch\u00ednh, m\u1ed7i \u00fd <= 25 t\u1eeb, vi\u1ebft d\u1ea1ng g\u1ea1ch \u0111\u1ea7u d\u00f2ng "- ".',
  '3) C\u00f3 \u00edt nh\u1ea5t 1 \u00fd n\u00eau b\u01b0\u1edbc/\u0111i\u1ec1u ki\u1ec7n/s\u1ed1 li\u1ec7u c\u1ee5 th\u1ec3.',
  '4) Kh\u00f4ng tr\u00edch nguy\u00ean v\u0103n \u0111i\u1ec1u lu\u1eadt d\u00e0i.',
  '5) CTA: "Tra c\u1ee9u chi ti\u1ebft t\u1ea1i: https://trolyphaply.vn/"',
  '6) Hashtag: #Trolyphaply #Phapluat',
  '7) Footer: "Ngu\u1ed3n: https://trolyphaply.vn"',
  '\u0059\u00caU C\u1ea6U TH\u00caM:',
  '- Vi\u1ebft c\u00f3 d\u1ea5u ti\u1ebfng Vi\u1ec7t, kh\u00f4ng b\u1ecf d\u1ea5u.',
  '- Kh\u00f4ng b\u1ecba th\u00eam th\u00f4ng tin ngo\u00e0i d\u1eef li\u1ec7u.',
  '- Tr\u00e1nh m\u1edf \u0111\u1ea7u b\u1eb1ng c\u00e2u "V\u1edbi vai tr\u00f2 l\u00e0...".',
].join('\n');

// SESSION 4 OPTIMIZATION: Hybrid generation with timeout + smart local fallback
// SESSION 5 OPTIMIZATION: Added cache layer (24h TTL)
// SESSION 7 OPTIMIZATION: Improved fallback with Vietnamese normalization + section-specific extraction
// Reduces ShareText API calls by using local fallback when AI is slow

// Helper: Normalize Vietnamese text (remove diacritics for keyword matching)
function normalizeVietnamese(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase();
}

function hasVietnameseDiacritics(text: string): boolean {
  return /[\u00C0-\u1EF9]/.test(text);
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function isShareTextValid(text: string): boolean {
  const wordCount = countWords(text);
  const charCount = text.length;

  if (wordCount < SHARE_MIN_WORDS || charCount < SHARE_MIN_CHARS) return false;
  if (wordCount > SHARE_MAX_WORDS || charCount > SHARE_MAX_CHARS) return false;
  if (!hasVietnameseDiacritics(text)) return false;

  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  const bulletCount = lines.filter((line) => line.startsWith('- ')).length;
  const hasCta = text.includes('https://trolyphaply.vn');

  return bulletCount >= 2 && hasCta;
}


// Smart local fallback: Extract key points with priority on concrete information
function truncateLine(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;

  const cutPoints = ['. ', ': ', '; ', ', '];
  for (const cut of cutPoints) {
    const idx = text.indexOf(cut);
    if (idx > 0 && idx < maxLen - 5) {
      return text.slice(0, idx);
    }
  }

  return text.slice(0, maxLen - 1).trim();
}

function extractBullets(
  section: string,
  options: { maxItems: number; minLen: number; maxLen: number; requireBullet?: boolean; prefer?: RegExp }
): string[] {
  const results: string[] = [];

  for (const line of section.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^#\s/.test(trimmed)) continue;
    if (/^I{1,3}\./.test(trimmed)) continue;

    const isBullet = /^[\-\*\+\u2022]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed);
    if (options.requireBullet && !isBullet) continue;

    const normalized = normalizeVietnamese(trimmed);
    if (options.prefer && !options.prefer.test(normalized)) continue;

    let cleaned = trimmed
      .replace(/^[\-\*\+\u2022]\s+/, '')
      .replace(/^\d+\.\s+/, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleaned.length < options.minLen) continue;
    cleaned = truncateLine(cleaned, options.maxLen);

    if (cleaned.length < options.minLen) continue;
    results.push(cleaned);

    if (results.length >= options.maxItems) break;
  }

  return results;
}

// Smart local fallback: Extract key points with priority on concrete information
function generateSmartLocalShareText(answer: string, question?: string): string {
  const q = (question || '').trim();
  const titleText = q || SHARE_DEFAULT_TITLE;
  const qNorm = normalizeVietnamese(q);

  const isYesNo = /co (can|phai|duoc)|can (khong|gi)|duoc (khong|mien)|phai (khong)/i.test(qNorm);

  const sectionIIMatch = answer.match(/# II\.([\s\S]+?)(?=\n#|$)/);
  const sectionIIIMatch = answer.match(/# III\.([\s\S]+?)(?=\n#|$)/);
  const sectionIVMatch = answer.match(/# IV\.([\s\S]+?)(?=\n#|$)/);

  const bullets: string[] = [];

  if (isYesNo && sectionIIMatch) {
    bullets.push(
      ...extractBullets(sectionIIMatch[1], {
        maxItems: 4,
        minLen: 30,
        maxLen: 140,
        requireBullet: true,
        prefer: /(khong can|duoc mien|khong thuoc|khong nam|dieu kien|truong hop|nong thon|do thi)/i,
      })
    );
  }

  if (bullets.length < 3 && sectionIIIMatch) {
    bullets.push(
      ...extractBullets(sectionIIIMatch[1], {
        maxItems: 4,
        minLen: 30,
        maxLen: 140,
        prefer: /(buoc|chuan bi|nop|lien he|goi|den|thoi han|phi|le phi)/i,
      })
    );
  }

  if (bullets.length < 3 && sectionIIMatch) {
    bullets.push(
      ...extractBullets(sectionIIMatch[1], {
        maxItems: 4,
        minLen: 30,
        maxLen: 140,
      })
    );
  }

  if (bullets.length < 3 && sectionIVMatch) {
    bullets.push(
      ...extractBullets(sectionIVMatch[1], {
        maxItems: 2,
        minLen: 30,
        maxLen: 140,
      })
    );
  }

  if (bullets.length < 3) {
    bullets.push(
      ...extractBullets(answer, {
        maxItems: 4,
        minLen: 35,
        maxLen: 140,
      })
    );
  }

  const uniqueBullets = Array.from(new Set(bullets)).filter(Boolean);
  while (uniqueBullets.length < 3) {
    uniqueBullets.push(
      SHARE_FALLBACK_BULLETS[uniqueBullets.length] ||
        SHARE_FALLBACK_BULLETS[SHARE_FALLBACK_BULLETS.length - 1]
    );
  }

  const bulletText = normalizeVietnamese(uniqueBullets.join(' '));
  const hasKhongCan =
    isYesNo && (bulletText.includes('khong can') || bulletText.includes('duoc mien') || bulletText.includes('mien'));
  const titleIcon = isYesNo ? (hasKhongCan ? '\u2705' : '\u26A0\uFE0F') : '\u2753';

  const title = `${titleIcon} ${titleText}`;
  const finalBullets = uniqueBullets.slice(0, 4);

  return [
    title,
    '',
    ...finalBullets.map((line) => `- ${line}`),
    '',
    SHARE_CTA_LINE,
    '',
    SHARE_HASHTAGS,
    SHARE_SOURCE,
  ].join('\n');
}


// Timeout wrapper for AI generation - SESSION 7: Use dedicated ShareText key pool
async function callAIWithTimeout(
  prompt: string,
  options: any,
  timeoutMs: number = 3000
): Promise<string | null> {
  const timeoutPromise = new Promise<null>((resolve) => 
    setTimeout(() => resolve(null), timeoutMs)
  );
  
  const aiPromise = callAITextForShareText(prompt, options); // SESSION 7: Use separate key pool
  
  try {
    const result = await Promise.race([aiPromise, timeoutPromise]);
    return result;
  } catch (error) {
    console.warn('[ShareText] AI generation failed:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { answer, question } = await request.json();

    if (!answer || typeof answer !== 'string') {
      return NextResponse.json(
        { error: 'Thieu noi dung answer de tao shareText' },
        { status: 400 }
      );
    }

    const sharePrompt = [
      SHARE_PROMPT_HEADER,
      '',
      '\u0044\u1eee LI\u1ec6U (Answer):',
      '"""',
      answer.trim(),
      '"""',
      question ? `\u0043\u00c2U H\u1eceI: ${question}` : '',
      '\u0043h\u1ec9 d\u1ef1a tr\u00ean th\u00f4ng tin tr\u00ean, kh\u00f4ng b\u1ecba th\u00eam.'
    ].filter(Boolean).join('\n');


    // SESSION 5: Check cache first
    const cacheQuestion = `${SHARE_PROMPT_VERSION}::${question || ''}`;
    const cachedShareText = getShareTextFromCache(cacheQuestion, answer);
    if (cachedShareText) {
      console.log('[ShareText] Cache HIT - returning cached shareText');
      return NextResponse.json({
        success: true,
        shareText: cachedShareText,
        fromCache: true,
        usedFallback: false,
      });
    }

    console.log('[ShareText] Cache MISS - generating new shareText');
    let shareText = '';
    let usedFallback = false;

    // SESSION 7: Try AI with 6s timeout, fallback to smart local
    console.log('[ShareText] Attempting AI generation with 6s timeout...');
    const aiResult = await callAIWithTimeout(sharePrompt, {
      temperature: 0.4,
      maxOutputTokens: 450, // SESSION 7: Increased to allow longer share text
    }, 6000); // SESSION 7: Increased timeout for share text generation

    if (aiResult && aiResult.trim().length > 0) {
      const aiWordCount = countWords(aiResult);
      const aiCharCount = aiResult.length;

      if (isShareTextValid(aiResult)) {
        shareText = aiResult.trim();
        console.log('[ShareText] AI generation successful');
      } else {
        console.warn(`[ShareText] AI output invalid (${aiWordCount} words, ${aiCharCount} chars) - using fallback`);
        shareText = generateSmartLocalShareText(answer, question);
        usedFallback = true;
      }
    } else {
      console.log('[ShareText] AI timeout or failed, using smart local fallback');
      shareText = generateSmartLocalShareText(answer, question);
      usedFallback = true;
    }

    // Remove markdown formatting for clean social media posting
    shareText = shareText
      .replace(/\*\*\*(.+?)\*\*\*/g, '$1')  // ***bold italic*** → text
      .replace(/\*\*(.+?)\*\*/g, '$1')       // **bold** → text
      .replace(/\*(.+?)\*/g, '$1')           // *italic* → text
      .replace(/__(.+?)__/g, '$1')           // __underline__ → text
      .replace(/_(.+?)_/g, '$1')             // _italic_ → text
      .trim();

    // SESSION 5: Save to cache
    saveShareTextToCache(cacheQuestion, answer, shareText.trim());
    console.log('[ShareText] Saved to cache');

    return NextResponse.json({
      success: true,
      shareText: shareText.trim(),
      fromCache: false,
      usedFallback, // For monitoring
    });
  } catch (error: any) {
    console.error('ShareText API Error:', error);
    return NextResponse.json(
      { error: 'Loi khi tao shareText. Vui long thu lai.' },
      { status: 500 }
    );
  }
}
