// Create Supabase Storage buckets
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBuckets() {
  console.log('🪣 Creating Supabase Storage buckets...\n');

  // Create 'results' bucket (public)
  console.log('1️⃣  Creating "results" bucket...');
  const { data: results, error: resultsError } = await supabase.storage.createBucket('results', {
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
  });

  if (resultsError) {
    if (resultsError.message.includes('already exists')) {
      console.log('  ⚠️  Bucket "results" already exists');
    } else {
      console.error('  ❌ Error creating results bucket:', resultsError.message);
    }
  } else {
    console.log('  ✅ Bucket "results" created successfully');
  }

  // Create 'documents' bucket (public)
  console.log('\n2️⃣  Creating "documents" bucket...');
  const { data: documents, error: documentsError } = await supabase.storage.createBucket('documents', {
    public: true,
    fileSizeLimit: 52428800, // 50MB
    allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  });

  if (documentsError) {
    if (documentsError.message.includes('already exists')) {
      console.log('  ⚠️  Bucket "documents" already exists');
    } else {
      console.error('  ❌ Error creating documents bucket:', documentsError.message);
    }
  } else {
    console.log('  ✅ Bucket "documents" created successfully');
  }

  console.log('\n✨ Storage buckets setup completed!');
}

createBuckets().catch((error) => {
  console.error('❌ Failed to create buckets:', error);
  process.exit(1);
});
