import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/apps/[slug]
 * Get single app by slug with full config
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'App slug is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('apps')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Supabase error:', error);

      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'App not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: false, error: 'Failed to fetch app', details: error.message },
        { status: 500 }
      );
    }

    // Check if app is published (status = active)
    if (data.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'App is not published', isNotPublished: true },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      app: data,
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
