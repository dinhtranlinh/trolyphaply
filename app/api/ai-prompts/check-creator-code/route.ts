import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseKey = supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = 'force-dynamic';

/**
 * GET /api/ai-prompts/check-creator-code?code=xxx
 * Kiểm tra creator code đã tồn tại chưa
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Creator code is required' },
        { status: 400 }
      );
    }

    // Validate format
    const validFormat = /^[a-zA-Z0-9_]+$/.test(code);
    if (!validFormat) {
      return NextResponse.json({
        available: false,
        message: 'Mã chỉ được chứa chữ, số và dấu gạch dưới',
      });
    }

    if (code.length < 3 || code.length > 30) {
      return NextResponse.json({
        available: false,
        message: 'Mã phải từ 3-30 ký tự',
      });
    }

    // Check if exists
    const { data, error } = await supabase
      .from('ai_image_prompts')
      .select('id')
      .eq('creator_code', code)
      .maybeSingle();

    if (error) {
      console.error('Check creator code error:', error);
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      );
    }

    const available = !data;

    // Generate suggestions if not available
    let suggestions: string[] = [];
    if (!available) {
      suggestions = [
        `${code}_${Math.floor(Math.random() * 100)}`,
        `${code}_${Math.floor(Math.random() * 1000)}`,
        `${code}_pro`,
      ];
    }

    return NextResponse.json({
      available,
      message: available 
        ? 'Mã này có thể sử dụng' 
        : 'Mã đã được sử dụng, hãy thử mã khác',
      suggestions: available ? [] : suggestions,
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
