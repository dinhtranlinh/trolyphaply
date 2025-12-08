import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/prompts
 * List prompts with optional search and category filter
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const isPublic = searchParams.get('public');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('prompts')
      .select('id, title, body, category, tags, is_public, created_at, updated_at', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Search by title or body
    if (search) {
      query = query.or(`title.ilike.%${search}%,body.ilike.%${search}%`);
    }

    // Filter by category
    if (category) {
      query = query.eq('category', category);
    }

    // Filter by public/private
    if (isPublic !== null && isPublic !== undefined) {
      query = query.eq('is_public', isPublic === 'true');
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch prompts', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      prompts: data || [],
      total: count || 0,
      limit,
      offset,
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
 * POST /api/prompts
 * Create a new prompt
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, body: promptBody, category, tags, isPublic } = body;

    // Validation
    if (!title || !promptBody) {
      return NextResponse.json(
        { success: false, error: 'Title and body are required' },
        { status: 400 }
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        { success: false, error: 'Title must be 200 characters or less' },
        { status: 400 }
      );
    }

    if (promptBody.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Prompt body must be 5000 characters or less' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('prompts')
      .insert({
        title,
        body: promptBody,
        category: category || 'Khác',
        tags: tags || [],
        is_public: isPublic !== undefined ? isPublic : true,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create prompt', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      prompt: data,
    }, { status: 201 });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
