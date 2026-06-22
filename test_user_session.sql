BEGIN;
set local role authenticated;
set local request.jwt.claims = '{"sub":"19224308-095e-497f-85d5-2a35067b6727"}';
select auth.uid();
SELECT id, period_id, user_id, role::text, created_at FROM public.period_members;
SELECT * FROM public.assessment_periods;
COMMIT;
