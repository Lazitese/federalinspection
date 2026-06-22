-- Drop old function
DROP FUNCTION IF EXISTS public.join_team_via_qr(UUID, TEXT);

-- Create new RPC
CREATE OR REPLACE FUNCTION public.join_period_via_qr(p_period_id UUID, p_full_name TEXT)
RETURNS boolean AS $$
DECLARE
  v_phone_number TEXT;
BEGIN
  -- Get the current authenticated user's phone number
  SELECT raw_user_meta_data->>'phone' INTO v_phone_number 
  FROM auth.users 
  WHERE id = auth.uid();
  
  -- If not in metadata, try getting it from phone column
  IF v_phone_number IS NULL THEN
    SELECT phone INTO v_phone_number FROM auth.users WHERE id = auth.uid();
  END IF;

  -- Upsert into public.users
  INSERT INTO public.users (id, phone_number, full_name)
  VALUES (auth.uid(), v_phone_number, p_full_name)
  ON CONFLICT (id) DO UPDATE 
  SET full_name = EXCLUDED.full_name,
      phone_number = EXCLUDED.phone_number;

  -- Add to period_members with default role 'regular'
  INSERT INTO public.period_members (period_id, user_id, role)
  VALUES (p_period_id, auth.uid(), 'regular')
  ON CONFLICT (period_id, user_id) DO NOTHING;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
