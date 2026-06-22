require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
supabaseAdmin.auth.admin.updateUserById('8d668e48-4630-4fd8-8749-eea11f0edc97', { password: '6c9ad643' }).then(res => console.log('UPDATE_RESULT:', res.error ? res.error.message : 'SUCCESS'));
