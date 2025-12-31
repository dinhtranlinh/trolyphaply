/**
 * Cooldown API - Cooldown Management
 * GET    /api/facebook/cooldown/[id] - Get cooldown stats
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getCooldownStats,
} from '@/lib/facebook/cooldownService';

/**
 * GET /api/facebook/cooldown/[id]
 * Get cooldown statistics for a page
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pageId } = await params;
    const { searchParams } = new URL(req.url);
    const cooldownMinutes = parseInt(searchParams.get('cooldown') || '60', 10);

    const stats = await getCooldownStats(pageId, cooldownMinutes);

    return NextResponse.json({
      success: true,
      pageId,
      stats,
    });
  } catch (error: any) {
    console.error('❌ Failed to get cooldown stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get cooldown stats',
      },
      { status: 500 }
    );
  }
}
