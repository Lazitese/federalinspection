-- Drop the offending policy
DROP POLICY IF EXISTS "Team members are viewable by members of the same team or admins" ON public.team_members;

-- Create a helper function that bypasses RLS to check team membership
CREATE OR REPLACE FUNCTION public.is_team_member(p_team_id UUID)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = p_team_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Recreate the policy using the security definer function to avoid recursion
CREATE POLICY "Team members are viewable by members of the same team or admins" 
ON public.team_members FOR SELECT USING (
  public.is_assessment_admin() OR
  public.is_team_member(team_id)
);
