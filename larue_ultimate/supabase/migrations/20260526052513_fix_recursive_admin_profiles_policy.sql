/*
  # Fix recursive RLS policy on profiles table

  ## Problem
  The "Admins can read all profiles" policy uses a subquery that references the
  profiles table itself, causing infinite recursion when Supabase evaluates it.
  This crashes auth with "Database error querying schema".

  ## Fix
  1. Create a SECURITY DEFINER function that bypasses RLS to check the caller's role.
     This breaks the recursion by reading the role without triggering RLS policies.
  2. Drop the two broken recursive admin policies (SELECT and UPDATE).
  3. Recreate them using the safe helper function.
*/

-- Helper function that reads the current user's role bypassing RLS (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Drop the recursive policies
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Recreate using the non-recursive helper
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');
