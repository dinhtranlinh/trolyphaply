import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * POST /api/admin/qa-prompts/[id]/activate
 * Activate a specific prompt (deactivate all others)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();
    
    // Deactivate all prompts
    await supabase
      .from('qa_prompts')
      .update({ is_active: false })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // all rows
    
    // Activate this prompt
    const { data: prompt, error } = await supabase
      .from('qa_prompts')
      .update({ 
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({ 
      success: true, 
      data: prompt 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
