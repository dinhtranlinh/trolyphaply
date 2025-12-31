/**
 * Logs API - Statistics
 * GET /api/facebook/logs/stats - Get automation statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getTodayStats,
  getDailyStats,
  getActionTypeStats,
  getPageStats,
  getSuccessRate,
  getHourlyDistribution,
  getSummaryStats,
} from '@/lib/facebook/statsService';

/**
 * GET /api/facebook/logs/stats
 * Get comprehensive automation statistics
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pageId = searchParams.get('page_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const type = searchParams.get('type'); // today, daily, action, page, hourly, summary

    // Get specific stat type or summary
    switch (type) {
      case 'today':
        const today = await getTodayStats(pageId || undefined);
        return NextResponse.json({ success: true, stats: today });

      case 'daily':
        const days = parseInt(searchParams.get('days') || '7', 10);
        const daily = await getDailyStats(days, pageId || undefined);
        return NextResponse.json({ success: true, stats: daily });

      case 'action':
        const actionStats = await getActionTypeStats(
          startDate || undefined,
          endDate || undefined,
          pageId || undefined
        );
        return NextResponse.json({ success: true, stats: actionStats });

      case 'page':
        const pageStats = await getPageStats(
          startDate || undefined,
          endDate || undefined
        );
        return NextResponse.json({ success: true, stats: pageStats });

      case 'hourly':
        const hourly = await getHourlyDistribution(
          startDate || undefined,
          endDate || undefined,
          pageId || undefined
        );
        return NextResponse.json({ success: true, stats: hourly });

      case 'success':
        const successRate = await getSuccessRate(
          startDate || undefined,
          endDate || undefined,
          pageId || undefined
        );
        return NextResponse.json({ success: true, stats: successRate });

      case 'summary':
      default:
        const summary = await getSummaryStats(pageId || undefined);
        return NextResponse.json({ success: true, stats: summary });
    }
  } catch (error: any) {
    console.error('❌ Failed to get stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get stats',
      },
      { status: 500 }
    );
  }
}
