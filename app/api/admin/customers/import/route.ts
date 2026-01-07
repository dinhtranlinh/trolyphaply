import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { requireAdminCustomersAccess } from '@/lib/adminCustomersSecurity';
import { buildPhoneRecord, normalizePhone } from '@/lib/phoneSecurity';

const chunkArray = <T,>(items: T[], size: number) => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

const MAX_IMPORT_LINES = 2000;
const MAX_IN_CLAUSE = 50;

/**
 * POST /api/admin/customers/import
 * Import customers from TXT (name|phone), skip duplicates
 */
export async function POST(request: NextRequest) {
  try {
    const guardResponse = requireAdminCustomersAccess(request);
    if (guardResponse) return guardResponse;

    const supabase = createClient();
    const body = await request.json();
    const content = typeof body?.content === 'string' ? body.content : '';
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

    if (!content.trim()) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    const lines = content.split(/\r?\n/);
    const nonEmptyLineCount = lines.filter((line: string) => line.trim()).length;
    if (nonEmptyLineCount > MAX_IMPORT_LINES) {
      return NextResponse.json(
        { success: false, error: `Max ${MAX_IMPORT_LINES} lines allowed` },
        { status: 400 }
      );
    }
    const errors: string[] = [];
    let skipped = 0;

    const seenPhones = new Set<string>();
    const toInsert: {
      name: string;
      phone: string | null;
      phone_hash: string;
      phone_encrypted: string;
      phone_last4: string;
      raw_phone: string;
    }[] = [];

    lines.forEach((raw: string, index: number) => {
      const line = raw.trim();
      if (!line) return;

      const parts = line.split('|');
      if (parts.length < 2) {
        errors.push(`Line ${index + 1}: Invalid format`);
        return;
      }

      const name = (parts[0] || '').trim();
      const phone = (parts.slice(1).join('|') || '').trim();

      if (!name || !phone) {
        errors.push(`Line ${index + 1}: Missing name or phone`);
        return;
      }

      const normalized = normalizePhone(phone);
      if (!normalized) {
        errors.push(`Line ${index + 1}: Invalid phone`);
        return;
      }

      const record = buildPhoneRecord(normalized);
      const phoneHash = record.phoneHash;
      if (seenPhones.has(phoneHash)) {
        skipped += 1;
        return;
      }

      seenPhones.add(phoneHash);
      toInsert.push({
        name,
        phone: null,
        phone_hash: phoneHash,
        phone_encrypted: record.phoneEncrypted,
        phone_last4: record.phoneLast4,
        raw_phone: phone
      });
    });

    if (toInsert.length === 0) {
      return NextResponse.json({
        success: true,
        results: { imported: 0, skipped, errors }
      });
    }

    const phoneHashList = toInsert.map((row) => row.phone_hash);
    const rawPhoneList = toInsert.map((row) => row.raw_phone);

    const existingPhones = new Set<string>();
    const existingRawPhones = new Set<string>();

    const hashChunks = chunkArray(phoneHashList, MAX_IN_CLAUSE);
    for (const chunk of hashChunks) {
      if (chunk.length === 0) continue;
      const { data: existingHashes, error: existingError } = await supabase
        .from('customers')
        .select('phone_hash')
        .in('phone_hash', chunk);
      if (existingError) throw existingError;
      (existingHashes || []).forEach((row) => {
        if (row.phone_hash) existingPhones.add(row.phone_hash);
      });
    }

    const phoneChunks = chunkArray(rawPhoneList, MAX_IN_CLAUSE);
    for (const chunk of phoneChunks) {
      if (chunk.length === 0) continue;
      const { data: existingLegacy, error: legacyError } = await supabase
        .from('customers')
        .select('phone')
        .in('phone', chunk);
      if (legacyError) throw legacyError;
      (existingLegacy || []).forEach((row) => {
        if (row.phone) existingRawPhones.add(row.phone);
      });
    }
    const newRows = toInsert.filter(
      (row) => !existingPhones.has(row.phone_hash) && !existingRawPhones.has(row.raw_phone)
    );
    skipped += toInsert.length - newRows.length;

    if (newRows.length === 0) {
      return NextResponse.json({
        success: true,
        results: { imported: 0, skipped, errors }
      });
    }

    const insertedRows: { id: string }[] = [];
    const insertRows = newRows.map(({ raw_phone, ...row }) => row);
    const chunks = chunkArray(insertRows, 500);

    for (const chunk of chunks) {
      const { data, error } = await supabase
        .from('customers')
        .insert(chunk)
        .select('id');
      if (error) throw error;
      insertedRows.push(...(data || []));
    }

    if (tagIds.length > 0 && insertedRows.length > 0) {
      const linkRows = insertedRows.flatMap((row) =>
        tagIds.map((tagId: string) => ({
          customer_id: row.id,
          tag_id: tagId
        }))
      );
      const linkChunks = chunkArray(linkRows, 1000);
      for (const chunk of linkChunks) {
        const { error } = await supabase
          .from('customer_tag_links')
          .insert(chunk);
        if (error) throw error;
      }
    }

    return NextResponse.json({
      success: true,
      results: {
        imported: insertedRows.length,
        skipped,
        errors
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
