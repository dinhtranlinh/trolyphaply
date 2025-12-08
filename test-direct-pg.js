const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Read connection string
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');
let connectionString = null;

for (const line of envLines) {
  const match = line.match(/^DATABASE_URL=["']?(.*)["']?$/);
  if (match) {
    connectionString = match[1].replace(/^["']|["']$/g, '');
    break;
  }
}

console.log('🔗 Connection string:', connectionString.substring(0, 50) + '...\n');

const pool = new Pool({ 
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  }
});

async function testDirectConnection() {
  try {
    console.log('📊 Testing direct PostgreSQL connection...\n');
    
    // Simple query
    const result = await pool.query('SELECT current_database(), current_user, version()');
    console.log('✅ Connection successful!');
    console.log('Database:', result.rows[0].current_database);
    console.log('User:', result.rows[0].current_user);
    console.log('Version:', result.rows[0].version.substring(0, 50) + '...\n');
    
    // List tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Tables in database:');
    if (tables.rows.length === 0) {
      console.log('  ❌ No tables found!');
    } else {
      tables.rows.forEach(row => {
        console.log(`  ✅ ${row.table_name}`);
      });
    }
    
    console.log('\n🎉 Direct connection works! Now testing Prisma...');
    
  } catch (error) {
    console.error('❌ Direct connection failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testDirectConnection();
