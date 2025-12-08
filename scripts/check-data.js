// Script kiểm tra dữ liệu sau SESSION 0 và 1
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkData() {
  console.log('\n🎯 KIỂM TRA THÀNH QUẢ SESSION 0 & 1\n');
  console.log('='.repeat(60));

  // SESSION 0: Kiểm tra bảng
  console.log('\n📊 SESSION 0: DATABASE SCHEMA');
  console.log('-'.repeat(60));
  
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
      console.log(`❌ ${table}: Lỗi - ${error.message}`);
    } else {
      console.log(`✅ ${table}: ${count} bản ghi`);
    }
  }

  // SESSION 1: Dữ liệu chi tiết
  console.log('\n📝 SESSION 1: SEEDED DATA');
  console.log('-'.repeat(60));

  // Admin users
  console.log('\n👤 ADMIN USERS:');
  const { data: admins } = await supabase
    .from('admin_users')
    .select('email, role');
  admins?.forEach(admin => {
    console.log(`   • ${admin.email} (${admin.role})`);
  });

  // Legal documents
  console.log('\n📚 LEGAL DOCUMENTS:');
  const { data: docs } = await supabase
    .from('legal_documents')
    .select('code, title, status')
    .order('code');
  docs?.forEach(doc => {
    console.log(`   • ${doc.code}: ${doc.title} [${doc.status}]`);
  });

  // Procedures
  console.log('\n📋 PROCEDURES:');
  const { data: procedures } = await supabase
    .from('procedures')
    .select('title, category, difficulty')
    .order('title');
  procedures?.forEach(proc => {
    console.log(`   • ${proc.title} (${proc.category}, ${proc.difficulty})`);
  });

  // Prompts
  console.log('\n💬 PROMPTS:');
  const { data: prompts } = await supabase
    .from('prompts')
    .select('title, category, is_public')
    .order('title');
  prompts?.forEach(prompt => {
    const visibility = prompt.is_public ? '🌐 Public' : '🔒 Private';
    console.log(`   • ${prompt.title} (${prompt.category}) ${visibility}`);
  });

  // Apps
  console.log('\n🎮 MINI APPS:');
  const { data: apps } = await supabase
    .from('apps')
    .select('slug, title, category, status, tags')
    .order('slug');
  apps?.forEach(app => {
    console.log(`   • ${app.slug}: ${app.title}`);
    console.log(`     Category: ${app.category}, Status: ${app.status}`);
    console.log(`     Tags: ${app.tags.join(', ')}`);
  });

  // Storage buckets
  console.log('\n🗄️  STORAGE BUCKETS:');
  const { data: buckets } = await supabase.storage.listBuckets();
  buckets?.forEach(bucket => {
    console.log(`   • ${bucket.name} (${bucket.public ? '🌐 Public' : '🔒 Private'})`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('✨ Hoàn tất kiểm tra!\n');
}

checkData().catch(console.error);
