-- Fix infinite recursion in clients RLS policy
-- parents_view_dependents used inline subquery on clients table,
-- which triggered the same RLS policies causing infinite recursion.
-- Replace with get_client_id() SECURITY DEFINER function.

DROP POLICY IF EXISTS "parents_view_dependents" ON clients;

CREATE POLICY "parents_view_dependents" ON clients
  FOR SELECT USING (parent_id = get_client_id());
