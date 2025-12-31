/**
 * Reply Rules API - Preview Endpoint
 * POST /api/facebook/reply-rules/preview - Preview spun content variations
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateVariations } from '@/lib/facebook/spinContent';
import { validateTemplate } from '@/lib/facebook/validation';

/**
 * POST /api/facebook/reply-rules/preview
 * Generate preview variations from template
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { template, count = 10, placeholders = {} } = body;

    if (!template || typeof template !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Template is required and must be a string',
        },
        { status: 400 }
      );
    }

    // Validate template
    const validationResult = validateTemplate(template, {
      minLength: 10,
      maxLength: 2000,
      minVariations: 5,
      requireSpinSyntax: true,
    });

    if (!validationResult.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Template validation failed',
          validationErrors: validationResult.errors,
          validationWarnings: validationResult.warnings,
        },
        { status: 400 }
      );
    }

    // Generate variations
    const variations = generateVariations(template, placeholders, count);
    const uniqueVariations = [...new Set(variations)];

    return NextResponse.json({
      success: true,
      template,
      variations: uniqueVariations,
      count: uniqueVariations.length,
      requested: count,
      uniqueness: ((uniqueVariations.length / count) * 100).toFixed(1) + '%',
      validationWarnings: validationResult.warnings,
    });
  } catch (error: any) {
    console.error('❌ Failed to preview template:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to preview template',
      },
      { status: 500 }
    );
  }
}
