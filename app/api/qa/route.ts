import { NextRequest, NextResponse } from 'next/server';
import { callAIText } from '@/lib/ai';
import { createClient } from '@/lib/supabase';
import { getAnswerFromCache, saveAnswerToCache } from '@/lib/cache';
import { randomUUID } from 'crypto';

// SESSION 3 OPTIMIZATION: Removed quality retry loop (-50% API calls)
// SESSION 5 OPTIMIZATION: Added cache layer (24h TTL)
// Single attempt with improved prompt for better first-time accuracy

const SESSION_COOKIE_NAME = 'qa_session_id';
const CONTEXT_TARGET_CHARS = 700;
const CONTEXT_MAX_CHARS = 900;

function cleanSummaryLine(line: string): string {
  return line
    .replace(/^[\-\*\u2022]\s+/, '')
    .replace(/^\d+\.\s+/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function collectSummaryLines(text: string): string[] {
  return text
    .split('\n')
    .map(cleanSummaryLine)
    .filter((line) => line.length >= 35 && !/^#/.test(line) && !/^I{1,3}\./.test(line));
}

function buildSessionSummary(answer: string): string {
  const sections: string[] = [];
  const sectionIIMatch = answer.match(/# II\.([\s\S]+?)(?=\n#|$)/);
  if (sectionIIMatch) sections.push(sectionIIMatch[1]);
  const sectionIIIMatch = answer.match(/# III\.([\s\S]+?)(?=\n#|$)/);
  if (sectionIIIMatch) sections.push(sectionIIIMatch[1]);
  const sectionIVMatch = answer.match(/# IV\.([\s\S]+?)(?=\n#|$)/);
  if (sectionIVMatch) sections.push(sectionIVMatch[1]);

  let candidates: string[] = [];
  for (const section of sections) {
    candidates = candidates.concat(collectSummaryLines(section));
  }

  if (candidates.length === 0) {
    candidates = collectSummaryLines(answer);
  }

  let summary = '';
  for (const line of candidates) {
    const next = summary ? `${summary}\n${line}` : line;
    if (next.length > CONTEXT_MAX_CHARS) break;
    summary = next;
    if (summary.length >= CONTEXT_TARGET_CHARS) break;
  }

  if (!summary) {
    summary = answer.replace(/\s+/g, ' ').trim().slice(0, CONTEXT_MAX_CHARS);
  }

  return summary.trim();
}

async function loadSessionContext(supabase: any, sessionId: string): Promise<string> {
  if (!sessionId) return '';
  try {
    const { data, error } = await supabase
      .from('qa_session_contexts')
      .select('context')
      .eq('session_id', sessionId)
      .single();

    if (error) {
      const code = (error as any).code;
      if (code !== 'PGRST116' && code !== '42P01') {
        console.warn('[qa] session context load error:', error.message || error);
      }
      return '';
    }

    return data?.context || '';
  } catch (err: any) {
    console.warn('[qa] session context load error:', err?.message || err);
    return '';
  }
}

async function saveSessionContext(supabase: any, sessionId: string, context: string): Promise<void> {
  if (!sessionId || !context) return;
  try {
    const { error } = await supabase
      .from('qa_session_contexts')
      .upsert({ session_id: sessionId, context }, { onConflict: 'session_id' });

    if (error) {
      const code = (error as any).code;
      if (code !== '42P01') {
        console.warn('[qa] session context save error:', error.message || error);
      }
    }
  } catch (err: any) {
    console.warn('[qa] session context save error:', err?.message || err);
  }
}

function buildSuccessResponse(sessionId: string, payload: any) {
  const response = NextResponse.json(payload);
  response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}

export async function POST(request: NextRequest) {
  try {
    const { question, styleGuideId } = await request.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Câu hỏi không hợp lệ' },
        { status: 400 }
      );
    }

    if (question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Câu hỏi không được để trống' },
        { status: 400 }
      );
    }

    if (question.length > 1000) {
      return NextResponse.json(
        { error: 'Câu hỏi quá dài (tối đa 1000 ký tự)' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value || randomUUID();
    const sessionContext = await loadSessionContext(supabase, sessionId);

    // Fetch active Q&A prompt from database
    const { data: activePrompt } = await supabase
      .from('qa_prompts')
      .select(`
        *,
        writing_styles:qa_prompt_writing_styles(
          priority,
          style:legal_writing_styles(*)
        )
      `)
      .eq('is_active', true)
      .single();

    // Fetch style guide
    let styleGuide: any = null;
    let examples: any[] = [];

    if (styleGuideId) {
      const { data: guide } = await supabase
        .from('style_guides')
        .select('*')
        .eq('id', styleGuideId)
        .single();

      if (!guide) {
        return NextResponse.json(
          { error: 'Style guide không tồn tại' },
          { status: 404 }
        );
      }

      styleGuide = guide;

      const { data: examplesData } = await supabase
        .from('style_guide_examples')
        .select('*')
        .eq('style_guide_id', styleGuideId);

      examples = examplesData || [];
    } else {
      const { data: guide } = await supabase
        .from('style_guides')
        .select('*')
        .eq('is_default', true)
        .single();

      if (guide) {
        styleGuide = guide;

        const { data: examplesData } = await supabase
          .from('style_guide_examples')
          .select('*')
          .eq('style_guide_id', guide.id);

        examples = examplesData || [];
      }
    }

    // Build system prompt
    let systemPrompt = '';

    if (activePrompt && activePrompt.prompt_text) {
      systemPrompt = activePrompt.prompt_text;

      if (activePrompt.writing_styles && activePrompt.writing_styles.length > 0) {
        systemPrompt += `\n\nCAC VAN PHONG TRA LOI (uu tien theo thu tu):\n`;

        activePrompt.writing_styles
          .sort((a: any, b: any) => a.priority - b.priority)
          .forEach((ws: any, index: number) => {
            const style = ws.style;
            systemPrompt += `\n${index + 1}. ${style.name}\n   ${style.description}\n   Vi du: ${style.example_content}\n`;
          });
      }
    } else {
      systemPrompt = `Ban la tro ly phap ly AI chuyen nghiep cua Viet Nam. Nhiem vu cua ban la:
1. Tra loi cac cau hoi ve phap luat va thu tuc hanh chinh Viet Nam.
2. Cung cap thong tin chinh xac, de hieu va co cau truc ro rang.

YEU CAU QUAN TRONG VE CAU TRUC VA DO DAI:
1. Tinh hoan thien tuyet doi: Cau tra loi BAT BUOC phai co du 3 phan: Mo dau - Noi dung chinh (Can cu & Thu tuc) - Ket luan/Loi khuyen. Khong duoc de cau tra loi bi cat ngung giua chung.
2. Phan bo dung luong hop ly:
   - Phan co so phap ly: Chi neu ten dieu luat va TOM TAT noi dung chinh ngan gon (khong trich dan nguyen van ca dieu luat dai dong tru khi can thiet).
   - Phan thu tuc/huong dan: Phai chi tiet, cu the tung buoc (Step-by-step). Day la phan quan trong nhat.
3. Gioi han: Tong do dai khoang 800 - 1000 tu. Neu noi dung qua dai, hay uu tien luoc bot phan ly thuyet, giu nguyen phan huong dan thuc hien.

NGUON DU LIEU UU TIEN:
- Uu tien tham khao tu Legal Library (co so du lieu noi bo).
- Tham khao cac nguon chinh thong khac (thu tu uu tien):
   1. vanban.chinhphu.vn (Van ban Chinh phu)
   2. congbao.gov.vn (Cong bao)
   3. thuvienphapluat.vn (Thu vien phap luat)
   4. Cac trang chinh thong cua cac Bo/Nganh lien quan

DINH DANG CAU TRA LOI:
- Su dung Heading ro rang (I, II, III).
- Dung Bullet point cho cac liet ke.
- Luon ket thuc bang mot loi khuyen hoac luu y quan trong cho nguoi dung.

Luu y: Noi dung tham khao, khong thay the tu van phap ly chinh thuc.`;
    }

    if (styleGuide) {
      systemPrompt += `

VAN PHONG TRA LOI: ${styleGuide.name}
${styleGuide.description}

DAC DIEM:
${Array.isArray(styleGuide.characteristics) ? styleGuide.characteristics.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n') : styleGuide.characteristics}

GIONG DIEU: ${Array.isArray(styleGuide.tone) ? styleGuide.tone.join(', ') : styleGuide.tone}`;

      if (examples && examples.length > 0) {
        systemPrompt += `

VI DU TRA LOI:

${examples
  .slice(0, 2)
  .map(
    (ex, i) => `Vi du ${i + 1}:
TRUOC: ${ex.before}
SAU: ${ex.after}
`
  )
  .join('\n')}`;
      }
    }

    systemPrompt += `

Dinh dang cau tra loi:
- Ngan gon, suc tich (600-1000 tu)
- Chia doan ro rang
- Liet ke buoc neu la thu tuc
- Dua vi du minh hoa neu can
- Trich dan dieu luat cu the neu co

Luu y: Noi dung tham khao, khong thay the tu van phap ly chinh thuc.`;

    systemPrompt += `

⚠️ YEU CAU QUAN TRONG (SESSION 3 OPTIMIZATION):
- Toi thieu 600 tu (khoang 2000 ky tu)
- BAT BUOC co du 4 phan: I → II → III → IV
- Viet xong moi dung, KHONG dung giua chung
- Phan III (THU TUC) phai chi tiet tung buoc cu the
- Phan IV (KET LUAN) la BAN BUOC, khong duoc bo qua

⚠️ YEU CAU NGHIEM NGAT VE DO DAI VA TRICH DAN:
- TOI DA: 800 tu (tuong duong 2500-3000 ky tu)
- KHONG duoc trich dan nguyen van dieu luat dai dong
- Chi ghi: "Dieu X: [tom tat noi dung chinh <20 tu]"
- Vi du TOT: "Dieu 464 BLDS 2015: Hop dong vay co the lap bang loi noi hoac hanh vi cu the"
- Vi du XAU: "Dieu 464. Hinh thuc hop dong vay tai san: Hop dong vay tai san co the duoc lap thanh van ban, bang loi noi hoac bang hanh vi cu the. Truong hop luat co quy dinh..."

CAU TRUC BAT BUOC (AI phai tuan thu format nay):
---
# I. CAN CU PHAP LY
[Tom tat cac dieu luat]

# II. NOI DUNG TU VAN VA GIAI QUYET
[Phan tich chi tiet]

# III. TRINH TU THU TUC THUC HIEN (Bat buoc chi tiet)
1. Buoc 1: ...
2. Buoc 2: ...
3. Buoc 3: ...

# IV. KET LUAN VA LOI KHUYEN
[Loi khuyen ngan gon]
---
Luu y: KHONG DUOC phep dung lai cho den khi viet xong phan IV.`;

    if (sessionContext) {
      systemPrompt += `\n\nNGU CANH PHIEN TRUOC (tom tat cau tra loi truoc, chi dung neu lien quan):\n${sessionContext}\n`;
    }

    const fullPrompt = `${systemPrompt}

CAU HOI: ${question.trim()}

Bat dau viet ngay (co du 4 phan I→II→III→IV):`;

    const cacheKey = sessionContext || '';
    const useCache = true;

    // SESSION 5: Check cache first
    if (useCache) {
      const cachedAnswer = getAnswerFromCache(question.trim(), cacheKey);
      if (cachedAnswer) {
        console.log('[qa] Cache HIT - returning cached answer', {
          qLen: question.trim().length,
          answerLength: cachedAnswer.length,
        });

        const summary = buildSessionSummary(cachedAnswer);
        await saveSessionContext(supabase, sessionId, summary);

        return buildSuccessResponse(sessionId, {
          success: true,
          answer: cachedAnswer,
          question: question.trim(),
          fromCache: true,
          styleGuide: styleGuide
            ? {
                id: styleGuide.id,
                name: styleGuide.name,
              }
            : null,
        });
      }
    }

    console.log('[qa] Cache MISS - generating new answer', {
      qLen: question.trim().length,
      styleGuideId: styleGuideId || null,
      useDbPrompt: !!activePrompt,
      model: 'gemini-2.5-flash',
      maxTokens: 2400, // SESSION 7: Balanced for complex questions
    });

    const start = Date.now();
    const answer = await callAIText(fullPrompt, {
      temperature: 0.2,
      maxOutputTokens: 2400, // SESSION 7: Increased to 2400 (~900 words) for complex questions
    });
    const duration = Date.now() - start;

    console.log('[qa] completed', {
      ms: duration,
      answerLength: answer?.length || 0,
    });

    if (!answer) {
      return NextResponse.json(
        { error: 'Không tạo được câu trả lời. Vui lòng thử lại.' },
        { status: 500 }
      );
    }

    // SESSION 7: VALIDATOR - Check structure and word count
    const wordCount = answer.split(/\s+/).filter(w => w.length > 0).length;
    const hasSectionI = /# I\.|# I\s|^I\./m.test(answer);
    const hasSectionII = /# II\.|# II\s|^II\./m.test(answer);
    const hasSectionIII = /# III\.|# III\s|^III\./m.test(answer);
    const hasSectionIV = /# IV\.|# IV\s|^IV\./m.test(answer);
    const hasAllSections = hasSectionI && hasSectionII && hasSectionIII && hasSectionIV;

    if (wordCount > 900 || !hasAllSections) {
      console.warn('[qa] Answer INVALID - reprompting', {
        wordCount,
        hasAllSections,
        sections: { I: hasSectionI, II: hasSectionII, III: hasSectionIII, IV: hasSectionIV }
      });

      // Reprompt with stricter instructions
      const reprompt = `Ban vua tra loi qua dai hoac thieu cau truc. Hay TOM TAT lai voi yeu cau:

1. TOI DA 800 tu
2. Co du 4 muc: I. CAN CU PHAP LY → II. NOI DUNG TU VAN → III. THU TUC → IV. KET LUAN
3. Muc I: CHI liet ke ten dieu luat + tom tat <20 tu/dieu
4. Muc III: CHI 3-5 buoc chu yeu, moi buoc <50 tu
5. Muc IV: Ket luan + 1-2 loi khuyen chinh

Cau tra loi truoc (qua dai):
"""
${answer}
"""

Tom tat lai (du 4 muc, ≤800 tu):`;

      const shortenedAnswer = await callAIText(reprompt, {
        temperature: 0.2,
        maxOutputTokens: 2400, // SESSION 7: Match main generation limit
      });

      if (shortenedAnswer) {
        const newWordCount = shortenedAnswer.split(/\s+/).filter(w => w.length > 0).length;
        const hasNewSectionI = /# I\.|# I\s|^I\./m.test(shortenedAnswer);
        const hasNewSectionII = /# II\.|# II\s|^II\./m.test(shortenedAnswer);
        const hasNewSectionIII = /# III\.|# III\s|^III\./m.test(shortenedAnswer);
        const hasNewSectionIV = /# IV\.|# IV\s|^IV\./m.test(shortenedAnswer);
        const hasNewAllSections = hasNewSectionI && hasNewSectionII && hasNewSectionIII && hasNewSectionIV;

        // Only use reprompt result if it's BETTER than original
        if (hasNewAllSections && newWordCount >= 300) {
          console.log('[qa] Reprompt successful', {
            originalWords: wordCount,
            newWords: newWordCount
          });
          const finalAnswer = shortenedAnswer.trim();
          if (useCache) {
            saveAnswerToCache(question.trim(), finalAnswer, cacheKey);
            console.log('[qa] Answer saved to cache');
          }
          const summary = buildSessionSummary(finalAnswer);
          await saveSessionContext(supabase, sessionId, summary);
          return buildSuccessResponse(sessionId, {
            success: true,
            answer: finalAnswer,
            question: question.trim(),
            fromCache: false,
            styleGuide: styleGuide
              ? {
                  id: styleGuide.id,
                  name: styleGuide.name,
                }
              : null,
          });
        } else {
          console.warn('[qa] Reprompt FAILED - using original answer', {
            originalWords: wordCount,
            newWords: newWordCount,
            hasNewAllSections
          });
        }
      }
    }

    // SESSION 5: Save to cache (use original answer if reprompt failed)
    const finalAnswer = answer.trim();
    if (useCache) {
      saveAnswerToCache(question.trim(), finalAnswer, cacheKey);
      console.log('[qa] Answer saved to cache');
    }

    const summary = buildSessionSummary(finalAnswer);
    await saveSessionContext(supabase, sessionId, summary);

    return buildSuccessResponse(sessionId, {
      success: true,
      answer: finalAnswer,
      question: question.trim(),
      fromCache: false,
      styleGuide: styleGuide
        ? {
            id: styleGuide.id,
            name: styleGuide.name,
          }
        : null,
    });
  } catch (error: any) {
    console.error('Q&A API Error:', error);

    const errorText = `${error?.message || ''} ${error?.cause?.message || ''}`.toLowerCase();
    const errorStatus = error?.status || error?.code || error?.cause?.status;

    let userMessage = '\u0110\u00e3 x\u1ea3y ra l\u1ed7i khi x\u1eed l\u00fd c\u00e2u h\u1ecfi. Vui l\u00f2ng th\u1eed l\u1ea1i sau.';

    if (errorText.includes('reported as leaked')) {
      userMessage = '\u0110\u00e3 ph\u00e1t hi\u1ec7n API key b\u1ecb r\u00f2 r\u1ec9. Vui l\u00f2ng thay key m\u1edbi trong .env.';
    } else if (
      errorStatus === 429 ||
      errorText.includes('quota') ||
      errorText.includes('exceeded') ||
      errorText.includes('rate limit') ||
      errorText.includes('billing')
    ) {
      userMessage = '\u0110ang h\u1ebft quota ho\u1eb7c v\u01b0\u1ee3t gi\u1edbi h\u1ea1n. Vui l\u00f2ng ch\u1edd reset quota ho\u1eb7c thay key.';
    } else if (errorStatus === 503 || errorText.includes('overloaded')) {
      userMessage = '\u004d\u00e1y ch\u1ee7 AI \u0111ang qu\u00e1 t\u1ea3i, vui l\u00f2ng th\u1eed l\u1ea1i sau.';
    } else if (errorStatus === 429 || errorText.includes('rate limit')) {
      userMessage = '\u0042\u1ea1n \u0111ang g\u1eedi qu\u00e1 nhi\u1ec1u y\u00eau c\u1ea7u, vui l\u00f2ng th\u1eed l\u1ea1i sau \u00edt ph\u00fat.';
    } else if (errorStatus === 401 || errorText.includes('api key')) {
      userMessage = '\u004c\u1ed7i x\u00e1c th\u1ef1c h\u1ec7 th\u1ed1ng. Vui l\u00f2ng li\u00ean h\u1ec7 qu\u1ea3n tr\u1ecb vi\u00ean.';
    } else if (errorText.includes('network') || errorText.includes('fetch')) {
      userMessage = '\u004c\u1ed7i k\u1ebft n\u1ed1i m\u1ea1ng. Ki\u1ec3m tra internet v\u00e0 th\u1eed l\u1ea1i.';
    } else if (errorText.includes('timeout')) {
      userMessage = '\u0043\u00e2u h\u1ecfi ph\u1ee9c t\u1ea1p, h\u1ec7 th\u1ed1ng c\u1ea7n th\u00eam th\u1eddi gian. Th\u1eed c\u00e2u h\u1ecfi ng\u1eafn h\u01a1n.';
    }

    return NextResponse.json(
      {
        error: userMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
