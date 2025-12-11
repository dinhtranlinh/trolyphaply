import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * GET /api/admin/qa-prompts/active
 * Get the currently active prompt with writing styles
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    const { data: prompt, error } = await supabase
      .from('qa_prompts')
      .select(`
        *,
        writing_styles:qa_prompt_writing_styles(
          priority,
          style:legal_writing_styles(*)
        )
      `)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    
    return NextResponse.json({ 
      success: true, 
      data: prompt || null 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
