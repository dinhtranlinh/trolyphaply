import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/admin/apps/[id]
 * Get single app by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('apps')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    return NextResponse.json({ app: data });
  } catch (error) {
    console.error('Error in GET /api/admin/apps/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/apps/[id]
 * Update app
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      slug,
      name,
      description,
      category,
      status,
      type,
      inputSchema,
      promptTemplate,
      outputSchema,
      renderConfig,
      shareConfig,
      limits,
    } = body;

    // Validation
    if (!slug || !name || !type || !inputSchema || !promptTemplate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check slug uniqueness (exclude current app)
    const { data: existing } = await supabase
      .from('apps')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('apps')
      .update({
        slug,
        name,
        description: description || null,
        category: category || 'other',
        status: status || 'draft',
        type,
        input_schema: inputSchema,
        prompt_template: promptTemplate,
        output_schema: outputSchema || null,
        render_config: renderConfig || null,
        share_config: shareConfig || null,
        limits: limits || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating app:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ app: data, success: true });
  } catch (error) {
    console.error('Error in PUT /api/admin/apps/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/apps/[id]
 * Delete app
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from('apps')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting app:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'App deleted' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/apps/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
