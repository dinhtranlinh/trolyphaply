// Test Supabase connection
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env manually
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');
const envVars = {};

envLines.forEach(line => {
  const match = line.match(/^([^#=]+)=["']?(.*)["']?$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    value = value.replace(/^["']|["']$/g, '');
    envVars[key] = value;
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_KEY;

console.log('🔗 Supabase URL:', supabaseUrl);
console.log('🔑 Service Key:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'NOT FOUND');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n📊 Testing Supabase connection...');
    
    // Try to execute a simple SQL query via RPC or use tables list
    const { data, error } = await supabase
      .from('_prisma_migrations')
      .select('*')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = table not found, which is OK
      console.log('❌ Error:', error);
    } else {
      console.log('✅ Connection successful!');
      console.log('Now trying to create tables via SQL...\n');
      
      // Read SQL file
      const sqlFile = fs.readFileSync(
        path.join(__dirname, 'prisma', 'schema.sql'),
        'utf8'
      );
      
      // Execute via Supabase SQL API
      const { data: sqlData, error: sqlError } = await supabase.rpc('exec_sql', {
        sql_query: sqlFile
      });
      
      if (sqlError) {
        console.log('❌ SQL execution error:', sqlError);
        console.log('\n💡 You may need to run the SQL manually in Supabase SQL Editor');
        console.log('📄 SQL file location: prisma/schema.sql');
      } else {
        console.log('✅ Tables created successfully!');
      }
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testConnection();
