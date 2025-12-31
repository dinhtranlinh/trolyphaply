/**
 * Events API - Statistics
 * GET /api/facebook/events/stats - Get event statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * GET /api/facebook/events/stats
 * Get event statistics
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pageId = searchParams.get('page_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let query = supabase.from('facebook_events').select('event_type, status');

    if (pageId) {
      query = query.eq('page_id', pageId);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Failed to get event stats:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to get event stats',
        },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        success: true,
        stats: {
          total: 0,
          byType: {},
          byStatus: {
            pending: 0,
            processed: 0,
            failed: 0,
          },
        },
      });
    }

    // Group by event type
    const byType = data.reduce((acc: any, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {});

    // Group by status
    const byStatus = data.reduce(
      (acc: any, event) => {
        acc[event.status] = (acc[event.status] || 0) + 1;
        return acc;
      },
      { pending: 0, processed: 0, failed: 0 }
    );

    return NextResponse.json({
      success: true,
      stats: {
        total: data.length,
        byType,
        byStatus,
      },
    });
  } catch (error: any) {
    console.error('❌ Failed to get event stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get event stats',
      },
      { status: 500 }
    );
  }
}
