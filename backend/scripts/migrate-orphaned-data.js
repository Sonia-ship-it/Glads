const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const ACTIVE_NDERA_ID = 'ad70a739-48ba-48ec-81d5-a06899ea7c71';
const ORPHANED_IDS = [
    'b589d269-2ddd-4c1b-a52c-8b4abd011d1c',
    'c088bf4b-cb7c-4a6f-889a-4fb46e3ee581',
    '592f329f-f62d-4bc1-ac4d-ebe58ea5cb53',
    'f1d0d1d1-ee46-4592-8888-dc70dc618a07',
    '7dc80a10-0797-455d-8b2a-9bf253a7a06d'
];

async function forceMigrateRooms() {
    console.log('🚀 Starting forced room migration...');

    try {
        // Fetch all orphaned rooms
        const { data: rooms, error: fetchError } = await supabase
            .from('rooms')
            .select('*')
            .in('branch_id', ORPHANED_IDS);

        if (fetchError) throw fetchError;

        console.log(`🔍 Found ${rooms.length} orphaned rooms.`);

        for (const room of rooms) {
            console.log(`📦 Processing room ${room.room_number}...`);

            // Try to update to active branch
            const { error: updateError } = await supabase
                .from('rooms')
                .update({ branch_id: ACTIVE_NDERA_ID })
                .eq('id', room.id);

            if (updateError) {
                if (updateError.code === '23505') { // Unique constraint violation
                    console.log(`⚠️ Conflict for room ${room.room_number}. Renaming to ${room.room_number}-ALT...`);
                    const { error: renameError } = await supabase
                        .from('rooms')
                        .update({
                            branch_id: ACTIVE_NDERA_ID,
                            room_number: `${room.room_number}-ALT`
                        })
                        .eq('id', room.id);

                    if (renameError) console.error(`❌ Rename failed for ${room.id}:`, renameError.message);
                    else console.log(`✅ Forced migration of ${room.room_number} (as -ALT).`);
                } else {
                    console.error(`❌ Update failed for ${room.id}:`, updateError.message);
                }
            } else {
                console.log(`✅ Migrated ${room.room_number}.`);
            }
        }

        console.log('🏁 Forced migration completed.');
    } catch (err) {
        console.error('💥 Forced migration failed:', err);
    }
}

forceMigrateRooms();
