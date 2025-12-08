import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/law/procedures
 * List administrative procedures with search and filters
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const categories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
    const difficulty = searchParams.get('difficulty') || '';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('procedures')
      .select('id, title, category, time_est, authority, tags, notes', { count: 'exact' })
      .order('title', { ascending: true });

    // Enhanced search by title, authority, notes, and tags
    if (search) {
      query = query.or(`title.ilike.%${search}%,authority.ilike.%${search}%,notes.ilike.%${search}%,tags.cs.{${search}}`);
    }

    // Filter by categories
    if (categories.length > 0) {
      query = query.in('category', categories);
    }

    // Note: difficulty field removed from schema, skip this filter

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch procedures', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      procedures: data || [],
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
