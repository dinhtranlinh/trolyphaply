import { NextRequest, NextResponse } from 'next/server';
import { callGeminiText } from '@/lib/gemini';
import { createClient } from '@/lib/supabase';

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

    // Fetch style guide from database
    let styleGuide: any = null;
    let examples: any[] = [];

    if (styleGuideId) {
      // Use specified style guide
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

      // Fetch examples for this style guide
      const { data: examplesData } = await supabase
        .from('style_guide_examples')
        .select('*')
        .eq('style_guide_id', styleGuideId);

      examples = examplesData || [];
    } else {
      // Use default style guide
      const { data: guide } = await supabase
        .from('style_guides')
        .select('*')
        .eq('is_default', true)
        .single();

      if (guide) {
        styleGuide = guide;

        // Fetch examples for default style guide
        const { data: examplesData } = await supabase
          .from('style_guide_examples')
          .select('*')
          .eq('style_guide_id', guide.id);

        examples = examplesData || [];
      }
    }

    // Build system prompt - use active prompt from DB or fallback to hard-coded
    let systemPrompt = '';
    
    if (activePrompt && activePrompt.prompt_text) {
      // Use prompt from database
      systemPrompt = activePrompt.prompt_text;
      
      // Append writing styles if configured
      if (activePrompt.writing_styles && activePrompt.writing_styles.length > 0) {
        systemPrompt += `\n\nCÁC VĂN PHONG TRẢ LỜI (ưu tiên theo thứ tự):\n`;
        
        activePrompt.writing_styles
          .sort((a: any, b: any) => a.priority - b.priority)
          .forEach((ws: any, index: number) => {
            const style = ws.style;
            systemPrompt += `\n${index + 1}. ${style.name}\n   ${style.description}\n   Ví dụ: ${style.example_content}\n`;
          });
      }
    } else {
      // Fallback to hard-coded prompt
      systemPrompt = `Bạn là một trợ lý pháp lý AI chuyên nghiệp của Việt Nam. Nhiệm vụ của bạn là:\n\n1. Trả lời các câu hỏi về pháp luật và thủ tục hành chính Việt Nam\n2. Cung cấp thông tin chính xác, dễ hiểu, có cấu trúc rõ ràng\n3. Trích dẫn điều luật, văn bản pháp luật khi có thể\n4. Lưu ý người dùng tham khảo ý kiến chuyên gia cho các vấn đề phức tạp\n5. Sử dụng ngôn ngữ thân thiện, dễ hiểu với người dân`;
    }

    // Add style guide instructions if available
    if (styleGuide) {
      systemPrompt += `

VĂN PHONG TRẢ LỜI: ${styleGuide.name}
${styleGuide.description}

ĐẶC ĐIỂM VĂN PHONG:
${Array.isArray(styleGuide.characteristics) ? styleGuide.characteristics.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n') : styleGuide.characteristics}

GIỌNG ĐIỆU: ${Array.isArray(styleGuide.tone) ? styleGuide.tone.join(', ') : styleGuide.tone}`;

      // Add examples if available
      if (examples && examples.length > 0) {
        systemPrompt += `

VÍ DỤ CÁCH TRẢ LỜI:

${examples
  .slice(0, 2) // Only use first 2 examples to keep prompt reasonable
  .map(
    (ex, i) => `Ví dụ ${i + 1}:
TRƯỚC: ${ex.before}
SAU: ${ex.after}
`
  )
  .join('\n')}`;
      }
    }

    systemPrompt += `

Định dạng câu trả lời:
- Ngắn gọn, súc tích (200-300 từ)
- Chia thành các đoạn rõ ràng
- Liệt kê các bước nếu là thủ tục
- Đưa ra ví dụ minh họa nếu cần

LƯU Ý: Đây chỉ là thông tin tham khảo, không thay thế tư vấn pháp lý chính thức.`;

    // Tạo full prompt
    const fullPrompt = `${systemPrompt}

CÂU HỎI: ${question.trim()}

Hãy trả lời câu hỏi trên một cách chuyên nghiệp và dễ hiểu.`;

    // Gọi Gemini API - sử dụng gemini-2.5-pro cho văn phong hành chính chuẩn mực
    const answer = await callGeminiText(fullPrompt, {
      model: 'gemini-2.5-pro',
      temperature: 0.3, // Giữ mức thấp để văn phong hành chính chuẩn xác, ít bịa đặt
    });

    if (!answer) {
      return NextResponse.json(
        { error: 'Không thể tạo câu trả lời. Vui lòng thử lại.' },
        { status: 500 }
      );
    }

    // Tạo nội dung chia sẻ Facebook với văn phong tự nhiên
    const sharePrompt = `Hãy viết lại câu hỏi và câu trả lời sau đây thành một bài đăng Facebook ngắn gọn, thu hút, dễ đọc:

CÂU HỎI: ${question.trim()}

CÂU TRẢ LỜI: ${answer.trim()}

YÊU CẦU:
- Văn phong tự nhiên, thân thiện như đang tư vấn cho bạn bè
- Sử dụng emoji phù hợp (💡 📌 ✅ ⚠️ 📋 🔍 💰 🏠 ⚖️ etc.)
- Ngắn gọn 200-300 từ
- Bỏ các phần disclaimer, lưu ý pháp lý
- Định dạng dễ đọc với bullet points hoặc đoạn ngắn
- Kết thúc bằng 1 câu call-to-action nhẹ nhàng

Chỉ trả về nội dung bài đăng, không cần giải thích.`;

    const shareText = await callGeminiText(sharePrompt, {
      temperature: 0.8,
      maxOutputTokens: 800,
    });

    return NextResponse.json({
      success: true,
      answer: answer.trim(),
      shareText: shareText.trim(),
      question: question.trim(),
      styleGuide: styleGuide
        ? {
            id: styleGuide.id,
            name: styleGuide.name,
          }
        : null,
    });
  } catch (error: any) {
    console.error('Q&A API Error:', error);

    // Determine user-friendly error message based on error type
    let userMessage = 'Đã xảy ra lỗi khi xử lý câu hỏi. Vui lòng thử lại sau.';
    
    if (error.status === 503 || error.message?.includes('overloaded')) {
      userMessage = '🎄 Hệ thống AI đang bận xử lý nhiều câu hỏi. Vui lòng thử lại sau 10-20 giây.';
    } else if (error.status === 429 || error.message?.includes('rate limit')) {
      userMessage = '⏰ Bạn đã hỏi quá nhiều câu hỏi trong thời gian ngắn. Vui lòng đợi 1 phút.';
    } else if (error.status === 401 || error.message?.includes('API key')) {
      userMessage = '🔑 Lỗi xác thực hệ thống. Vui lòng liên hệ quản trị viên.';
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      userMessage = '🌐 Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.';
    } else if (error.message?.includes('timeout')) {
      userMessage = '⏱️ Câu hỏi quá phức tạp, hệ thống cần nhiều thời gian hơn. Thử đặt câu hỏi ngắn gọn hơn.';
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
