// Script to reset admin password
import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetAdminPassword() {
  console.log('🔐 Resetting admin password...\n');

  const email = 'admin@trolyphaply.vn';
  const newPassword = 'TroLy@PhapLy2026';

  // Hash the password
  const passwordHash = await bcrypt.hash(newPassword, 10);
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 New Password: ${newPassword}`);
  console.log(`#️⃣  Password Hash: ${passwordHash}\n`);

  // Update in database
  const { data, error } = await supabase
    .from('admin_users')
    .update({ password: passwordHash })
    .eq('email', email)
    .select();

  if (error) {
    console.error('❌ Error updating password:', error.message);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.error('❌ Admin user not found. Creating new user...\n');
    
    // Create new admin user
    const { data: newData, error: createError } = await supabase
      .from('admin_users')
      .insert({
        email,
        password: passwordHash,
      })
      .select();

    if (createError) {
      console.error('❌ Error creating admin user:', createError.message);
      process.exit(1);
    }

    console.log('✅ Admin user created successfully!');
    console.log(newData);
  } else {
    console.log('✅ Password updated successfully!');
    console.log(data);
  }

  console.log('\n🎉 Done! You can now login with:');
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${newPassword}`);
}

resetAdminPassword();
