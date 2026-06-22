CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  action_type TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  last_request_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(ip_address, action_type)
);

-- Protect rate_limits table so it can only be accessed by service_role or server actions
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- We don't want clients accessing this table directly
DROP POLICY IF EXISTS "Service role full access to rate_limits" ON public.rate_limits;
CREATE POLICY "Service role full access to rate_limits"
  ON public.rate_limits
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant privileges to service_role so it can actually access the table
GRANT ALL ON public.rate_limits TO service_role;

-- Trigger function to enforce rate limits directly on database inserts for complaints
CREATE OR REPLACE FUNCTION public.enforce_complaint_rate_limit()
RETURNS trigger AS $$
DECLARE
  headers json;
  client_ip text;
  req_count int;
BEGIN
  -- Extract IP from Supabase request headers
  headers := current_setting('request.headers', true)::json;
  client_ip := headers->>'x-forwarded-for';
  
  IF client_ip IS NOT NULL THEN
    client_ip := split_part(client_ip, ',', 1);
    
    -- Cleanup old records
    DELETE FROM public.rate_limits WHERE last_request_at < NOW() - INTERVAL '30 minutes';
    
    -- Get current count
    SELECT count INTO req_count FROM public.rate_limits WHERE ip_address = client_ip AND action_type = 'submit_complaint';
    
    IF req_count >= 5 THEN
      RAISE EXCEPTION 'Rate limit exceeded. Please try again later. (Max 5 submissions per 30 minutes)';
    END IF;
    
    IF req_count IS NULL THEN
      INSERT INTO public.rate_limits (ip_address, action_type, count, last_request_at) 
      VALUES (client_ip, 'submit_complaint', 1, NOW());
    ELSE
      UPDATE public.rate_limits 
      SET count = count + 1, last_request_at = NOW() 
      WHERE ip_address = client_ip AND action_type = 'submit_complaint';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to complaints table
DROP TRIGGER IF EXISTS tr_enforce_complaint_rate_limit ON public.complaints;
CREATE TRIGGER tr_enforce_complaint_rate_limit
  BEFORE INSERT ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.enforce_complaint_rate_limit();
