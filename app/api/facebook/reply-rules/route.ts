/**
 * Reply Rules API - List and Create
 * GET  /api/facebook/reply-rules - List all rules
 * POST /api/facebook/reply-rules - Create new rule
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAllReplyRules,
  createReplyRule,
  getReplyRulesStats,
  type CreateReplyRuleInput,
} from '@/lib/facebook/replyRulesService';
import { validateReplyRule } from '@/lib/facebook/validation';

/**
 * GET /api/facebook/reply-rules
 * List all reply rules (with optional filters)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pageId = searchParams.get('page_id');
    const isActiveParam = searchParams.get('active');

    const filters: any = {};

    if (pageId) {
      filters.page_id = pageId;
    }

    if (isActiveParam !== null) {
      filters.enabled = isActiveParam === 'true';
    }

    const rules = await getAllReplyRules(filters);
    const stats = await getReplyRulesStats(pageId || undefined);

    return NextResponse.json({
      success: true,
      rules,
      stats,
    });
  } catch (error: any) {
    console.error('❌ Failed to get reply rules:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get reply rules',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/facebook/reply-rules
 * Create a new reply rule
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[Reply Rules API] POST body:', JSON.stringify(body, null, 2));

    // Validate input
    const validationInput = {
      ...body,
      message_template: body.message_template ?? body.template ?? '',
    };
    const validationResult = validateReplyRule(validationInput);
    console.log('[Reply Rules API] Validation result:', validationResult);

    if (!validationResult.valid) {
      console.error('[Reply Rules API] Validation failed:', validationResult.errors);
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          validationErrors: validationResult.errors,
          validationWarnings: validationResult.warnings,
        },
        { status: 400 }
      );
    }

    // Create rule
    const input: CreateReplyRuleInput = {
      page_id: body.page_id,
      name: body.name,
      trigger_type: (body.trigger_type || body.trigger_type || 'all') as 'all' | 'keyword',
      keywords: body.keywords,
      exclude_keywords: body.exclude_keywords,
      reply_templates: [body.template],
      priority: body.priority,
      enabled: body.enabled ?? body.enabled ?? true, // Support both names
    };

    const rule = await createReplyRule(input);

    return NextResponse.json(
      {
        success: true,
        message: '✅ Reply rule created successfully',
        rule,
        validationWarnings: validationResult.warnings,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ Failed to create reply rule:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create reply rule',
      },
      { status: 500 }
    );
  }
}
