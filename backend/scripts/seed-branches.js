"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const branches = [
    { name: 'Ndera', address: 'Ndera, Kigali', contact_info: '+250788123456' },
    { name: 'Kanombe', address: 'Kanombe, Kigali', contact_info: '+250788123457' },
    { name: 'Kabeza', address: 'Kabeza, Kigali', contact_info: '+250788123458' },
];
async function seedBranches() {
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
    console.log('🌱 Seeding branches...');
    for (const branch of branches) {
        const { data: existing, error: checkError } = await supabase
            .from('branches')
            .select('id')
            .eq('name', branch.name)
            .single();
        if (checkError && checkError.code !== 'PGRST116') {
            console.error(`❌ Error checking branch ${branch.name}:`, checkError.message);
            continue;
        }
        if (existing) {
            console.log(`ℹ️ Branch ${branch.name} already exists.`);
            continue;
        }
        const { data, error } = await supabase
            .from('branches')
            .insert([branch])
            .select()
            .single();
        if (error) {
            console.error(`❌ Error creating branch ${branch.name}:`, error.message);
        }
        else {
            console.log(`✅ Branch ${branch.name} created successfully! (ID: ${data.id})`);
        }
    }
    console.log('✅ Seeding completed.');
}
seedBranches()
    .then(() => process.exit(0))
    .catch((err) => {
    console.error('❌ Script failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed-branches.js.map