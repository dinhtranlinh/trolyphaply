import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { callGeminiText } from '@/lib/gemini';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * POST /api/run/[slug]
 * Execute a mini-app with user inputs
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const { inputs } = body;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'App slug is required' },
        { status: 400 }
      );
    }

    if (!inputs || typeof inputs !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Inputs object is required' },
        { status: 400 }
      );
    }

    // Fetch app config
    const { data: app, error: appError } = await supabase
      .from('apps')
      .select('*')
      .eq('slug', slug)
      .single();

    if (appError || !app) {
      console.error('App fetch error:', appError);
      return NextResponse.json(
        { success: false, error: 'App not found' },
        { status: 404 }
      );
    }

    if (!app.published) {
      return NextResponse.json(
        { success: false, error: 'App is not published' },
        { status: 403 }
      );
    }

    // Validate inputs against schema
    const schema = app.input_schema as any;
    if (schema && schema.fields) {
      for (const field of schema.fields) {
        if (field.required && !inputs[field.id]) {
          return NextResponse.json(
            { success: false, error: `Field "${field.label}" is required` },
            { status: 400 }
          );
        }
      }
    }

    // Build prompt by replacing placeholders
    let finalPrompt = app.prompt_template;
    for (const [key, value] of Object.entries(inputs)) {
      const placeholder = `{{${key}}}`;
      finalPrompt = finalPrompt.replace(new RegExp(placeholder, 'g'), String(value));
    }

    // Call Gemini AI
    const aiResponse = await callGeminiText(finalPrompt, {
      temperature: app.temperature || 0.9,
      maxOutputTokens: app.max_tokens || 2048,
    });

    // Save result to database
    const { data: result, error: resultError } = await supabase
      .from('results')
      .insert({
        app_id: app.id,
        inputs,
        output_text: aiResponse,
        output_image_url: null, // Text-only for now
      })
      .select()
      .single();

    if (resultError) {
      console.error('Result save error:', resultError);
      // Return result anyway, just log the error
    }

    // Update app stats (fire and forget)
    try {
      await supabase.rpc('increment_app_stats', {
        p_app_id: app.id,
        p_stat_date: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      console.error('Stats update error:', err);
    }

    return NextResponse.json({
      success: true,
      result: {
        id: result?.id || null,
        text: aiResponse,
        imageUrl: null,
      },
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
