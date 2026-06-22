"use server";

import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rateLimit";
import { createClient } from '@supabase/supabase-js';
import { sendSMS } from '@/lib/textbee';
import crypto from 'crypto';

export async function verifyLoginAttempt() {
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';

  // Limit: 50 login attempts per 15 minutes per IP (Sensible for testing/NAT)
  const { allowed } = await checkRateLimit(ip, 'login_attempt', 50, 15);
  
  if (!allowed) {
    throw new Error("Too many login attempts. Please try again later.");
  }
  
  return true;
}

// Use the service role key to bypass RLS and Auth restrictions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function registerUserAction(formData: FormData) {
  try {
    const periodId = formData.get('periodId') as string;
    const fullName = formData.get('fullName') as string;
    const rawPhone = formData.get('phone') as string;
    let password = (formData.get('password') as string)?.trim() || '';

    if (!periodId || !fullName || !rawPhone) {
      return { error: 'Missing required fields' };
    }

    // Format phone number to E.164 standard (e.g. +251...)
    const cleanPhone = rawPhone.trim();
    const phone = cleanPhone.startsWith('+') ? cleanPhone : `+251${cleanPhone.replace(/^0+/, '').replace(/\s+/g, '')}`;

    // Generate random password if not provided (Admin flow)
    const isAdminCreated = !password;
    if (isAdminCreated) {
      password = crypto.randomBytes(4).toString('hex'); // 8 characters random string
    }

    // 1. Create user in Supabase Auth bypassing phone confirmation
    // We use a synthetic email to avoid Supabase's 'Phone Logins Disabled' requirement
    const syntheticEmail = `${phone.replace(/\s+/g, '')}@federal.local`;
    
    let userId;
    
    // First, check if user exists in public.users to prevent split-brain issues
    const { data: existingUser, error: existErr } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('phone_number', phone)
      .single();

    if (existingUser?.id) {
      // User exists from a previous phone registration!
      userId = existingUser.id;
      // Update their auth account with the synthetic email and password
      const updatePayload: any = { email: syntheticEmail, email_confirm: true };
      if (password) updatePayload.password = password;
      
      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, updatePayload);
      if (updateErr && !updateErr.message.includes('already been registered')) {
        return { error: 'Failed to update existing user authentication: ' + updateErr.message };
      }
    } else {
      // Create a brand new user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: syntheticEmail,
        email_confirm: true,
        password: password,
        user_metadata: { full_name: fullName, phone: phone }
      });

      if (authError) {
        return { error: authError.message };
      }
      userId = authData.user.id;
    }

    // 2. Upsert into public.users
    const { error: usersError } = await supabaseAdmin
      .from('users')
      .upsert({ id: userId, phone_number: phone, full_name: fullName });

    if (usersError) {
      return { error: 'Failed to update user profile' };
    }

    // 3. Insert into period_members
    const { error: memberError } = await supabaseAdmin
      .from('period_members')
      .insert({ period_id: periodId, user_id: userId, role: 'regular' });

    if (memberError) {
      // If the user was already a member, insert will fail depending on unique constraints.
      // Assuming conflict doesn't happen for a newly created user.
      return { error: 'Failed to add user to period' };
    }

    // 4. Send SMS via Textbee
    const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/assessment/login`;
    
    let smsMessage = '';
    if (isAdminCreated) {
      smsMessage = `ሰላም ${fullName}፣ ለግምገማ ተመዝግበዋል! (You are registered for assessment).\nመግቢያ (Link): ${loginUrl}\nስልክ (Phone): ${phone}\nየይለፍ ቃል (Password): ${password}`;
    } else {
      smsMessage = `ሰላም ${fullName}፣ ምዝገባዎ ተሳክቷል! (Registration successful).\nመግቢያ (Link): ${loginUrl}\nስልክ (Phone): ${phone}`;
    }

    const smsResult = await sendSMS(phone, smsMessage);
    if (smsResult.error) {
      console.error("SMS Warning:", smsResult.error);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Registration action error:", error);
    return { error: error.message || 'An unexpected error occurred' };
  }
}

export async function resetPasswordAction(rawPhone: string) {
  try {
    if (!rawPhone) return { error: 'Phone number is required' };

    // Format phone to E.164
    const cleanPhone = rawPhone.trim();
    const phone = cleanPhone.startsWith('+') ? cleanPhone : `+251${cleanPhone.replace(/^0+/, '').replace(/\s+/g, '')}`;
    const syntheticEmail = `${phone.replace(/\s+/g, '')}@federal.local`;

    // 1. Find user by email
    // Unfortunately, admin.listUsers is required to find by email if we don't know the ID, 
    // but we can query public.users using the phone_number
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, full_name')
      .eq('phone_number', phone)
      .single();

    if (userError || !userData) {
      return { error: 'User not found' };
    }

    // 2. Generate new password
    const newPassword = crypto.randomBytes(4).toString('hex'); // 8 characters

    // 3. Force update password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userData.id, {
      password: newPassword
    });

    if (updateError) {
      return { error: 'Failed to reset password' };
    }

    // 4. Send SMS via Textbee
    const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/assessment/login`;
    const smsMessage = `ሰላም ${userData.full_name}፣ የይለፍ ቃልዎ ተቀይሯል።\nአዲሱ የይለፍ ቃል (New Password): ${newPassword}\nመግቢያ (Link): ${loginUrl}`;

    const smsResult = await sendSMS(phone, smsMessage);
    if (smsResult.error) {
      console.error("SMS Warning in reset:", smsResult.error);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Reset password error:", error);
    return { error: error.message || 'An unexpected error occurred' };
  }
}
