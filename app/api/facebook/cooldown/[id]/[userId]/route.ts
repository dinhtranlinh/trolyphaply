/**
 * Cooldown API - Clear User Cooldown
 * DELETE /api/facebook/cooldown/[id]/[userId] - Clear cooldown for user
 */

import { NextRequest, NextResponse } from 'next/server';
import { clearUserCooldown } from '@/lib/facebook/cooldownService';

/**
 * DELETE /api/facebook/cooldown/[id]/[userId]
 * Clear cooldown for a specific user
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id: pageId, userId } = await params;

    await clearUserCooldown(pageId, userId);

    return NextResponse.json({
      success: true,
      message: `✅ Cooldown cleared for user ${userId}`,
      pageId,
      userId,
    });
  } catch (error: any) {
    console.error('❌ Failed to clear cooldown:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to clear cooldown',
      },
      { status: 500 }
    );
  }
}
