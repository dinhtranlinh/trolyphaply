import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

// GET /api/admin/style-guides - Get all style guides with examples
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Fetch style guides
    const { data: styleGuides, error: sgError } = await supabase
      .from('style_guides')
      .select('*')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true });

    if (sgError) {
      throw sgError;
    }

    // Fetch examples for all style guides
    const { data: examples, error: exError } = await supabase
      .from('style_guide_examples')
      .select('*')
      .order('created_at', { ascending: true });

    if (exError) {
      throw exError;
    }

    // Group examples by style_guide_id
    const result = (styleGuides || []).map(sg => ({
      ...sg,
      examples: (examples || []).filter(ex => ex.style_guide_id === sg.id),
    }));

    return NextResponse.json({
      success: true,
      data: result,
      total: result.length,
    });
  } catch (error) {
    console.error('Error fetching style guides:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch style guides',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/style-guides - Create a new style guide
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { name, description, characteristics, tone, language, isDefault, examples } = body;

    // Validate required fields
    if (!name || !description || !characteristics || !tone || !language) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, description, characteristics, tone, language',
        },
        { status: 400 }
      );
    }

    // If this is set as default, unset all other defaults
    if (isDefault) {
      await supabase
        .from('style_guides')
        .update({ is_default: false })
        .eq('is_default', true);
    }

    // Create style guide
    const { data: styleGuide, error: sgError } = await supabase
      .from('style_guides')
      .insert({
        name,
        description,
        characteristics,
        tone,
        language,
        is_default: isDefault || false,
      })
      .select()
      .single();

    if (sgError) {
      throw sgError;
    }

    // Create examples if provided
    let createdExamples: any[] = [];
    if (examples && examples.length > 0) {
      const { data: examplesData, error: exError } = await supabase
        .from('style_guide_examples')
        .insert(
          examples.map((ex: { question: string; answer: string }) => ({
            style_guide_id: styleGuide.id,
            question: ex.question,
            answer: ex.answer,
          }))
        )
        .select();

      if (exError) {
        throw exError;
      }
      createdExamples = examplesData || [];
    }

    return NextResponse.json({
      success: true,
      data: { ...styleGuide, examples: createdExamples },
      message: 'Style guide created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating style guide:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create style guide',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
