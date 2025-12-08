const { Pool } = require('pg');
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
    // Remove surrounding quotes
    value = value.replace(/^["']|["']$/g, '');
    envVars[key] = value;
  }
});

async function executeSQLFile() {
  const connectionString = envVars.DATABASE_URL;
  
  console.log('🔗 Connection string:', connectionString.substring(0, 30) + '...');
  
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
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

executeSQLFile();
