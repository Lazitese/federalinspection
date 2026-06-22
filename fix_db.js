const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({path: '.env.local'});

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

async function fix() {
  // 1. Delete the newly created split-brain user
  await supabaseAdmin.auth.admin.deleteUser('8d668e48-4630-4fd8-8749-eea11f0edc97');
  
  // 2. Update the original users with the synthetic email and password
  await supabaseAdmin.auth.admin.updateUserById('2d808894-8215-4623-baa8-95d73664a68e', {
    email: '+251938560597@federal.local',
    password: '6c9ad643'
  });

  await supabaseAdmin.auth.admin.updateUserById('fb4c87dd-0f08-46f4-b3e9-c7da8c7e3f66', {
    email: '+251987279591@federal.local'
  });

  console.log("FIXED!");
}
fix();
