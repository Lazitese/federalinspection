-- RPC to allow authenticated users to join a team via QR code link
CREATE OR REPLACE FUNCTION public.join_team_via_qr(p_team_id UUID, p_full_name TEXT)
RETURNS boolean AS $$
DECLARE
  v_phone_number TEXT;
BEGIN
  -- Get phone number from auth.users (requires superuser/postgres role privileges, but functions run as security definer)
  -- Wait, auth.users is accessible from security definer if search_path includes auth or we fully qualify.
  -- Better yet, auth.jwt() could have phone, or auth.users view.
  -- But since this is a security definer in public, we can select from auth.users if granted.
  -- Actually, the user can just pass the phone number, and we'll upsert into public.users.
  
  -- Upsert public.users
  INSERT INTO public.users (id, phone_number, full_name)
  VALUES (auth.uid(), auth.jwt()->>'phone', p_full_name)
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

  -- Insert into team_members
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (p_team_id, auth.uid(), 'regular')
  ON CONFLICT (team_id, user_id) DO NOTHING;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;
