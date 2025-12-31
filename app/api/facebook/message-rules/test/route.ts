/**
 * Message Rules API - Test Endpoint
 * POST /api/facebook/message-rules/test - Test message rule with cooldown check
 */

import { NextRequest, NextResponse } from 'next/server';
import { getActiveRulesForPage, findMatchingRule } from '@/lib/facebook/messageRulesService';
import { checkUserCooldown } from '@/lib/facebook/cooldownService';

/**
 * POST /api/facebook/message-rules/test
 * Test how an event would trigger message rules
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pageId, userId, eventType } = body;

    if (!pageId || typeof pageId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'pageId is required and must be a string',
        },
        { status: 400 }
      );
    }

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'userId is required and must be a string',
        },
        { status: 400 }
      );
    }

    if (!eventType || !['comment', 'reaction', 'both'].includes(eventType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'eventType must be "comment", "reaction", or "both"',
        },
        { status: 400 }
      );
    }

    // Get active rules for page
    const rules = await getActiveRulesForPage(pageId);

    if (rules.length === 0) {
      return NextResponse.json({
        success: true,
        pageId,
        userId,
        eventType,
        rulesCount: 0,
        match: null,
        message: 'No active rules found for this page',
      });
    }

    // Test matching
    const testEvent = {
      type: eventType as 'comment' | 'reaction',
      user_id: userId,
      user_name: 'Test User',
      post_id: 'test-post-id',
    };

    const matchResult = await findMatchingRule(pageId, testEvent);

    if (!matchResult) {
      return NextResponse.json({
        success: true,
        pageId,
        userId,
        eventType,
        rulesCount: rules.length,
        match: null,
        message: 'No matching rules found for this event type',
      });
    }

    // Get cooldown info
    const cooldownCheck = await checkUserCooldown(
      pageId,
      userId,
      matchResult.rule.cooldown_minutes
    );

    return NextResponse.json({
      success: true,
      pageId,
      userId,
      eventType,
      rulesCount: rules.length,
      match: {
        rule_id: matchResult.rule.id,
        ruleName: matchResult.rule.name,
        triggerOn: matchResult.rule.trigger_on,
        cooldownMinutes: matchResult.rule.cooldown_minutes,
        canSend: matchResult.canSend,
        reason: matchResult.reason,
        cooldown: {
          lastMessageAt: cooldownCheck.lastMessageAt,
          cooldownEndsAt: cooldownCheck.cooldownEndsAt,
          remainingMinutes: cooldownCheck.remainingMinutes,
        },
      },
    });
  } catch (error: any) {
    console.error('❌ Failed to test message rule:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to test message rule',
      },
      { status: 500 }
    );
  }
}
