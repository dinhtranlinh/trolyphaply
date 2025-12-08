// Script to create style_guides tables in Supabase
import { supabase } from './lib/supabase';

async function createStyleGuidesTables() {
  console.log('Creating style_guides and style_guide_examples tables...');

  // Create style_guides table
  const createStyleGuidesSQL = `
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
  `;

  // Create style_guide_examples table
  const createExamplesSQL = `
    CREATE TABLE IF NOT EXISTS style_guide_examples (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      style_guide_id UUID NOT NULL REFERENCES style_guides(id) ON DELETE CASCADE,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `;

  try {
    // Execute SQL via Supabase RPC or direct query
    console.log('⚠️  Please run these SQL commands in Supabase SQL Editor:');
    console.log('\n--- SQL for style_guides table ---');
    console.log(createStyleGuidesSQL);
    console.log('\n--- SQL for style_guide_examples table ---');
    console.log(createExamplesSQL);
    
    console.log('\n✅ SQL generated. Copy and paste into Supabase SQL Editor.');
  } catch (error) {
    console.error('Error:', error);
  }
}

createStyleGuidesTables();
