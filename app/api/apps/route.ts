import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/apps
 * List all mini-apps
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || '';
    const published = searchParams.get('published');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('apps')
      .select('slug, name, description, category, status, input_schema, type, created_at', {
        count: 'exact',
      })
      .order('name', { ascending: true });

    // Filter by category
    if (category) {
      query = query.eq('category', category);
    }

    // Filter by published status (use status='active' instead)
    if (published !== null && published !== undefined) {
      if (published === 'true') {
        query = query.eq('status', 'active');
      }
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch apps', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      apps: data || [],
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
