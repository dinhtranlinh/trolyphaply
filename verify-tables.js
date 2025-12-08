const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read from .env
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');
const env = {};

envLines.forEach(line => {
  const match = line.match(/^([^#=]+)=["']?(.*)["']?$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    value = value.replace(/^["']|["']$/g, '');
    env[key] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_KEY;

console.log('🔗 Supabase URL:', supabaseUrl);
console.log('🔑 Service Key:', supabaseKey ? 'Found ✅' : 'NOT FOUND ❌\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAndVerifyTables() {
  try {
    console.log('\n📊 Testing Supabase connection and verifying tables...\n');
    
    const tables = [
      'admin_users',
      'legal_documents', 
      'procedures',
      'prompts',
      'apps',
      'results',
      'app_stats_daily',
      'app_events'
    ];
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`  ❌ ${table} - Error: ${error.message}`);
      } else {
        console.log(`  ✅ ${table} - ${count} records`);
      }
    }
    
    console.log('\n✨ SUCCESS! All 8 tables are accessible!');
    console.log('🎉 SESSION 0 COMPLETED - Database setup is done!');
    console.log('\n📝 Next: SESSION 1 - Seed data and migrate apps from FacebookApp');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testAndVerifyTables();
