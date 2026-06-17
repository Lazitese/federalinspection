-- Grant permissions for feedbacks table so PostgREST and service_role can access them
GRANT ALL ON TABLE public.feedbacks TO anon, authenticated, service_role;
