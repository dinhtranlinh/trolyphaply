import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * GET /api/admin/legal-writing-styles/[id]
 * Get a single legal writing style
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();
    
    const { data: style, error } = await supabase
      .from('legal_writing_styles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({ 
      success: true, 
      data: style 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/legal-writing-styles/[id]
 * Update a legal writing style
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();
    const body = await request.json();
    
    const { 
      name, 
      description, 
      example_content,
      tone,
      characteristics,
      is_active 
    } = body;
    
    const { data: style, error } = await supabase
      .from('legal_writing_styles')
      .update({
        name,
        description,
        example_content,
        tone,
        characteristics,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({ 
      success: true, 
      data: style 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/legal-writing-styles/[id]
 * Delete a legal writing style
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();
    
    // Check if style is used in any prompts
    const { count } = await supabase
      .from('qa_prompt_writing_styles')
      .select('*', { count: 'exact', head: true })
      .eq('style_id', id);
    
    if (count && count > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete style: it is used in ${count} prompt(s)` 
        },
        { status: 400 }
      );
    }
    
    const { error } = await supabase
      .from('legal_writing_styles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Style deleted successfully' 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
