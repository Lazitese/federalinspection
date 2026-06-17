CREATE TABLE public.qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  active BOOLEAN DEFAULT true,
  duration TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.scan_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_device TEXT NOT NULL,
  file_name TEXT NOT NULL,
  ip_address TEXT,
  status TEXT DEFAULT 'Pending',
  approver_name TEXT,
  duration_granted TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- RLS policies
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated full access to qr_codes"
ON public.qr_codes FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated full access to scan_requests"
ON public.scan_requests FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Insert initial active QR code
INSERT INTO public.qr_codes (duration, expires_at)
VALUES ('24h', NOW() + INTERVAL '24 hours');
