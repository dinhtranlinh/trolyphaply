import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { requireAdminCustomersAccess } from '@/lib/adminCustomersSecurity';
import {
  buildPhoneRecord,
  decryptPhone,
  hashPhone,
  normalizePhone
} from '@/lib/phoneSecurity';

const buildCustomerResponse = (row: any) => {
  const links = Array.isArray(row.customer_tag_links) ? row.customer_tag_links : [];
  const tags = links
    .map((link: any) => link.customer_tags)
    .filter(Boolean)
    .map((tag: any) => ({ id: tag.id, name: tag.name }));

  let phone = row.phone || '';
  if (row.phone_encrypted) {
    try {
      phone = decryptPhone(row.phone_encrypted);
    } catch {
      phone = row.phone || '';
    }
  }

  return {
    id: row.id,
    name: row.name,
    phone,
    tags,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};

/**
 * GET /api/admin/customers
 * Get customers with optional search and tag filter
 */
export async function GET(request: NextRequest) {
  try {
    const guardResponse = requireAdminCustomersAccess(request);
    if (guardResponse) return guardResponse;

    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').trim();
    const tagParam = (searchParams.get('tag') || '').trim();
    const tagIds = tagParam ? tagParam.split(',').map((t) => t.trim()).filter(Boolean) : [];

    let filteredCustomerIds: string[] | null = null;
    if (tagIds.length > 0) {
      const { data: links, error: linkError } = await supabase
        .from('customer_tag_links')
        .select('customer_id')
        .in('tag_id', tagIds);

      if (linkError) throw linkError;

      const ids = (links || []).map((link) => link.customer_id);
      filteredCustomerIds = Array.from(new Set(ids));
      if (filteredCustomerIds.length === 0) {
        return NextResponse.json({ success: true, customers: [] });
      }
    }

    let query = supabase
      .from('customers')
      .select(`
        id,
        name,
        phone,
        phone_encrypted,
        phone_hash,
        phone_last4,
        created_at,
        updated_at,
        customer_tag_links (
          tag_id,
          customer_tags (
            id,
            name
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (filteredCustomerIds) {
      query = query.in('id', filteredCustomerIds);
    }

    if (search) {
      const orFilters = [`name.ilike.%${search}%`, `phone.ilike.%${search}%`];
      const normalizedSearch = normalizePhone(search);
      if (normalizedSearch.length >= 6) {
        orFilters.push(`phone_hash.eq.${hashPhone(normalizedSearch)}`);
      } else if (normalizedSearch.length > 0) {
        orFilters.push(`phone_last4.ilike.%${normalizedSearch}%`);
      }
      query = query.or(orFilters.join(','));
    }

    const { data: customers, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      success: true,
      customers: (customers || []).map(buildCustomerResponse)
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/customers
 * Create a new customer
 */
export async function POST(request: NextRequest) {
  try {
    const guardResponse = requireAdminCustomersAccess(request);
    if (guardResponse) return guardResponse;

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

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone' },
        { status: 400 }
      );
    }

    const { phoneEncrypted, phoneHash, phoneLast4 } = buildPhoneRecord(normalizedPhone);
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .or(`phone_hash.eq.${phoneHash},phone.eq.${phone}`)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Phone already exists' },
        { status: 409 }
      );
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .insert({
        name,
        phone: null,
        phone_encrypted: phoneEncrypted,
        phone_hash: phoneHash,
        phone_last4: phoneLast4
      })
      .select()
      .single();

    if (error) throw error;

    if (tagIds.length > 0) {
      const linkRows = tagIds.map((tagId: string) => ({
        customer_id: customer.id,
        tag_id: tagId
      }));
      const { error: linkError } = await supabase
        .from('customer_tag_links')
        .insert(linkRows);
      if (linkError) throw linkError;
    }

    const safeCustomer = {
      id: customer?.id,
      name: customer?.name,
      phone: customer?.phone_encrypted ? decryptPhone(customer.phone_encrypted) : '',
      created_at: customer?.created_at,
      updated_at: customer?.updated_at
    };

    return NextResponse.json({ success: true, data: safeCustomer }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
