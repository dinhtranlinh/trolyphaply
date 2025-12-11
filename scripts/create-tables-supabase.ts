// Auto-create style_guides tables via Supabase SQL
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runSQL() {
  console.log('🚀 Creating style_guides tables in Supabase...\n');

  const sql = `
-- Create style_guides table
CREATE TABLE IF NOT EXISTS style_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  characteristics TEXT[] NOT NULL DEFAULT '{}',
  tone TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'vi',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create style_guide_examples table
CREATE TABLE IF NOT EXISTS style_guide_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  style_guide_id UUID NOT NULL REFERENCES style_guides(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_style_guide_examples_style_guide_id ON style_guide_examples(style_guide_id);
CREATE INDEX IF NOT EXISTS idx_style_guides_is_default ON style_guides(is_default);
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // RPC might not exist, try alternative
      console.log('⚠️  RPC exec_sql not found. Using direct table check...');
      
      // Check if tables exist
      const { data: tables, error: tablesError } = await supabase
        .from('style_guides')
        .select('id')
        .limit(1);
      
      if (tablesError && tablesError.code === '42P01') {
        console.error('❌ Tables do not exist. Please create them manually via Supabase SQL Editor:');
        console.log('\n' + sql + '\n');
        process.exit(1);
      } else {
        console.log('✅ Tables already exist or check passed!');
      }
    } else {
      console.log('✅ Tables created successfully!');
    }
  } catch (err) {
    console.error('❌ Error:', err);
    console.log('\n📋 Manual SQL (copy to Supabase SQL Editor):');
    console.log(sql);
  }
}

runSQL();
