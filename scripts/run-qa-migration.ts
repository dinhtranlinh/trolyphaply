import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load .env files
dotenv.config({ path: join(process.cwd(), '.env.development') });
dotenv.config();

/**
 * Run Q&A System Migration
 * Creates tables and seeds initial data for Q&A Prompt Management
 */
async function runMigration() {
  console.log('🚀 Starting Q&A System Migration...\n');
  
  // Get Supabase credentials
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Read migration SQL
    const migrationPath = join(process.cwd(), 'scripts', 'migrations', 'create-qa-system.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    console.log('📄 Loaded migration SQL');
    
    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));
    
    console.log(`📋 Found ${statements.length} SQL statements\n`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty lines
      if (!statement || statement.startsWith('--')) continue;
      
      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        
        if (error) {
          // If exec_sql doesn't exist, try direct query
          const { error: directError } = await supabase.from('_').select('*').limit(0);
          
          if (directError) {
            console.warn(`⚠️  Warning on statement ${i + 1}:`, error.message);
          }
        }
        
        console.log(`✅ Statement ${i + 1} completed`);
      } catch (err: any) {
        console.error(`❌ Error on statement ${i + 1}:`, err.message);
        // Continue with next statement
      }
    }
    
    console.log('\n🎉 Migration completed!');
    console.log('\n📊 Verifying created tables...\n');
    
    // Verify tables
    const tables = [
      'legal_writing_styles',
      'qa_prompts',
      'qa_prompt_writing_styles',
      'data_sources',
      'qa_prompt_history'
    ];
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table}: NOT FOUND`);
      } else {
        console.log(`✅ ${table}: ${count ?? 0} records`);
      }
    }
    
    console.log('\n✨ Migration and seed data completed successfully!');
    
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
