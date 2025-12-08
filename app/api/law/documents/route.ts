import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/law/documents
 * List legal documents with search and filters
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const categories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('legal_documents')
      .select('id, title, doc_number, category, type, tags, issue_date, effective_date, summary', { count: 'exact' })
      .order('issue_date', { ascending: false });

    // Enhanced full-text search by title, doc_number, summary, and tags
    if (search) {
      query = query.or(`title.ilike.%${search}%,doc_number.ilike.%${search}%,summary.ilike.%${search}%,tags.cs.{${search}}`);
    }

    // Filter by categories
    if (categories.length > 0) {
      query = query.in('category', categories);
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch documents', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      documents: data || [],
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
