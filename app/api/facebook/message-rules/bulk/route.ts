/**
 * Message Rules API - Bulk Operations
 * POST /api/facebook/message-rules/bulk - Bulk enable/disable rules
 */

import { NextRequest, NextResponse } from 'next/server';
import { bulkUpdateRules } from '@/lib/facebook/messageRulesService';

/**
 * POST /api/facebook/message-rules/bulk
 * Bulk update multiple rules at once
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ruleIds, isActive } = body;

    // Validate input
    if (!Array.isArray(ruleIds) || ruleIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'ruleIds must be a non-empty array',
        },
        { status: 400 }
      );
    }

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          error: 'isActive must be a boolean',
        },
        { status: 400 }
      );
    }

    // Bulk update
    const count = await bulkUpdateRules(ruleIds, isActive);

    return NextResponse.json({
      success: true,
      message: `✅ Updated ${count} rule(s)`,
      updated: count,
      isActive,
    });
  } catch (error: any) {
    console.error('❌ Failed to bulk update rules:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to bulk update rules',
      },
      { status: 500 }
    );
  }
}
