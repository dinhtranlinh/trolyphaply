import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseKey = supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = 'force-dynamic';

/**
 * GET /api/ai-prompts/[id]
 * Lấy chi tiết 1 AI Prompt
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('ai_image_prompts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Get prompt error:', error);
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Get prompt error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get prompt' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/ai-prompts/[id]
 * Cập nhật AI Prompt
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      prompt_template,
      example_image_url,
      creator_code,
      tags,
      category,
      is_public,
    } = body;

    // Validation
    if (!title || !prompt_template || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: title, prompt_template, category' },
        { status: 400 }
      );
    }

    // Update prompt
    const { data, error } = await supabase
      .from('ai_image_prompts')
      .update({
        title,
        description,
        prompt_template,
        example_image_url,
        creator_code: creator_code || null,
        tags: tags || [],
        category,
        is_public: is_public !== undefined ? is_public : true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update prompt error:', error);
      return NextResponse.json(
        { error: 'Failed to update prompt' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Update prompt error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update prompt' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ai-prompts/[id]
 * Xóa AI Prompt
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get prompt to check if it has an image
    const { data: prompt } = await supabase
      .from('ai_image_prompts')
      .select('example_image_url')
      .eq('id', id)
      .single();

    // Delete prompt from database
    const { error } = await supabase
      .from('ai_image_prompts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete prompt error:', error);
      return NextResponse.json(
        { error: 'Failed to delete prompt' },
        { status: 500 }
      );
    }

    // TODO: Delete image from storage if exists
    // if (prompt?.example_image_url) {
    //   await deleteImage(prompt.example_image_url);
    // }

    return NextResponse.json({ success: true, message: 'Prompt deleted successfully' });
  } catch (error: any) {
    console.error('Delete prompt error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete prompt' },
      { status: 500 }
    );
  }
}
