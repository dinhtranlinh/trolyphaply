import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/admin/apps
 * List all mini-apps with filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';

    let query = supabase
      .from('apps')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
    }

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching apps:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ apps: data || [] });
  } catch (error) {
    console.error('Error in GET /api/admin/apps:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/apps
 * Create new mini-app
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      slug,
      name,
      description,
      category = 'other',
      status = 'draft',
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

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from('apps')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('apps')
      .insert({
        slug,
        name,
        description: description || null,
        category,
        status,
        type,
        input_schema: inputSchema,
        prompt_template: promptTemplate,
        output_schema: outputSchema || null,
        render_config: renderConfig || null,
        share_config: shareConfig || null,
        limits: limits || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating app:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ app: data, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/apps:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
