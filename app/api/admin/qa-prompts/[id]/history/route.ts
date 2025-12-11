import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * GET /api/admin/qa-prompts/[id]/history
 * Get version history for a prompt
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();
    
    const { data: history, error } = await supabase
      .from('qa_prompt_history')
      .select('*')
      .eq('prompt_id', id)
      .order('version', { ascending: false });
    
    if (error) throw error;
    
    return NextResponse.json({ 
      success: true, 
      data: history 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
