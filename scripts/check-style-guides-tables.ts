import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://icqivkassoxfaukqbzyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljcWl2a2Fzc294ZmF1a3FiYnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyNTUzNzQsImV4cCI6MjA1NDgzMTM3NH0.VCElrEWKHXQV4W66sGSZ7XCaOSLZNzojDvWqcHNiKn4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('🔍 Checking if style_guides tables exist...\n');

  try {
    // Try to query style_guides table
    const { data: styleGuides, error: sgError } = await supabase
      .from('style_guides')
      .select('id, name')
      .limit(1);

    if (sgError) {
      console.log('❌ style_guides table does NOT exist or not accessible');
      console.log('   Error:', sgError.message);
    } else {
      console.log('✅ style_guides table EXISTS');
      console.log('   Sample data:', styleGuides);
    }

    // Try to query style_guide_examples table
    const { data: examples, error: exError } = await supabase
      .from('style_guide_examples')
      .select('id, style_guide_id')
      .limit(1);

    if (exError) {
      console.log('\n❌ style_guide_examples table does NOT exist or not accessible');
      console.log('   Error:', exError.message);
    } else {
      console.log('\n✅ style_guide_examples table EXISTS');
      console.log('   Sample data:', examples);
    }

    // Count records
    const { count: sgCount } = await supabase
      .from('style_guides')
      .select('*', { count: 'exact', head: true });

    const { count: exCount } = await supabase
      .from('style_guide_examples')
      .select('*', { count: 'exact', head: true });

    console.log('\n📊 Record counts:');
    console.log(`   style_guides: ${sgCount ?? 0}`);
    console.log(`   style_guide_examples: ${exCount ?? 0}`);

  } catch (error) {
    console.error('❌ Error checking tables:', error);
  }
}

checkTables();
