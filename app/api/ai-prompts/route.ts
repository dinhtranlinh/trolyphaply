import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseKey = supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = 'force-dynamic';

/**
 * GET /api/ai-prompts
 * Lấy danh sách AI Prompts với filter
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const creatorCode = searchParams.get('creatorCode') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at'; // created_at | likes_count | views_count
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('ai_image_prompts')
      .select('*', { count: 'exact' })
      .eq('is_public', true);

    // Filter by search
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,prompt_template.ilike.%${search}%`);
    }

    // Filter by category
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Filter by creator code
    if (creatorCode) {
      query = query.eq('creator_code', creatorCode);
    }

    // Sort
    if (sortBy === 'likes_count') {
      query = query.order('likes_count', { ascending: false });
    } else if (sortBy === 'views_count') {
      query = query.order('views_count', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch prompts', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      prompts: data || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai-prompts
 * Tạo mới AI Prompt
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      prompt_template,
      example_image_url,
      creator_code,
      tags,
      category,
    } = body;

    // Validation - only title, prompt_template, category required
    if (!title || !prompt_template || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: title, prompt_template, category' },
        { status: 400 }
      );
    }

    // No uniqueness check - allow multiple prompts from same creator_code
    // creator_code can be NULL for anonymous users

    // Insert new prompt
    const { data, error } = await supabase
      .from('ai_image_prompts')
      .insert([
        {
          title,
          description,
          prompt_template,
          example_image_url,
          creator_code,
          tags: tags || [],
          category,
          is_public: true,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create prompt', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      prompt: data,
      message: 'Prompt created successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
