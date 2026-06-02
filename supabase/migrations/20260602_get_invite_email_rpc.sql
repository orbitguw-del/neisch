CREATE OR REPLACE FUNCTION public.get_invite_email(p_invite_code text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email
  FROM public.pending_invites
  WHERE invite_code  = upper(trim(p_invite_code))
    AND accepted_at  IS NULL
    AND expires_at   > now();
$$;

GRANT EXECUTE ON FUNCTION public.get_invite_email(text) TO anon, authenticated;
