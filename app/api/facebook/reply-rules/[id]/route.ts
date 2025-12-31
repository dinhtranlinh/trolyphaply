/**
 * Reply Rules API - Single Rule Operations
 * GET    /api/facebook/reply-rules/[id] - Get rule details
 * PATCH  /api/facebook/reply-rules/[id] - Update rule
 * DELETE /api/facebook/reply-rules/[id] - Delete rule
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getReplyRuleById,
  updateReplyRule,
  deleteReplyRule,
  type UpdateReplyRuleInput,
} from '@/lib/facebook/replyRulesService';
import { validateReplyRule } from '@/lib/facebook/validation';

/**
 * GET /api/facebook/reply-rules/[id]
 * Get rule details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const rule = await getReplyRuleById(id);

    if (!rule) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rule not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      rule,
    });
  } catch (error: any) {
    console.error('❌ Failed to get reply rule:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get reply rule',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/facebook/reply-rules/[id]
 * Update rule
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Check if rule exists
    const existingRule = await getReplyRuleById(id);
    if (!existingRule) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rule not found',
        },
        { status: 404 }
      );
    }

    // Validate if template or keywords are being updated
    if (body.template || body.keywords || body.trigger_type || body.trigger_type) {
      const ruleToValidate = {
        name: body.name || existingRule.name,
        trigger_type: body.trigger_type || body.trigger_type || existingRule.trigger_type,
        keywords: body.keywords !== undefined ? body.keywords : existingRule.keywords,
        exclude_keywords:
          body.exclude_keywords !== undefined
            ? body.exclude_keywords
            : existingRule.exclude_keywords,
        message_template: body.template || (existingRule.reply_templates && existingRule.reply_templates[0]) || '',
        priority: body.priority !== undefined ? body.priority : existingRule.priority,
      };

      const validationResult = validateReplyRule(ruleToValidate);

      if (!validationResult.valid) {
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
    }

    // Update rule
    const input: UpdateReplyRuleInput = {};
    if (body.name !== undefined) input.name = body.name;
    if (body.post_id !== undefined) input.post_id = body.post_id;
    if (body.trigger_type !== undefined || body.trigger_type !== undefined) {
      input.trigger_type = (body.trigger_type || body.trigger_type) as 'all' | 'keyword';
    }
    if (body.keywords !== undefined) input.keywords = body.keywords;
    if (body.exclude_keywords !== undefined) input.exclude_keywords = body.exclude_keywords;
    if (body.template !== undefined) input.reply_templates = [body.template];
    if (body.priority !== undefined) input.priority = body.priority;
    if (body.enabled !== undefined) input.enabled = body.enabled;
    if (body.enabled !== undefined) input.enabled = body.enabled;

    const rule = await updateReplyRule(id, input);

    return NextResponse.json({
      success: true,
      message: '✅ Reply rule updated successfully',
      rule,
    });
  } catch (error: any) {
    console.error('❌ Failed to update reply rule:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update reply rule',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/facebook/reply-rules/[id]
 * Delete rule
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if rule exists
    const existingRule = await getReplyRuleById(id);
    if (!existingRule) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rule not found',
        },
        { status: 404 }
      );
    }

    await deleteReplyRule(id);

    return NextResponse.json({
      success: true,
      message: '✅ Reply rule deleted successfully',
    });
  } catch (error: any) {
    console.error('❌ Failed to delete reply rule:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete reply rule',
      },
      { status: 500 }
    );
  }
}
