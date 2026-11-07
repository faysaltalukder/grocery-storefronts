-- Owner-authorized wholesale quotation responses through a narrowly scoped RPC.
-- The customer-facing quote submission RPC remains separate and public.
CREATE OR REPLACE FUNCTION builder.respond_to_storefront_quote_request(
  p_quote_id uuid,
  p_status text,
  p_quoted_amount numeric DEFAULT 0,
  p_valid_until date DEFAULT NULL,
  p_response_notes text DEFAULT ''
)
RETURNS SETOF builder.quote_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, builder, auth
AS $function$
DECLARE
  v_user_id uuid;
  v_row builder.quote_requests%ROWTYPE;
  v_amount numeric := COALESCE(p_quoted_amount, 0);
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication is required to respond to a quotation.';
  END IF;

  IF p_status IS NULL OR p_status NOT IN ('requested','reviewing','quoted','approved','rejected','closed') THEN
    RAISE EXCEPTION 'Invalid quotation status.';
  END IF;
  IF v_amount::text IN ('NaN','Infinity','-Infinity') OR v_amount < 0 THEN
    RAISE EXCEPTION 'Quotation amount cannot be negative.';
  END IF;
  IF p_status = 'quoted' AND v_amount <= 0 THEN
    RAISE EXCEPTION 'A positive quotation amount is required before marking a request as quoted.';
  END IF;
  IF p_valid_until IS NOT NULL AND p_valid_until < CURRENT_DATE THEN
    RAISE EXCEPTION 'Quotation expiry date cannot be in the past.';
  END IF;
  IF length(COALESCE(p_response_notes,'')) > 2000 THEN
    RAISE EXCEPTION 'Quotation response notes are too long.';
  END IF;

  UPDATE builder.quote_requests AS q
  SET status = p_status,
      quoted_amount = v_amount,
      valid_until = p_valid_until,
      response_notes = COALESCE(p_response_notes,''),
      updated_at = now()
  FROM builder.websites AS w
  WHERE q.id = p_quote_id
    AND q.owner_id = v_user_id
    AND w.id = q.website_id
    AND w.owner_id = v_user_id
  RETURNING q.* INTO v_row;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quotation not found or not owned by the authenticated user.';
  END IF;

  RETURN NEXT v_row;
END;
$function$;

REVOKE ALL ON FUNCTION builder.respond_to_storefront_quote_request(uuid,text,numeric,date,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION builder.respond_to_storefront_quote_request(uuid,text,numeric,date,text) FROM anonymous;
GRANT EXECUTE ON FUNCTION builder.respond_to_storefront_quote_request(uuid,text,numeric,date,text) TO authenticated;
