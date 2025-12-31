import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

const chunkArray = <T,>(items: T[], size: number) => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

/**
 * POST /api/admin/customers/import
 * Import customers from TXT (name|phone), skip duplicates
 */
export async function POST(request: NextRequest) {
  try {
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
    const errors: string[] = [];
    let skipped = 0;

    const seenPhones = new Set<string>();
    const toInsert: { name: string; phone: string }[] = [];

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

      if (seenPhones.has(phone)) {
        skipped += 1;
        return;
      }

      seenPhones.add(phone);
      toInsert.push({ name, phone });
    });

    if (toInsert.length === 0) {
      return NextResponse.json({
        success: true,
        results: { imported: 0, skipped, errors }
      });
    }

    const phoneList = toInsert.map((row) => row.phone);
    const { data: existing, error: existingError } = await supabase
      .from('customers')
      .select('phone')
      .in('phone', phoneList);

    if (existingError) throw existingError;

    const existingPhones = new Set((existing || []).map((row) => row.phone));
    const newRows = toInsert.filter((row) => !existingPhones.has(row.phone));
    skipped += toInsert.length - newRows.length;

    if (newRows.length === 0) {
      return NextResponse.json({
        success: true,
        results: { imported: 0, skipped, errors }
      });
    }

    const insertedRows: { id: string; phone: string }[] = [];
    const chunks = chunkArray(newRows, 500);

    for (const chunk of chunks) {
      const { data, error } = await supabase
        .from('customers')
        .insert(chunk)
        .select('id, phone');
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
