import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/admin/apps/[id]/clone
 * Clone (duplicate) an app with a new slug
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { newSlug } = body;

    if (!newSlug) {
      return NextResponse.json(
        { error: 'New slug is required' },
        { status: 400 }
      );
    }

    // Get original app
    const { data: originalApp, error: fetchError } = await supabase
      .from('apps')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !originalApp) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    // Check if new slug already exists
    const { data: existing } = await supabase
      .from('apps')
      .select('id')
      .eq('slug', newSlug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      );
    }

    // Create cloned app
    const { data: clonedApp, error: createError } = await supabase
      .from('apps')
      .insert({
        slug: newSlug,
        name: `${originalApp.name} (Copy)`,
        description: originalApp.description,
        category: originalApp.category,
        status: 'draft', // Cloned apps start as draft
        type: originalApp.type,
        input_schema: originalApp.input_schema,
        prompt_template: originalApp.prompt_template,
        output_schema: originalApp.output_schema,
        render_config: originalApp.render_config,
        share_config: originalApp.share_config,
        limits: originalApp.limits,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error cloning app:', createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    return NextResponse.json({ app: clonedApp, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/apps/[id]/clone:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
