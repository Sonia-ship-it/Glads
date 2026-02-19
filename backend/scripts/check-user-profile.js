const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function checkUser() {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  try {
    console.log('🔍 Checking user in auth.users...');
    
    // Check auth.users table
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError.message);
      return;
    }

    console.log('📋 Found', authUsers.users.length, 'users in auth.users:');
    authUsers.users.forEach(user => {
      console.log(`  - ID: ${user.id}, Email: ${user.email}, Role: ${user.user_metadata?.role || 'N/A'}`);
    });

    console.log('\n🔍 Checking users table...');
    
    // Check users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('❌ Error fetching users table:', usersError.message);
      return;
    }

    console.log('📋 Found', users.length, 'users in users table:');
    users.forEach(user => {
      console.log(`  - ID: ${user.id}, Email: ${user.email}, Role: ${user.role}, Active: ${user.is_active}`);
    });

    // Find specific user
    const targetUserId = 'a1978d2-196f-4bc5-a3d4-a61b00daca9d';
    const targetUser = users.find(u => u.id === targetUserId);
    
    if (targetUser) {
      console.log('\n✅ Found target user:', targetUser);
    } else {
      console.log('\n❌ Target user not found in users table. Recreating...');
      
      // Recreate user profile
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: targetUserId,
          email: 'admin@glads.com',
          full_name: 'Super Administrator',
          role: 'super-admin',
          is_active: true,
          email_verified: true,
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error recreating user:', insertError.message);
      } else {
        console.log('✅ User profile recreated:', newUser);
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

checkUser()
  .then(() => {
    console.log('\n✨ Check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });