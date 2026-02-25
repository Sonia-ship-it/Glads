const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    try {
        const { data: branches } = await supabase.from('branches').select('id, name, code, is_active');
        const { data: team } = await supabase.from('team_members').select('id, full_name, branch_id, is_active');
        const { data: rooms } = await supabase.from('rooms').select('id, room_number, branch_id, is_active');

        const result = { branches, team, rooms };
        fs.writeFileSync('diagnostic_result.json', JSON.stringify(result, null, 2));
        console.log('Results written to diagnostic_result.json');
    } catch (err) {
        console.error('Execution failed:', err);
    }
}

checkData();
