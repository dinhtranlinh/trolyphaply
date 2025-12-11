/**
 * Test all Supabase API keys to find the correct one
 * Run: npx tsx scripts/test-supabase-keys.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://icqivkassoxfaukqbzyt.supabase.co';

// Keys to test - from both .env and .env.development
const keysToTest = {
  'ANON_KEY (sb_publishable)': 'sb_publishable_w7MTRQBbPLzywPcTuk9ZYQ_tbK-dpWO',
  'SERVICE_KEY (sb_secret)': 'sb_secret_TcqtTDn7-rb0AyhdI93zWA_QNofmkjR',
};

async function testKey(keyName: string, apiKey: string) {
  console.log(`\n🔍 Testing ${keyName}...`);
  console.log(`Key (first 20 chars): ${apiKey.substring(0, 20)}...`);
  
  try {
    const client = createClient(supabaseUrl, apiKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Test 1: Simple query to apps table
    console.log('  📋 Test 1: Query apps table...');
    const { data: apps, error: appsError } = await client
      .from('apps')
      .select('id, slug, name')
      .limit(5);

    if (appsError) {
      console.log(`  ❌ Apps query failed: ${appsError.message}`);
      return false;
    } else {
      console.log(`  ✅ Apps query success! Found ${apps?.length || 0} apps`);
      if (apps && apps.length > 0) {
        console.log(`     - ${apps.map(a => a.slug).join(', ')}`);
      }
    }

    // Test 2: Query admin_users table (requires service role)
    console.log('  👤 Test 2: Query admin_users table (service role only)...');
    const { data: admins, error: adminsError } = await client
      .from('admin_users')
      .select('id, email')
      .limit(1);

    if (adminsError) {
      console.log(`  ⚠️  Admin query failed: ${adminsError.message} (might be anon key)`);
    } else {
      console.log(`  ✅ Admin query success! This is a SERVICE ROLE key`);
    }

    // Test 3: Try to insert (requires write permission)
    console.log('  ✏️  Test 3: Check write permission...');
    const { error: insertError } = await client
      .from('apps')
      .insert({
        slug: 'test-key-validation-' + Date.now(),
        name: 'Test Key Validation',
        description: 'This is a test',
        category: 'other',
        status: 'draft',
        type: 'text_only',
      });

    if (insertError) {
      if (insertError.message.includes('duplicate') || insertError.message.includes('already exists')) {
        console.log(`  ✅ Write permission OK (duplicate key error is expected)`);
      } else {
        console.log(`  ⚠️  Write failed: ${insertError.message}`);
      }
    } else {
      console.log(`  ✅ Write permission OK`);
      // Clean up test data
      await client.from('apps').delete().match({ name: 'Test Key Validation' });
    }

    console.log(`\n✅ ${keyName} is VALID and WORKING!`);
    return true;

  } catch (error: any) {
    console.log(`\n❌ ${keyName} FAILED: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔐 Testing Supabase API Keys');
  console.log('=' .repeat(60));
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log('=' .repeat(60));

  const results: { [key: string]: boolean } = {};

  for (const [keyName, apiKey] of Object.entries(keysToTest)) {
    if (!apiKey) {
      console.log(`\n⚠️  ${keyName} not found in environment`);
      results[keyName] = false;
      continue;
    }
    
    results[keyName] = await testKey(keyName, apiKey);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));

  let hasValidKey = false;
  let recommendedKey = '';

  for (const [keyName, isValid] of Object.entries(results)) {
    const status = isValid ? '✅ VALID' : '❌ INVALID';
    console.log(`${status} - ${keyName}`);
    if (isValid) {
      hasValidKey = true;
      if (keyName.includes('SERVICE_ROLE')) {
        recommendedKey = keyName;
      }
    }
  }

  console.log('='.repeat(60));

  if (!hasValidKey) {
    console.log('\n❌ NO VALID KEYS FOUND!');
    console.log('\n💡 Please check:');
    console.log('   1. Supabase project is active');
    console.log('   2. API keys are correct in .env.development');
    console.log('   3. Database tables exist (run: npx tsx scripts/create-tables-supabase.ts)');
  } else {
    console.log(`\n✅ Recommended key: ${recommendedKey}`);
    console.log(`\n💡 Update lib/supabase.ts to use: process.env.${recommendedKey}`);
  }

  console.log('\n');
}

main();
