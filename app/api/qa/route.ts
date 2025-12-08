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

    // Build system prompt with style guide
    let systemPrompt = `Bạn là một trợ lý pháp lý AI chuyên nghiệp của Việt Nam. Nhiệm vụ của bạn là:

1. Trả lời các câu hỏi về pháp luật và thủ tục hành chính Việt Nam
2. Cung cấp thông tin chính xác, dễ hiểu, có cấu trúc rõ ràng
3. Trích dẫn điều luật, văn bản pháp luật khi có thể
4. Lưu ý người dùng tham khảo ý kiến chuyên gia cho các vấn đề phức tạp
5. Sử dụng ngôn ngữ thân thiện, dễ hiểu với người dân`;

    // Add style guide instructions if available
    if (styleGuide) {
      systemPrompt += `

VĂN PHONG TRẢ LỜI: ${styleGuide.name}
${styleGuide.description}

ĐẶC ĐIỂM VĂN PHONG:
${Array.isArray(styleGuide.characteristics) ? styleGuide.characteristics.map((c, i) => `${i + 1}. ${c}`).join('\n') : styleGuide.characteristics}

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

    // Gọi Gemini API
    const answer = await callGeminiText(fullPrompt);

    if (!answer) {
      return NextResponse.json(
        { error: 'Không thể tạo câu trả lời. Vui lòng thử lại.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      answer: answer.trim(),
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

    return NextResponse.json(
      {
        error: 'Đã xảy ra lỗi khi xử lý câu hỏi. Vui lòng thử lại sau.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
