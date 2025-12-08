// Xem toàn bộ dữ liệu chi tiết
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function viewAllData() {
  console.log('\n' + '='.repeat(80));
  console.log('🎯 THÀNH QUẢ SESSION 0 & SESSION 1');
  console.log('='.repeat(80));

  // Admin
  console.log('\n👤 ADMIN USERS:');
  const { data: admins } = await supabase.from('admin_users').select('*');
  console.log(JSON.stringify(admins, null, 2));

  // Documents
  console.log('\n📚 LEGAL DOCUMENTS:');
  const { data: docs } = await supabase.from('legal_documents').select('code, title, category, status');
  console.log(JSON.stringify(docs, null, 2));

  // Procedures
  console.log('\n📋 PROCEDURES:');
  const { data: procs } = await supabase.from('procedures').select('title, category, difficulty, estimated_time');
  console.log(JSON.stringify(procs, null, 2));

  // Prompts
  console.log('\n💬 PROMPTS:');
  const { data: prompts } = await supabase.from('prompts').select('title, category, tags, is_public');
  console.log(JSON.stringify(prompts, null, 2));

  // Apps
  console.log('\n🎮 MINI APPS:');
  const { data: apps } = await supabase.from('apps').select('slug, title, description, category, tags, status');
  console.log(JSON.stringify(apps, null, 2));

  console.log('\n' + '='.repeat(80));
  console.log('✨ HOÀN TẤT!\n');
}

viewAllData().catch(console.error);
