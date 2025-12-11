import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * GET /api/admin/qa-prompts/[id]
 * Get a single Q&A prompt with details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();
    
    // Get prompt
    const { data: prompt, error: promptError } = await supabase
      .from('qa_prompts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (promptError) {
      console.error('Prompt error:', promptError);
      throw promptError;
    }
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }
    
    // Get associated writing styles with join
    const { data: styleLinks, error: stylesError } = await supabase
      .from('qa_prompt_writing_styles')
      .select('priority, style_id')
      .eq('prompt_id', id)
      .order('priority');
    
    if (stylesError) {
      console.error('Styles error:', stylesError);
    }
    
    // Get full style details
    const writing_styles = [];
    if (styleLinks && styleLinks.length > 0) {
      const styleIds = styleLinks.map(link => link.style_id);
      const { data: styles } = await supabase
        .from('legal_writing_styles')
        .select('id, name, description, tone')
        .in('id', styleIds);
      
      if (styles) {
        // Map styles with priority
        for (const link of styleLinks) {
          const style = styles.find(s => s.id === link.style_id);
          if (style) {
            writing_styles.push({
              ...style,
              priority: link.priority
            });
          }
        }
      }
    }
    
    return NextResponse.json({ 
      ...prompt,
      writing_styles
    });
  } catch (error: any) {
    console.error('GET prompt error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/qa-prompts/[id]
 * Update a Q&A prompt
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
      system_prompt, 
      formatting_instructions, 
      writing_style_ids,
      is_active 
    } = body;
    
    // Get current prompt for version check
    const { data: currentPrompt } = await supabase
      .from('qa_prompts')
      .select('version, system_prompt')
      .eq('id', id)
      .single();
    
    if (!currentPrompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }
    
    // If setting as active, deactivate all others
    if (is_active) {
      await supabase
        .from('qa_prompts')
        .update({ is_active: false })
        .neq('id', id);
    }
    
    // Update prompt
    const newVersion = system_prompt !== currentPrompt.system_prompt 
      ? (currentPrompt.version || 1) + 1 
      : (currentPrompt.version || 1);
    
    const { data: prompt, error: updateError } = await supabase
      .from('qa_prompts')
      .update({
        name,
        system_prompt,
        formatting_instructions,
        is_active,
        version: newVersion,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) throw updateError;
    
    // Update writing styles if provided
    if (writing_style_ids) {
      // Delete existing links
      await supabase
        .from('qa_prompt_writing_styles')
        .delete()
        .eq('prompt_id', id);
      
      // Insert new links
      if (writing_style_ids.length > 0) {
        const styleLinks = writing_style_ids.map((styleId: string, index: number) => ({
          prompt_id: id,
          style_id: styleId,
          priority: index + 1
        }));
        
        await supabase
          .from('qa_prompt_writing_styles')
          .insert(styleLinks);
      }
    }
    
    // Create history entry if system prompt changed
    if (system_prompt !== currentPrompt.system_prompt) {
      await supabase
        .from('qa_prompt_history')
        .insert({
          prompt_id: id,
          version: newVersion,
          system_prompt,
          formatting_instructions,
          changed_by: 'admin'
        });
    }
    
    return NextResponse.json(prompt);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/qa-prompts/[id]
 * Delete a Q&A prompt
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();
    
    // Check if active
    const { data: prompt } = await supabase
      .from('qa_prompts')
      .select('is_active')
      .eq('id', id)
      .single();
    
    if (prompt?.is_active) {
      return NextResponse.json(
        { error: 'Cannot delete active prompt' },
        { status: 400 }
      );
    }
    
    // Delete prompt (cascade will delete writing_styles links)
    const { error } = await supabase
      .from('qa_prompts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Prompt deleted successfully' 
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
