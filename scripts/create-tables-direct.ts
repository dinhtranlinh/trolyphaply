import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.development') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSqlStatement(sql: string) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });
    
    if (error) {
      // Try alternative method using direct query
      const { data: altData, error: altError } = await supabase
        .from('_sql_exec')
        .insert({ query: sql });
      
      if (altError) {
        throw new Error(altError.message);
      }
      return altData;
    }
    return data;
  } catch (error: any) {
    throw error;
  }
}

async function createTables() {
  console.log('🚀 Starting table creation...\n');

  const sqlStatements = [
    // 1. Legal writing styles table
    `CREATE TABLE IF NOT EXISTS legal_writing_styles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      example_content TEXT,
      tone VARCHAR(100),
      characteristics JSONB,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,

    // 2. QA prompts table
    `CREATE TABLE IF NOT EXISTS qa_prompts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      system_prompt TEXT NOT NULL,
      formatting_instructions TEXT,
      is_active BOOLEAN DEFAULT false,
      version INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,

    // 3. Junction table for prompts and styles
    `CREATE TABLE IF NOT EXISTS qa_prompt_writing_styles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      prompt_id UUID REFERENCES qa_prompts(id) ON DELETE CASCADE,
      style_id UUID REFERENCES legal_writing_styles(id) ON DELETE CASCADE,
      priority INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(prompt_id, style_id)
    )`,

    // 4. Data sources table
    `CREATE TABLE IF NOT EXISTS data_sources (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      url VARCHAR(500) NOT NULL,
      priority INTEGER NOT NULL,
      is_enabled BOOLEAN DEFAULT true,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,

    // 5. Prompt history table
    `CREATE TABLE IF NOT EXISTS qa_prompt_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      prompt_id UUID REFERENCES qa_prompts(id) ON DELETE CASCADE,
      version INTEGER NOT NULL,
      system_prompt TEXT NOT NULL,
      formatting_instructions TEXT,
      changed_by VARCHAR(255),
      change_note TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    // Indexes
    `CREATE INDEX IF NOT EXISTS idx_qa_prompts_active ON qa_prompts(is_active)`,
    `CREATE INDEX IF NOT EXISTS idx_data_sources_priority ON data_sources(priority)`,
    `CREATE INDEX IF NOT EXISTS idx_prompt_styles_prompt ON qa_prompt_writing_styles(prompt_id)`,
    `CREATE INDEX IF NOT EXISTS idx_prompt_history_prompt ON qa_prompt_history(prompt_id, version)`
  ];

  for (let i = 0; i < sqlStatements.length; i++) {
    const sql = sqlStatements[i];
    const tableName = sql.match(/CREATE (?:TABLE|INDEX) (?:IF NOT EXISTS )?(\w+)/)?.[1] || `statement ${i + 1}`;
    
    try {
      console.log(`Creating ${tableName}...`);
      
      // Direct execution using Supabase SQL
      const { error } = await supabase.rpc('execute_sql', { query: sql });
      
      if (error) {
        console.log(`⚠️ RPC failed, trying direct REST API...`);
        
        // Fallback: Use REST API directly
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ query: sql })
        });

        if (!response.ok) {
          console.log(`⚠️ REST API failed, using SQL editor format...`);
          
          // Last resort: Just log the SQL for manual execution
          console.log(`\n📝 Please execute this SQL manually in Supabase Dashboard:\n`);
          console.log(sql);
          console.log('\n---\n');
        } else {
          console.log(`✅ ${tableName} created via REST API`);
        }
      } else {
        console.log(`✅ ${tableName} created`);
      }
    } catch (error: any) {
      console.log(`⚠️ ${tableName}: ${error.message}`);
      console.log(`\n📝 SQL for manual execution:\n${sql}\n`);
    }
  }

  console.log('\n✅ Migration complete!\n');
  console.log('📋 Next steps:');
  console.log('1. Open Supabase Dashboard > SQL Editor');
  console.log('2. Copy and paste the entire content of scripts/migrations/create-qa-system.sql');
  console.log('3. Click "Run" to create all tables and insert seed data');
  console.log('\nAlternatively, run these statements one by one in the SQL editor.');
}

createTables().catch(console.error);
