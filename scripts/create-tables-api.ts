import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.development') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function createTablesViaAPI() {
  console.log('🚀 Creating tables via Supabase Management API...\n');

  const sqlStatements = [
    {
      name: 'legal_writing_styles',
      sql: `CREATE TABLE IF NOT EXISTS legal_writing_styles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        example_content TEXT,
        tone VARCHAR(100),
        characteristics JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );`
    },
    {
      name: 'qa_prompts',
      sql: `CREATE TABLE IF NOT EXISTS qa_prompts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        system_prompt TEXT NOT NULL,
        formatting_instructions TEXT,
        is_active BOOLEAN DEFAULT false,
        version INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );`
    },
    {
      name: 'qa_prompt_writing_styles',
      sql: `CREATE TABLE IF NOT EXISTS qa_prompt_writing_styles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        prompt_id UUID REFERENCES qa_prompts(id) ON DELETE CASCADE,
        style_id UUID REFERENCES legal_writing_styles(id) ON DELETE CASCADE,
        priority INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(prompt_id, style_id)
      );`
    },
    {
      name: 'data_sources',
      sql: `CREATE TABLE IF NOT EXISTS data_sources (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        url VARCHAR(500) NOT NULL,
        priority INTEGER NOT NULL,
        is_enabled BOOLEAN DEFAULT true,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );`
    },
    {
      name: 'qa_prompt_history',
      sql: `CREATE TABLE IF NOT EXISTS qa_prompt_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        prompt_id UUID REFERENCES qa_prompts(id) ON DELETE CASCADE,
        version INTEGER NOT NULL,
        system_prompt TEXT NOT NULL,
        formatting_instructions TEXT,
        changed_by VARCHAR(255),
        change_note TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );`
    }
  ];

  for (const statement of sqlStatements) {
    try {
      console.log(`Creating table: ${statement.name}...`);
      
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sql: statement.sql })
      });

      const result = await response.text();
      
      if (response.ok) {
        console.log(`✅ ${statement.name} created successfully`);
      } else {
        console.log(`⚠️ ${statement.name}: ${result}`);
      }
    } catch (error: any) {
      console.error(`❌ ${statement.name}: ${error.message}`);
    }
  }

  console.log('\n📋 Creating indexes...');
  
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_qa_prompts_active ON qa_prompts(is_active);',
    'CREATE INDEX IF NOT EXISTS idx_data_sources_priority ON data_sources(priority);',
    'CREATE INDEX IF NOT EXISTS idx_prompt_styles_prompt ON qa_prompt_writing_styles(prompt_id);',
    'CREATE INDEX IF NOT EXISTS idx_prompt_history_prompt ON qa_prompt_history(prompt_id, version);'
  ];

  for (const indexSql of indexes) {
    const indexName = indexSql.match(/idx_\w+/)?.[0];
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sql: indexSql })
      });

      if (response.ok) {
        console.log(`✅ ${indexName} created`);
      }
    } catch (error) {
      console.log(`⚠️ ${indexName} skipped`);
    }
  }

  console.log('\n✅ Migration attempt complete!');
  console.log('\n⚠️ If tables were not created, please use Supabase Dashboard SQL Editor:');
  console.log('   https://supabase.com/dashboard/project/icqivkassoxfaukqbzyt/sql/new');
  console.log('   Copy content from: scripts/migrations/create-qa-system.sql');
}

createTablesViaAPI().catch(console.error);
