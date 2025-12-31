/**
 * Events API - List Events
 * GET /api/facebook/events - List recent webhook events
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * GET /api/facebook/events
 * List recent events with filtering
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pageId = searchParams.get('page_id');
    const eventType = searchParams.get('event_type');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let query = supabase
      .from('facebook_events')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (pageId) {
      query = query.eq('page_id', pageId);
    }

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('❌ Failed to get events:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to get events',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      events: data || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error: any) {
    console.error('❌ Failed to get events:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get events',
      },
      { status: 500 }
    );
  }
}
