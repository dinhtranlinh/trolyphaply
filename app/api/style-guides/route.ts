import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * GET /api/style-guides
 * Public API to get list of style guides (without examples)
 * For user selection in Q&A interface
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Fetch style guides with basic info
    const { data: styleGuides, error } = await supabase
      .from('style_guides')
      .select('id, name, description, is_default')
      .order('is_default', { ascending: false })
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: styleGuides || [],
    });
  } catch (error) {
    console.error('Error fetching style guides:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch style guides',
      },
      { status: 500 }
    );
  }
}
