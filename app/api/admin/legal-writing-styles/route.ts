import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * GET /api/admin/legal-writing-styles
 * Get all legal writing styles
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    const { data: styles, error } = await supabase
      .from('legal_writing_styles')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    return NextResponse.json({ 
      success: true, 
      data: styles 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/legal-writing-styles
 * Create a new legal writing style
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    const { 
      name, 
      description, 
      example_content,
      tone,
      characteristics 
    } = body;
    
    if (!name || !description) {
      return NextResponse.json(
        { success: false, error: 'Name and description are required' },
        { status: 400 }
      );
    }
    
    const { data: style, error } = await supabase
      .from('legal_writing_styles')
      .insert({
        name,
        description,
        example_content,
        tone,
        characteristics
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({ 
      success: true, 
      data: style 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
