import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  console.log("Testing Admin login with Admin£123");
  let { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@commission.gov',
    password: 'Admin@123'
  });
  console.log("Result 1:", error ? error.message : "Success");

  console.log("Testing SuperAdmin login with SuperAdmin#123");
  let res2 = await supabase.auth.signInWithPassword({
    email: 'superadmin@commission.gov',
    password: 'SuperAdmin#123'
  });
  console.log("Result 2:", res2.error ? res2.error.message : "Success");
}

testLogin();
