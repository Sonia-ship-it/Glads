import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('--- BRANCHES ---');
    const { data: branches, error: bError } = await supabase.from('branches').select('id, name, code, is_active');
    if (bError) console.error(bError);
    else console.table(branches);

    console.log('\n--- TEAM MEMBERS ---');
    const { data: team, error: tError } = await supabase.from('team_members').select('id, full_name, branch_id');
    if (tError) console.error(tError);
    else console.table(team);

    console.log('\n--- ROOMS ---');
    const { data: rooms, error: rError } = await supabase.from('rooms').select('id, room_number, branch_id');
    if (rError) console.error(rError);
    else console.table(rooms);
}

checkData();
