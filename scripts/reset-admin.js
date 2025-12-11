require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetAdmin() {
  console.log('Resetting admin account...');
  console.log('Email: admin@trolyphaply.vn');
  console.log('Password: LamKhanh1823$$$');
  console.log('');

  const newPasswordHash = '$2b$10$NuM35P0XOPzwIa8CYtfPxOjOBLQoqK3FGQRzi7DXAKHrAnsqUJPEy';

  // Try to update existing admin
  const { data: updateData, error: updateError } = await supabase
    .from('admin_users')
    .update({
      email: 'admin@trolyphaply.vn',
      password: newPasswordHash,
      updated_at: new Date().toISOString()
    })
    .eq('email', 'admin@trolyphaply.vn')
    .select();

  if (updateError) {
    console.log('Update failed (admin may not exist), trying insert...');
    
    // Insert new admin if not exists
    const { data: insertData, error: insertError } = await supabase
      .from('admin_users')
      .insert({
        email: 'admin@trolyphaply.vn',
        password: newPasswordHash,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (insertError) {
      console.error('❌ Insert failed:', insertError);
      return;
    }

    console.log('✅ Admin account created successfully!');
    console.log(insertData);
  } else {
    if (updateData && updateData.length > 0) {
      console.log('✅ Admin account updated successfully!');
      console.log(updateData);
    } else {
      console.log('⚠️ No admin account found to update. Creating new one...');
      
      const { data: insertData, error: insertError } = await supabase
        .from('admin_users')
        .insert({
          email: 'admin@trolyphaply.vn',
          password: newPasswordHash,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();

      if (insertError) {
        console.error('❌ Insert failed:', insertError);
        return;
      }

      console.log('✅ Admin account created successfully!');
      console.log(insertData);
    }
  }

  // Verify
  const { data: verifyData, error: verifyError } = await supabase
    .from('admin_users')
    .select('id, email, created_at, updated_at')
    .eq('email', 'admin@trolyphaply.vn')
    .single();

  if (verifyError) {
    console.error('❌ Verification failed:', verifyError);
  } else {
    console.log('');
    console.log('📊 Current admin account:');
    console.log(verifyData);
  }
}

resetAdmin();
