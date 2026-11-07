-- Owner-scoped updates for central wholesale quotation management.
-- Public customers may submit through the SECURITY DEFINER RPC only.
-- This policy does not grant anonymous INSERT/UPDATE/DELETE access.
ALTER TABLE builder.quote_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS quote_requests_owner_update ON builder.quote_requests;
CREATE POLICY quote_requests_owner_update
ON builder.quote_requests
FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM builder.websites w
    WHERE w.id = quote_requests.website_id
      AND w.owner_id = auth.uid()
  )
)
WITH CHECK (
  owner_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM builder.websites w
    WHERE w.id = quote_requests.website_id
      AND w.owner_id = auth.uid()
  )
);

GRANT UPDATE (status, response_notes, quoted_amount, valid_until, updated_at)
ON builder.quote_requests TO authenticated;
