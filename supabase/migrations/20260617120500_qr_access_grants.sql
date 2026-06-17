-- Grant permissions for QR access tables so PostgREST can access them
GRANT ALL ON TABLE public.qr_codes TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.scan_requests TO anon, authenticated, service_role;
