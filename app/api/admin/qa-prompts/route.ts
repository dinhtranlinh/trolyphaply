import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * GET /api/admin/qa-prompts
 * Get all Q&A prompts with writing styles
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    const { data: prompts, error } = await supabase
      .from('qa_prompts')
      .select(`
        *,
        writing_styles:qa_prompt_writing_styles(
          priority,
          style:legal_writing_styles(*)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return NextResponse.json({ 
      success: true, 
      data: prompts 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/qa-prompts
 * Create a new Q&A prompt
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    const { 
      name, 
      prompt_text, 
      description, 
      writing_style_ids = [],
      is_active = false 
    } = body;
    
    // Validate required fields
    if (!name || !prompt_text) {
      return NextResponse.json(
        { success: false, error: 'Name and prompt_text are required' },
        { status: 400 }
      );
    }
    
    // If setting as active, deactivate all other prompts
    if (is_active) {
      await supabase
        .from('qa_prompts')
        .update({ is_active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // dummy id
    }
    
    // Create prompt
    const { data: prompt, error: promptError } = await supabase
      .from('qa_prompts')
      .insert({
        name,
        prompt_text,
        description,
        is_active,
        version: 1
      })
      .select()
      .single();
    
    if (promptError) throw promptError;
    
    // Link writing styles
    if (writing_style_ids.length > 0) {
      const styleLinks = writing_style_ids.map((styleId: string, index: number) => ({
        prompt_id: prompt.id,
        style_id: styleId,
        priority: index + 1
      }));
      
      const { error: linkError } = await supabase
        .from('qa_prompt_writing_styles')
        .insert(styleLinks);
      
      if (linkError) throw linkError;
    }
    
    // Create history entry
    await supabase
      .from('qa_prompt_history')
      .insert({
        prompt_id: prompt.id,
        version: 1,
        prompt_text,
        changed_by: 'admin', // TODO: Get from auth
        change_description: 'Initial version'
      });
    
    return NextResponse.json({ 
      success: true, 
      data: prompt 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
