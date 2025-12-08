const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Read .env file manually to avoid caching
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

console.log('🔗 Using connection:', connectionString ? connectionString.substring(0, 50) + '...' : 'NOT FOUND');

const pool = new Pool({ 
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  }
});
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function testConnection() {
  try {
    console.log('🔗 Testing Prisma connection to Supabase...\n');

    // Test connection by querying each table
    console.log('📊 Checking tables:');
    
    const adminCount = await prisma.adminUser.count();
    console.log(`  ✅ admin_users - ${adminCount} records`);
    
    const legalDocsCount = await prisma.legalDocument.count();
    console.log(`  ✅ legal_documents - ${legalDocsCount} records`);
    
    const proceduresCount = await prisma.procedure.count();
    console.log(`  ✅ procedures - ${proceduresCount} records`);
    
    const promptsCount = await prisma.prompt.count();
    console.log(`  ✅ prompts - ${promptsCount} records`);
    
    const appsCount = await prisma.app.count();
    console.log(`  ✅ apps - ${appsCount} records`);
    
    const resultsCount = await prisma.result.count();
    console.log(`  ✅ results - ${resultsCount} records`);
    
    const statsCount = await prisma.appStatsDaily.count();
    console.log(`  ✅ app_stats_daily - ${statsCount} records`);
    
    const eventsCount = await prisma.appEvent.count();
    console.log(`  ✅ app_events - ${eventsCount} records`);
    
    console.log('\n✨ SUCCESS! All 8 tables are accessible!');
    console.log('🎉 SESSION 0 COMPLETED - Database setup is done!');
    console.log('\n📝 Next: SESSION 1 - Seed data and migrate apps from FacebookApp');
    
  } catch (error) {
    console.error('❌ Error testing connection:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

testConnection();
