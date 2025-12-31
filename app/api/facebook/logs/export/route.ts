/**
 * Logs API - Export to CSV
 * GET /api/facebook/logs/export - Export logs as CSV
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Convert logs to CSV format
 */
function logsToCSV(logs: any[]): string {
  if (logs.length === 0) {
    return 'No data';
  }

  // CSV header
  const headers = [
    'ID',
    'Page ID',
    'Rule ID',
    'Action Type',
    'Status',
    'Target User ID',
    'Post ID',
    'Comment ID',
    'Response Text',
    'Error Message',
    'Created At',
  ];

  const csvRows = [headers.join(',')];

  // CSV data rows
  logs.forEach((log) => {
    const row = [
      log.id || '',
      log.page_id || '',
      log.rule_id || '',
      log.action_type || '',
      log.status || '',
      log.target_id || '',
      log.post_id || '',
      log.comment_id || '',
      log.content_sent ? `"${log.content_sent.replace(/"/g, '""')}"` : '',
      log.error_message ? `"${log.error_message.replace(/"/g, '""')}"` : '',
      log.created_at || '',
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}

/**
 * GET /api/facebook/logs/export
 * Export logs as CSV file
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pageId = searchParams.get('page_id');
    const actionType = searchParams.get('action_type');
    const status = searchParams.get('status');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '1000', 10);

    let query = supabase
      .from('automation_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

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

    const { data, error } = await query;

    if (error) {
      console.error('❌ Failed to export logs:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to export logs',
        },
        { status: 500 }
      );
    }

    const csv = logsToCSV(data || []);
    const filename = `facebook-logs-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('❌ Failed to export logs:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to export logs',
      },
      { status: 500 }
    );
  }
}
