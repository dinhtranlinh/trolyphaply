/**
 * Reply Rules API - Test Endpoint
 * POST /api/facebook/reply-rules/test - Test comment against rules
 */

import { NextRequest, NextResponse } from 'next/server';
import { getActiveRulesForPage } from '@/lib/facebook/replyRulesService';
import { testCommentAgainstRules } from '@/lib/facebook/ruleMatcher';

/**
 * POST /api/facebook/reply-rules/test
 * Test how a comment would match against rules
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pageId, commentText } = body;

    if (!pageId || typeof pageId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'pageId is required and must be a string',
        },
        { status: 400 }
      );
    }

    if (!commentText || typeof commentText !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'commentText is required and must be a string',
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
        commentText,
        rulesCount: 0,
        matches: [],
        topMatch: null,
        message: 'No active rules found for this page',
      });
    }

    // Test comment against rules
    const result = testCommentAgainstRules(commentText, rules);

    return NextResponse.json({
      success: true,
      pageId,
      commentText,
      rulesCount: rules.length,
      matches: result.matches.map((match) => ({
        rule_id: match.rule.id,
        ruleName: match.rule.name,
        priority: match.priority,
        matchType: match.matchType,
        templates: match.rule.reply_templates,
      })),
      topMatch: result.topMatch
        ? {
            rule_id: result.topMatch.id,
            ruleName: result.topMatch.name,
            priority: result.topMatch.priority,
            triggerType: result.topMatch.trigger_type,
            templates: result.topMatch.reply_templates,
          }
        : null,
    });
  } catch (error: any) {
    console.error('❌ Failed to test comment:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to test comment',
      },
      { status: 500 }
    );
  }
}
