import { supabaseAdmin } from './supabaseAdmin';

export async function checkRateLimit(ip: string, actionType: string, maxRequests: number, windowMinutes: number): Promise<{ allowed: boolean; remaining: number }> {
  // 1. Get the current rate limit record for this IP and action
  const { data: currentRecord, error: fetchError } = await supabaseAdmin
    .from('rate_limits')
    .select('*')
    .eq('ip_address', ip)
    .eq('action_type', actionType)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is 'not found'
    console.error('Error fetching rate limit:', fetchError);
    // On error (like db issues), we might fail open or closed. Failing open to not block legitimate users on db errors.
    return { allowed: true, remaining: 1 };
  }

  const now = new Date();
  
  if (!currentRecord) {
    // 2. No record exists, insert a new one
    await supabaseAdmin.from('rate_limits').insert({
      ip_address: ip,
      action_type: actionType,
      count: 1,
      last_request_at: now.toISOString(),
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  // 3. Record exists, check time window
  const lastRequestTime = new Date(currentRecord.last_request_at);
  const diffMinutes = (now.getTime() - lastRequestTime.getTime()) / 1000 / 60;

  if (diffMinutes > windowMinutes) {
    // 4. Outside window, reset count
    await supabaseAdmin
      .from('rate_limits')
      .update({ count: 1, last_request_at: now.toISOString() })
      .eq('id', currentRecord.id);
    return { allowed: true, remaining: maxRequests - 1 };
  }

  // 5. Inside window, check limit
  if (currentRecord.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  // 6. Inside window, under limit, increment count
  await supabaseAdmin
    .from('rate_limits')
    .update({ count: currentRecord.count + 1, last_request_at: now.toISOString() })
    .eq('id', currentRecord.id);

  return { allowed: true, remaining: maxRequests - (currentRecord.count + 1) };
}
