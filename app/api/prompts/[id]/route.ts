import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/prompts/[id]
 * Get single prompt by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Prompt ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);

      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Prompt not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: false, error: 'Failed to fetch prompt', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      prompt: data,
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/prompts/[id]
 * Update prompt by ID
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, body: promptBody, category, tags, isPublic } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Prompt ID is required' },
        { status: 400 }
      );
    }

    // Build update object
    const updates: any = {};
    if (title !== undefined) {
      if (title.length > 200) {
        return NextResponse.json(
          { success: false, error: 'Title must be 200 characters or less' },
          { status: 400 }
        );
      }
      updates.title = title;
    }
    if (promptBody !== undefined) {
      if (promptBody.length > 5000) {
        return NextResponse.json(
          { success: false, error: 'Prompt body must be 5000 characters or less' },
          { status: 400 }
        );
      }
      updates.body = promptBody;
    }
    if (category !== undefined) updates.category = category;
    if (tags !== undefined) updates.tags = tags;
    if (isPublic !== undefined) updates.is_public = isPublic;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('prompts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);

      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Prompt not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: false, error: 'Failed to update prompt', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      prompt: data,
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/prompts/[id]
 * Delete prompt by ID
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Prompt ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete prompt', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Prompt deleted successfully',
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
