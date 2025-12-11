import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkTables() {
  console.log('🔍 Checking database tables...\n');

  const tables = [
    'legal_writing_styles',
    'qa_prompts',
    'data_sources',
    'qa_prompt_writing_styles',
    'qa_prompt_history'
  ];

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: false });

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: ${count} records`);
        if (count && count > 0 && data) {
          const preview = JSON.stringify(data[0]).substring(0, 150);
          console.log(`   Preview: ${preview}...`);
        }
      }
    } catch (error: any) {
      console.log(`❌ ${table}: ${error.message}`);
    }
  }

  console.log('\n✅ Check complete!');
}

checkTables();
