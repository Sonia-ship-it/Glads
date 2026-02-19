import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

async function createSuperAdmin() {
  // Validate environment variables
  if (!process.env.SUPABASE_URL) {
    console.error('❌ SUPABASE_URL environment variable is required');
    return;
  }
  
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY environment variable is required');
    return;
  }

  // Initialize Supabase client with service role key
  const supabase = createClient(
    process.env.SUPABASE_URL,
    serviceKey // Service role key, not anon key
  );

  try {
    console.log('🔧 Creating Super Administrator...');

    // 1. Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@glads.com',
      password: 'Glads@2026@',
      email_confirm: true,
      user_metadata: {
        full_name: 'Super Administrator',
        role: 'super-admin',
      },
    });

    if (authError) {
      console.error('❌ Error creating auth user:', authError.message);
      return;
    }

    console.log('✅ Auth user created successfully:', authUser.user.email);

    // 2. Create user profile
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        email: 'admin@glads.com',
        full_name: 'Super Administrator',
        role: 'super-admin',
        is_active: true,
        email_verified: true,
      });

    if (error) {
      console.error('❌ Error creating user profile:', error.message);
      // Try to cleanup auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return;
    }

    console.log('✅ Super Admin created successfully!');
    console.log('📧 Email:', 'admin@glads.com');
    console.log('🔑 Password:', 'Glads@2026@');
    console.log('👑 Role:', 'super-admin');
    console.log('\n🎉 You can now login and access all endpoints!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
createSuperAdmin()
  .then(() => {
    console.log('\n✨ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });