import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * PATCH /api/admin/customers/[id]
 * Update customer info and tags
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
    const phone = (body?.phone || '').trim();
    const rawTagIds: unknown[] = Array.isArray(body?.tagIds)
      ? body.tagIds
      : [];
    const tagIds = Array.from(
      new Set(
        rawTagIds
          .map((value) => String(value).trim())
          .filter(Boolean)
      )
    );

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', phone)
      .neq('id', id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Phone already exists' },
        { status: 409 }
      );
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .update({
        name,
        phone,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const { error: deleteError } = await supabase
      .from('customer_tag_links')
      .delete()
      .eq('customer_id', id);
    if (deleteError) throw deleteError;

    if (tagIds.length > 0) {
      const linkRows = tagIds.map((tagId: string) => ({
        customer_id: id,
        tag_id: tagId
      }));
      const { error: linkError } = await supabase
        .from('customer_tag_links')
        .insert(linkRows);
      if (linkError) throw linkError;
    }

    return NextResponse.json({ success: true, data: customer });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/customers/[id]
 * Delete a customer
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();

    const { error } = await supabase
      .from('customers')
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
