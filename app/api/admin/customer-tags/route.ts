import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { requireAdminCustomersAccess } from '@/lib/adminCustomersSecurity';

/**
 * GET /api/admin/customer-tags
 * Get all customer tags
 */
export async function GET(request: NextRequest) {
  try {
    const guardResponse = requireAdminCustomersAccess(request);
    if (guardResponse) return guardResponse;

    const supabase = createClient();
    const { data: tags, error } = await supabase
      .from('customer_tags')
      .select('*')
      .order('name');

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: tags || []
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/customer-tags
 * Create a new customer tag
 */
export async function POST(request: NextRequest) {
  try {
    const guardResponse = requireAdminCustomersAccess(request);
    if (guardResponse) return guardResponse;

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
      .insert({ name })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { success: true, data: tag },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
