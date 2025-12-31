/**
 * Message Rules API - Single Rule Operations
 * GET    /api/facebook/message-rules/[id] - Get rule details
 * PATCH  /api/facebook/message-rules/[id] - Update rule
 * DELETE /api/facebook/message-rules/[id] - Delete rule
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getMessageRuleById,
  updateMessageRule,
  deleteMessageRule,
  type UpdateMessageRuleInput,
} from '@/lib/facebook/messageRulesService';

/**
 * GET /api/facebook/message-rules/[id]
 * Get rule details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const rule = await getMessageRuleById(id);

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
    console.error('❌ Failed to get message rule:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get message rule',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/facebook/message-rules/[id]
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
    const existingRule = await getMessageRuleById(id);
    if (!existingRule) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rule not found',
        },
        { status: 404 }
      );
    }

    // Update rule
    const input: UpdateMessageRuleInput = {};
    if (body.name !== undefined) input.name = body.name;
    if (body.trigger_on !== undefined) input.trigger_on = body.trigger_on;
    if (body.message_template !== undefined)
      input.message_template = body.message_template;
    if (body.cooldown_minutes !== undefined)
      input.cooldown_minutes = body.cooldown_minutes;
    if (body.enabled !== undefined) input.enabled = body.enabled;
    if (body.enabled !== undefined) input.enabled = body.enabled;

    const rule = await updateMessageRule(id, input);

    return NextResponse.json({
      success: true,
      message: '✅ Message rule updated successfully',
      rule,
    });
  } catch (error: any) {
    console.error('❌ Failed to update message rule:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update message rule',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/facebook/message-rules/[id]
 * Delete rule
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if rule exists
    const existingRule = await getMessageRuleById(id);
    if (!existingRule) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rule not found',
        },
        { status: 404 }
      );
    }

    await deleteMessageRule(id);

    return NextResponse.json({
      success: true,
      message: '✅ Message rule deleted successfully',
    });
  } catch (error: any) {
    console.error('❌ Failed to delete message rule:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete message rule',
      },
      { status: 500 }
    );
  }
}
