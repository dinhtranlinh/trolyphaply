import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * PATCH /api/admin/customer-tags/[id]
 * Update a customer tag
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();
    const body = await request.json();
    const name = (body?.name || '').trim();

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Tag name is required' },
        { status: 400 }
      );
    }

    const { data: tag, error } = await supabase
      .from('customer_tags')
      .update({
        name,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: tag });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/customer-tags/[id]
 * Delete a customer tag
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();

    const { error } = await supabase
      .from('customer_tags')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
