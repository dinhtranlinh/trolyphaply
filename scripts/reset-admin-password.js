/**
 * Reset admin password in Supabase
 * Usage: node scripts/reset-admin-password.js
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://icqivkassoxfaukqbzyt.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljcWl2a2Fzc294ZmF1a3Fienl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzM3MjUwMiwiZXhwIjoyMDQ4OTQ4NTAyfQ.5fG0cKCg3K4rlzfJNVRqiZsEPp8P3R1ZiBsqXa2vfxU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetAdminPassword() {
  try {
    console.log('🔐 Resetting admin password...\n');

    const email = 'admin@trolyphaply.vn';
    const newPassword = 'LamKhanh1823$$$';

    // Generate new hash
    console.log('🔑 Generating password hash...');
    const passwordHash = bcrypt.hashSync(newPassword, 10);
    console.log('✅ Hash generated:', passwordHash.substring(0, 30) + '...\n');

    // Update in database
    console.log('💾 Updating database...');
    const { data, error } = await supabase
      .from('admin_users')
      .update({ password: passwordHash })
      .eq('email', email)
      .select();

    if (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }

    if (data && data.length > 0) {
      console.log('✅ Password updated successfully!');
      console.log('\n📋 New credentials:');
      console.log('   Email:', email);
      console.log('   Password:', newPassword);
      console.log('\n🎉 You can now login with these credentials.');
    } else {
      console.log('⚠️ No admin user found with email:', email);
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

resetAdminPassword();
