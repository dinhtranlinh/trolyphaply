import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/admin/procedures
 * List all procedures with filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || 'active';
    let query = supabase
      .from('procedures')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching procedures:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ procedures: data || [] });
  } catch (error) {
    console.error('Error in GET /api/admin/procedures:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/procedures
 * Create new procedure
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      authority,
      timeEst,
      category,
      steps,
      documents,
      fees,
      notes,
      tags,
      status = 'active',
    } = body;

    // Validation
    if (!title || !authority || !timeEst || !category || !steps) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('procedures')
      .insert({
        title,
        authority,
        time_est: timeEst,
        category,
        steps: steps || [],
        documents: documents || [],
        fees: fees || null,
        notes: notes || null,
        tags: tags || [],
        status,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating procedure:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ procedure: data, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/procedures:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
