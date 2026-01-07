import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { buildPhoneRecord, normalizePhone } from '../lib/phoneSecurity';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase env vars.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

const main = async () => {
  const { data, error } = await supabase
    .from('customers')
    .select('id, phone, phone_encrypted')
    .is('phone_encrypted', null)
    .not('phone', 'is', null);

  if (error) {
    console.error('Failed to load customers:', error.message);
    process.exit(1);
  }

  const rows = data || [];
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const phone = String(row.phone || '').trim();
    const normalized = normalizePhone(phone);
    if (!normalized) {
      skipped += 1;
      continue;
    }

    const record = buildPhoneRecord(normalized);
    const { error: updateError } = await supabase
      .from('customers')
      .update({
        phone: null,
        phone_encrypted: record.phoneEncrypted,
        phone_hash: record.phoneHash,
        phone_last4: record.phoneLast4
      })
      .eq('id', row.id);

    if (updateError) {
      console.error(`Failed to update customer ${row.id}:`, updateError.message);
      continue;
    }

    updated += 1;
  }

  console.log(`Backfill complete. Updated: ${updated}, Skipped: ${skipped}`);
};

main().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
