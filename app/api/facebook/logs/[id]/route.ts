/**
 * Logs API - Single Log
 * GET /api/facebook/logs/[id] - Get log details
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * GET /api/facebook/logs/[id]
 * Get single log details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('automation_logs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            error: 'Log not found',
          },
          { status: 404 }
        );
      }
      console.error('❌ Failed to get log:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to get log',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      log: data,
    });
  } catch (error: any) {
    console.error('❌ Failed to get log:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get log',
      },
      { status: 500 }
    );
  }
}
