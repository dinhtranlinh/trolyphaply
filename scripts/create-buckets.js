/**
 * Create Supabase Storage buckets for TroLyPhapLy
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createBuckets() {
  console.log('🪣 Creating Supabase Storage buckets...\n');

  const buckets = [
    {
      name: 'results',
      public: true,
      description: 'Generated images from apps (vận mệnh, tử vi, etc.)'
    },
    {
      name: 'documents',
      public: true,
      description: 'Legal documents PDFs'
    }
  ];

  for (const bucket of buckets) {
    try {
      console.log(`📦 Creating bucket: ${bucket.name}...`);

      // Check if bucket exists
      const { data: existing } = await supabase
        .storage
        .getBucket(bucket.name);

      if (existing) {
        console.log(`   ⚠️  Bucket "${bucket.name}" already exists`);
        
        // Update bucket settings to make it public
        const { error: updateError } = await supabase
          .storage
          .updateBucket(bucket.name, { public: bucket.public });
        
        if (updateError) {
          console.log(`   ⚠️  Could not update bucket: ${updateError.message}`);
        } else {
          console.log(`   ✅ Updated bucket to public: ${bucket.public}`);
        }
      } else {
        // Create new bucket
        const { data, error } = await supabase
          .storage
          .createBucket(bucket.name, {
            public: bucket.public,
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
          });

        if (error) {
          console.error(`   ❌ Error: ${error.message}`);
        } else {
          console.log(`   ✅ Created: ${bucket.name} (Public: ${bucket.public})`);
        }
      }
    } catch (error) {
      console.error(`   ❌ Error creating ${bucket.name}:`, error.message);
    }
  }

  console.log('\n✅ Storage buckets setup completed!');
  console.log('\n📋 Bucket details:');
  console.log('   - results: For generated images from apps');
  console.log('   - documents: For legal document PDFs');
  
  console.log('\n📝 Next steps:');
  console.log('   1. Copy background images from FacebookApp to public/backgrounds/tu-vi/');
  console.log('   2. Test image upload with apps');
}

createBuckets();
