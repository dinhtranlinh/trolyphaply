import { NextRequest, NextResponse } from 'next/server';
import { callAIText, callAITextForShareText } from '@/lib/ai';
import { getShareTextFromCache, saveShareTextToCache } from '@/lib/cache';

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

// Smart local fallback: Extract key points with priority on concrete information
function generateSmartLocalShareText(answer: string, question?: string): string {
  const q = question || '';
  const qNorm = normalizeVietnamese(q);
  
  // Detect question type
  const isYesNo = /co (can|phai|duoc)|can (khong|gi)|duoc (khong|mien)|phai (khong)/i.test(qNorm);

  if (isYesNo) {
    // YES/NO question: Extract from Section II + IV
    const sectionIIMatch = answer.match(/# II\.([\s\S]+?)(?=\n#|$)/);
    const sectionIVMatch = answer.match(/# IV\.([\s\S]+?)(?=\n#|$)/);
    
    let conditions: string[] = [];
    let conclusion = '';
    
    // Extract conditions from Section II
    if (sectionIIMatch) {
      const section = sectionIIMatch[1];
      const lines = section.split('\n');
      
      // Look for numbered lists or bullet points
      for (const line of lines) {
        const trimmed = line.trim();
        const lineNorm = normalizeVietnamese(trimmed);
        
        // Skip if too short
        if (trimmed.length < 20) continue;
        
        // Match numbered/bullet items: "1.", "2.", "* ", "- "
        const isBullet = /^[\d\*\-\+]\.|^[\*\-]\s/.test(trimmed);
        
        // Check for condition keywords
        const hasCondition = /(khong can|duoc mien|khong thuoc|khong nam|rieng le|nong thon|dieu kien|truong hop)/i.test(lineNorm);
        
        if (isBullet && hasCondition) {
          // Clean and shorten
          let cleaned = trimmed
            .replace(/^[\d\*\-\+]\.\s*/, '')  // Remove "1. " or "* "
            .replace(/^[\*\-]\s+/, '')
            .replace(/^[Kk]hong thuoc/, 'Không thuộc')
            .replace(/^[Cc]hua co/, 'Chưa có');
          
          // Shorten long sentences
          if (cleaned.length > 70) {
            // Try to cut at natural break
            const cutPoints = ['. ', ': ', ', '];
            for (const cut of cutPoints) {
              const idx = cleaned.indexOf(cut);
              if (idx > 0 && idx < 70) {
                cleaned = cleaned.substring(0, idx);
                break;
              }
            }
            // If still long, hard cut
            if (cleaned.length > 70) {
              cleaned = cleaned.substring(0, 67);
            }
          }
          
          conditions.push(cleaned);
          if (conditions.length >= 3) break;
        }
      }
    }
    
    // Get conclusion from Section IV
    if (sectionIVMatch) {
      const lines = sectionIVMatch[1].split('\n').filter(l => l.trim().length > 30);
      if (lines[0]) {
        conclusion = lines[0].trim().substring(0, 100);
      }
    }
    
    // Determine icon based on conclusion/conditions
    const allText = (conclusion + conditions.join(' ')).toLowerCase();
    const hasKhongCan = allText.includes('không cần') || allText.includes('được miễn') || allText.includes('miễn giấy phép');
    const icon = hasKhongCan ? '✅ KHÔNG CẦN nếu:' : '⚠️ CẦN nếu:';
    
    if (conditions.length >= 2) {
      return `❓ ${q}

${icon}
${conditions.map(c => `- ${c}`).join('\n')}

👉 Tra cuu chi tiet tai: https://trolyphaply.vn/

#Trolyphaply #Phapluat
Nguon: https://trolyphaply.vn`;
    } else if (conclusion) {
      // Fallback to conclusion if no good conditions
      return `❓ ${q}

ℹ️ ${conclusion}

👉 Tra cuu chi tiet tai: https://trolyphaply.vn/

#Trolyphaply #Phapluat
Nguon: https://trolyphaply.vn`;
    }
  }

  // PROCEDURE question: Extract 3 steps from Section III specifically
  const sectionIIIMatch = answer.match(/# III\.([\s\S]+?)(?=\n#|$)/);
  
  if (sectionIIIMatch) {
    const normalized = normalizeVietnamese(sectionIIIMatch[1]);
    const bullets: Array<{ text: string; priority: number }> = [];
    
    sectionIIIMatch[1].split('\n').forEach(line => {
      const lineNorm = normalizeVietnamese(line);
      const trimmed = line.trim();
      
      // Skip empty or title lines
      if (trimmed.length < 20 || /^(Trinh tu|Thu tuc|Cac buoc)/i.test(trimmed)) return;
      
      // Priority: Lines with concrete numbers/steps
      let priority = 0;
      if (/Buoc \d+|^\d+\.|Buoc mot|Buoc hai|Buoc ba/i.test(lineNorm)) priority += 10;
      if (/\d+\s*(ngay|thang|trieu|tuan|gio)/i.test(lineNorm)) priority += 5;
      if (/(lien he|goi|nop|chuan bi|den)/i.test(lineNorm)) priority += 3;
      
      if (priority > 0) {
        bullets.push({
          text: trimmed.replace(/^[*-]\s*/, '').replace(/^\d+\.\s*/, '').substring(0, 120),
          priority
        });
      }
    });
    
    const top3 = bullets
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3)
      .map(b => b.text);
    
    if (top3.length >= 2) {
      return `❓ ${q}

📞 ${top3[0] || 'Lien he co quan chuc nang'}
📋 ${top3[1] || 'Chuan bi ho so theo quy dinh'}
${top3[2] ? `📄 ${top3[2]}` : ''}

👉 Tra cuu chi tiet tai: https://trolyphaply.vn/

#Trolyphaply #Phapluat
Nguon: https://trolyphaply.vn`;
    }
  }

  // LAST RESORT: Generic fallback (no placeholder)
  const firstParagraph = answer.split('\n').filter(l => l.trim().length > 50)[0]?.trim().substring(0, 100) || '';
  
  return `❓ ${q}

ℹ️ ${firstParagraph || 'Can kiem tra dieu kien cu the tai dia phuong'}
📋 Thu tuc co the khac nhau tuy dia phuong
⚠️ Nen lien he co quan chuc nang de xac nhan chi tiet

👉 Tra cuu chi tiet tai: https://trolyphaply.vn/

#Trolyphaply #Phapluat
Nguon: https://trolyphaply.vn`;
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

    const sharePrompt = `Ban la Admin Fanpage phap luat than thien.
Viet 1 status Facebook NGAN GON (<100 tu) NHUNG PHAI CO NOI DUNG THUC TE.

YEU CAU BAT BUOC:
1) Headline: 1 dong ngan, co icon (FIRE/QUESTION/BALANCE)
2) Than bai: 
   - CHI 3 y chinh NHAT - nhung phai TRA LOI TRUC TIEP cau hoi
   - Moi y < 25 tu
   - Co so lieu cu the hoac buoc thu tuc cu the
   - KHONG ghi ten van ban phap luat
   - KHONG duoc chi viet tieu de roi bo trong
3) Tong do dai: < 100 tu
4) Icon: Dung icon phu hop voi noi dung (VD: 📞 cho "lien he", 📋 cho "giay to", 🏦 cho "ngan hang")
5) CTA: "Tra cuu chi tiet tai: https://trolyphaply.vn/"
6) Hashtag: 2-3 tags (#Trolyphaply #Phapluat)
7) Footer: "Nguon: https://trolyphaply.vn"

FORMAT YEU CAU:
❓ [Tieu de ngan]

[Icon phu hop] [Y chinh 1 - < 25 tu]
[Icon phu hop] [Y chinh 2 - < 25 tu]  
[Icon phu hop] [Y chinh 3 - < 25 tu]

👉 Tra cuu...
#Tags
Nguon...

VD TOT SO 1 (Cau hoi ve muc phat):
❓ Muc phat nong do con?

🚗 Duoi 50mg: 2-3 trieu + giu xe 7 ngay
🚗 50-80mg: 6-8 trieu + tuoc GPLX 16-18 thang
🚗 Tren 80mg: 30-40 trieu + tuoc GPLX 22-24 thang

👉 Tra cuu chi tiet tai: https://trolyphaply.vn/

#Trolyphaply #Phapluat
Nguon: https://trolyphaply.vn

VD TOT SO 2 (Cau hoi ve thu tuc):
❓ Bi lua dao chuyen tien - to giac o dau?

📞 Buoc 1: Goi hotline ngan hang ngay de khoa TK nguoi nhan
📋 Buoc 2: Den Cong an huyen/thanh pho noi cu tru nop don
📄 Buoc 3: Chuan bi: Tin nhan + sao ke + thong tin TK lua dao

👉 Tra cuu chi tiet tai: https://trolyphaply.vn/

#Trolyphaply #Phapluat
Nguon: https://trolyphaply.vn

VD TOT SO 3 (Cau hoi YES/NO + dieu kien):
❓ Xay nha cap 4 nong thon can giay phep?

✅ KHONG CAN neu:
- Nha rieng le tai nong thon
- Khong trong khu bao ton/di tich

⚠️ VAN PHAI tuan thu quy hoach + an toan

👉 Tra cuu chi tiet tai: https://trolyphaply.vn/

#Trolyphaply #Phapluat
Nguon: https://trolyphaply.vn

VD TOT SO 4 (Cau hoi phuc tap ve dieu kien phap ly):
❓ Cho vay qua tin nhan khong co giay to kien duoc khong?

📋 Co the kien neu co tin nhan ro rang ve: so tien, ngay vay, cam ket tra no
💰 Can sao ke ngan hang chung minh chuyen tien
⚖️ Toa an se danh gia gia tri chung cu - khong dam bao thang 100%

👉 Tra cuu chi tiet tai: https://trolyphaply.vn/

#Trolyphaply #Phapluat
Nguon: https://trolyphaply.vn

VD XAU (Chi co tieu de, khong co noi dung):
- Khong trong khu bao ton/di tich

⚠️ VAN PHAI tuan thu quy hoach + an toan

👉 Tra cuu chi tiet tai: https://trolyphaply.vn/

#Trolyphaply #Phapluat
Nguon: https://trolyphaply.vn

VD TOT SO 4 (Cau hoi phuc tap ve dieu kien phap ly):
❓ Cho vay qua tin nhan khong co giay to kien duoc khong?

📋 Co the kien neu co tin nhan ro rang ve: so tien, ngay vay, cam ket tra no
💰 Can sao ke ngan hang chung minh chuyen tien
⚖️ Toa an se danh gia gia tri chung cu - khong dam bao thang 100%

👉 Tra cuu chi tiet tai: https://trolyphaply.vn/

#Trolyphaply #Phapluat
Nguon: https://trolyphaply.vn

VD XAU (Chi co tieu de, khong co noi dung):
❓ Bi lua dao

Hix, ban co kiem tra duoc log de biet nguyen nhan khong?

CANH BAO NGHIEM TRONG:
- TONG DO DAI TOI DA: 100 tu (500-600 ky tu)
- NEU vuot qua 150 tu -> BI TU CHOI
- KHONG duoc copy nguyen van cau tra loi dai
- CHI TOM TAT 3 y chinh NHAT
- NEU output qua dai -> SE BI LOAI BO

DULIEU (Answer):
"""
${answer.trim()}
"""
${question ? `CAU HOI: ${question}` : ''}
Chi dua tren thong tin tren, khong bia them.`;

    // SESSION 5: Check cache first
    const cachedShareText = getShareTextFromCache(question || '', answer);
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

    // SESSION 7: Try AI with 5s timeout, fallback to smart local
    console.log('[ShareText] Attempting AI generation with 5s timeout...');
    const aiResult = await callAIWithTimeout(sharePrompt, {
      temperature: 0.3,
      maxOutputTokens: 300, // SESSION 7: Increased from 250 to 300
    }, 5000); // SESSION 7: Increased from 3000 to 5000ms

    if (aiResult && aiResult.trim().length > 0) {
      // HARD CHECK: Reject if output is too long (copying entire answer)
      const wordCount = aiResult.split(/\s+/).filter(w => w.length > 0).length;
      const charCount = aiResult.length;
      
      if (wordCount > 140 || charCount > 850) { // SESSION 7: Adjusted from 150/800 to 140/850
        console.warn(`[ShareText] AI output TOO LONG (${wordCount} words, ${charCount} chars) - using fallback`);
        shareText = generateSmartLocalShareText(answer, question);
        usedFallback = true;
      } else {
        // Validate: Check if output has actual content (not just title)
        const hasContent = aiResult.includes('📞') || 
                           aiResult.includes('📋') || 
                           aiResult.includes('🚗') ||
                           aiResult.includes('🏦') ||
                           aiResult.includes('✅') ||
                           aiResult.includes('⚠️') ||
                           aiResult.split('\n').length >= 6;
        
        if (hasContent && !aiResult.toLowerCase().includes('hix')) {
          shareText = aiResult;
          console.log('[ShareText] AI generation successful');
        } else {
          console.warn('[ShareText] AI output invalid or empty, using fallback');
          shareText = generateSmartLocalShareText(answer, question);
          usedFallback = true;
        }
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
    saveShareTextToCache(question || '', answer, shareText.trim());
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
