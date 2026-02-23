"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
async function createSuperAdmin() {
    if (!process.env.SUPABASE_URL) {
        console.error('❌ SUPABASE_URL environment variable is required');
        return;
    }
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    if (!serviceKey) {
        console.error('❌ SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY environment variable is required');
        return;
    }
    const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, serviceKey);
    try {
        console.log('🔧 Creating Super Administrator...');
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
            await supabase.auth.admin.deleteUser(authUser.user.id);
            return;
        }
        console.log('✅ Super Admin created successfully!');
        console.log('📧 Email:', 'admin@glads.com');
        console.log('🔑 Password:', 'Glads@2026@');
        console.log('👑 Role:', 'super-admin');
        console.log('\n🎉 You can now login and access all endpoints!');
    }
    catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}
createSuperAdmin()
    .then(() => {
    console.log('\n✨ Script completed');
    process.exit(0);
})
    .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
});
//# sourceMappingURL=create-super-admin.js.map