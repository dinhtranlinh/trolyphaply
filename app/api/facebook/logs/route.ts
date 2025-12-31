/**
 * Logs API - List Logs
 * GET /api/facebook/logs - List automation logs with filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * GET /api/facebook/logs
 * List logs with filtering and pagination
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pageId = searchParams.get('page_id');
    const actionType = searchParams.get('action_type');
    const status = searchParams.get('status');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let query = supabase
      .from('automation_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (pageId) {
      query = query.eq('page_id', pageId);
    }

    if (actionType) {
      query = query.eq('action_type', actionType);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('❌ Failed to get logs:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to get logs',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      logs: data || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error: any) {
    console.error('❌ Failed to get logs:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get logs',
      },
      { status: 500 }
    );
  }
}
