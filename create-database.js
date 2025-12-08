const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function executeSQLFile() {
  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
  console.log('🔗 Connecting to database...');
  
  const pool = new Pool({
    connectionString: connectionString,
  });

  try {
    const sqlFile = fs.readFileSync(
      path.join(__dirname, 'prisma', 'schema.sql'),
      'utf8'
    );

    console.log('📊 Executing SQL schema...');
    await pool.query(sqlFile);
    console.log('✅ Database schema created successfully!');
    console.log('📋 Tables created:');
    console.log('  - admin_users');
    console.log('  - legal_documents');
    console.log('  - procedures');
    console.log('  - prompts');
    console.log('  - apps');
    console.log('  - results');
    console.log('  - app_stats_daily');
    console.log('  - app_events');

  } catch (error) {
    console.error('❌ Error creating schema:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

executeSQLFile();
