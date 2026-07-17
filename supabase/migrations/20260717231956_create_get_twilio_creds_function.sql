-- Function to read Twilio credentials from vault (only callable by service role)
CREATE OR REPLACE FUNCTION public.get_twilio_creds()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sid_val TEXT;
  token_val TEXT;
  number_val TEXT;
BEGIN
  SELECT decrypted_secret INTO sid_val FROM vault.decrypted_secrets WHERE name = 'TWILIO_ACCOUNT_SID' LIMIT 1;
  SELECT decrypted_secret INTO token_val FROM vault.decrypted_secrets WHERE name = 'TWILIO_AUTH_TOKEN' LIMIT 1;
  SELECT decrypted_secret INTO number_val FROM vault.decrypted_secrets WHERE name = 'TWILIO_WHATSAPP_NUMBER' LIMIT 1;

  IF sid_val IS NULL OR token_val IS NULL OR number_val IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN json_build_object(
    'sid', sid_val,
    'token', token_val,
    'number', number_val
  );
END;
$$;

-- Revoke access from anon and authenticated, only service role (superuser) can call
REVOKE EXECUTE ON FUNCTION public.get_twilio_creds() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_twilio_creds() TO service_role;
