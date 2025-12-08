import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/admin/procedures/[id]
 * Get single procedure by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('procedures')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Procedure not found' }, { status: 404 });
    }

    return NextResponse.json({ procedure: data });
  } catch (error) {
    console.error('Error in GET /api/admin/procedures/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/procedures/[id]
 * Update procedure
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      status,
    } = body;

    // Validation
    if (!title || !authority || !timeEst || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('procedures')
      .update({
        title,
        authority,
        time_est: timeEst,
        category,
        steps: steps || [],
        documents: documents || [],
        fees: fees || null,
        notes: notes || null,
        tags: tags || [],
        status: status || 'active',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating procedure:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ procedure: data, success: true });
  } catch (error) {
    console.error('Error in PUT /api/admin/procedures/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/procedures/[id]
 * Delete procedure
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from('procedures')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting procedure:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Procedure deleted' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/procedures/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
