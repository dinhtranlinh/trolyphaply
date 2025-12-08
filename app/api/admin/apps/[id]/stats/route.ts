import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/admin/apps/[id]/stats
 * Get aggregated analytics for an app
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get app info
    const { data: app, error: appError } = await supabase
      .from('apps')
      .select('id, slug, name')
      .eq('id', id)
      .single();

    if (appError || !app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    // Get daily stats
    const { data: dailyStats, error: statsError } = await supabase
      .from('app_stats_daily')
      .select('*')
      .eq('app_id', id)
      .order('date', { ascending: false })
      .limit(30); // Last 30 days

    if (statsError) {
      console.error('Error fetching stats:', statsError);
      return NextResponse.json({ error: statsError.message }, { status: 500 });
    }

    // Calculate totals
    const totals = (dailyStats || []).reduce(
      (acc, day) => ({
        views: acc.views + (day.views || 0),
        submits: acc.submits + (day.submits || 0),
        shares: acc.shares + (day.shares || 0),
        affiliateClicks: acc.affiliateClicks + (day.affiliate_clicks || 0),
      }),
      { views: 0, submits: 0, shares: 0, affiliateClicks: 0 }
    );

    // Get total results count
    const { count: resultsCount } = await supabase
      .from('results')
      .select('*', { count: 'exact', head: true })
      .eq('app_id', id);

    return NextResponse.json({
      app,
      totals: {
        ...totals,
        results: resultsCount || 0,
      },
      dailyStats: dailyStats || [],
    });
  } catch (error) {
    console.error('Error in GET /api/admin/apps/[id]/stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
