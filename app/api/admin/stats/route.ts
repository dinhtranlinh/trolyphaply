import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const today = new Date();
    const start30 = new Date();
    start30.setDate(today.getDate() - 29);

    const start30Str = start30.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('app_stats_daily')
      .select('app_id,date,views,submits,shares,affiliate_clicks')
      .gte('date', start30Str)
      .order('date', { ascending: true });

    if (error) {
      console.error('Stats fetch error:', error);
      return NextResponse.json(
        { error: 'Không lấy được số liệu thống kê' },
        { status: 500 }
      );
    }

    const rows = data || [];

    const summary = rows.reduce(
      (acc, row) => ({
        views: acc.views + (row.views || 0),
        submits: acc.submits + (row.submits || 0),
        shares: acc.shares + (row.shares || 0),
        affiliate_clicks: acc.affiliate_clicks + (row.affiliate_clicks || 0),
      }),
      { views: 0, submits: 0, shares: 0, affiliate_clicks: 0 }
    );

    // Build daily series last 14 days for quick chart
    const start14 = new Date();
    start14.setDate(today.getDate() - 13);
    const start14Str = start14.toISOString().split('T')[0];

    const daily = rows
      .filter((row) => row.date >= start14Str)
      .map((row) => ({
        date: row.date,
        views: row.views || 0,
        submits: row.submits || 0,
        shares: row.shares || 0,
        affiliate_clicks: row.affiliate_clicks || 0,
      }));

    return NextResponse.json({
      summary,
      daily,
      range: {
        from: start30Str,
        to: today.toISOString().split('T')[0],
      },
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: 'Có lỗi khi lấy thống kê' },
      { status: 500 }
    );
  }
}
