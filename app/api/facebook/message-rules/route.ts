/**
 * Message Rules API - List and Create
 * GET  /api/facebook/message-rules - List all rules
 * POST /api/facebook/message-rules - Create new rule
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAllMessageRules,
  createMessageRule,
  getMessageRulesStats,
  type CreateMessageRuleInput,
} from '@/lib/facebook/messageRulesService';
import { validateTemplate } from '@/lib/facebook/validation';

/**
 * Validate message rule input
 */
function validateMessageRule(input: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate name
  if (!input.name || input.name.trim().length === 0) {
    errors.push('Rule name is required');
  } else if (input.name.trim().length < 3) {
    errors.push('Rule name must be at least 3 characters');
  } else if (input.name.length > 100) {
    errors.push('Rule name must be less than 100 characters');
  }

  // Validate trigger_on (should be array of 'comment' and/or 'reaction')
  if (!input.trigger_on || !Array.isArray(input.trigger_on) || input.trigger_on.length === 0) {
    errors.push('trigger_on must be an array with at least one trigger type');
  } else {
    const validTriggers = ['comment', 'reaction'];
    const invalidTriggers = input.trigger_on.filter((t: string) => !validTriggers.includes(t));
    if (invalidTriggers.length > 0) {
      errors.push(`Invalid trigger types: ${invalidTriggers.join(', ')}`);
    }
  }

  // Validate message_template (relaxed validation for message rules)
  if (!input.message_template || input.message_template.trim().length < 10) {
    errors.push('Message template must be at least 10 characters');
  } else if (input.message_template.length > 1000) {
    errors.push('Message template must be less than 1000 characters');
  }

  // Validate cooldown_minutes
  if (input.cooldown_minutes !== undefined) {
    if (
      !Number.isInteger(input.cooldown_minutes) ||
      input.cooldown_minutes < 1
    ) {
      errors.push('cooldown_minutes must be a positive integer');
    } else if (input.cooldown_minutes > 10080) {
      // 7 days max
      errors.push('cooldown_minutes must be less than 10080 (7 days)');
    }
  }

  // max_daily_uses field removed in Dec 2025 schema update
  // No validation needed

  return { valid: errors.length === 0, errors };
}

/**
 * GET /api/facebook/message-rules
 * List all message rules (with optional filters)
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

    const rules = await getAllMessageRules(filters);
    const stats = await getMessageRulesStats(pageId || undefined);

    return NextResponse.json({
      success: true,
      rules,
      stats,
    });
  } catch (error: any) {
    console.error('❌ Failed to get message rules:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get message rules',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/facebook/message-rules
 * Create a new message rule
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validationResult = validateMessageRule(body);

    if (!validationResult.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          validationErrors: validationResult.errors,
        },
        { status: 400 }
      );
    }

    // Create rule
    const input: CreateMessageRuleInput = {
      page_id: body.page_id,
      name: body.name,
      trigger_on: body.trigger_on,
      message_template: body.message_template,
      cooldown_minutes: body.cooldown_minutes,
      enabled: body.enabled ?? body.enabled ?? true,
    };

    const rule = await createMessageRule(input);

    return NextResponse.json(
      {
        success: true,
        message: '✅ Message rule created successfully',
        rule,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ Failed to create message rule:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create message rule',
      },
      { status: 500 }
    );
  }
}
