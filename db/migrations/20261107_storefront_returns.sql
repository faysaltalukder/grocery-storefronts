-- Storefront customer return intake.
-- Additive migration: reuses the existing return_requests table and does not alter or delete business data.
CREATE OR REPLACE FUNCTION builder.submit_storefront_return_request(
  p_website_slug text,
  p_order_number text,
  p_phone text,
  p_reason text,
  p_notes text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'builder'
AS $function$
DECLARE
  v_website builder.websites%ROWTYPE;
  v_order builder.orders%ROWTYPE;
  v_phone text;
  v_saved_phone text;
  v_reason text;
  v_request_id uuid;
BEGIN
  IF COALESCE(trim(p_website_slug), '') = ''
     OR COALESCE(trim(p_order_number), '') = '' THEN
    RAISE EXCEPTION 'Enter the order number and store address' USING ERRCODE='22023';
  END IF;

  v_phone := regexp_replace(COALESCE(p_phone, ''), '[^0-9]', '', 'g');
  IF length(v_phone) < 7 OR length(v_phone) > 20 THEN
    RAISE EXCEPTION 'Enter the phone number used for the order' USING ERRCODE='22023';
  END IF;

  v_reason := trim(COALESCE(p_reason, ''));
  IF length(v_reason) < 5 OR length(v_reason) > 1000 THEN
    RAISE EXCEPTION 'Please describe the return reason in 5 to 1000 characters' USING ERRCODE='22023';
  END IF;

  SELECT * INTO v_website
  FROM builder.websites
  WHERE slug = trim(p_website_slug) AND status = 'published'
  FOR SHARE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'This storefront is not available' USING ERRCODE='P0002';
  END IF;

  SELECT * INTO v_order
  FROM builder.orders
  WHERE website_id = v_website.id
    AND upper(order_number) = upper(trim(p_order_number))
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No order matched those details' USING ERRCODE='P0002';
  END IF;

  v_saved_phone := regexp_replace(
    COALESCE(v_order.customer->>'phone', v_order.shipping_address->>'phone', ''),
    '[^0-9]', '', 'g'
  );

  IF v_saved_phone = '' OR v_saved_phone <> v_phone THEN
    RAISE EXCEPTION 'No order matched those details' USING ERRCODE='P0002';
  END IF;

  IF v_order.status <> 'delivered' THEN
    RAISE EXCEPTION 'A return request can be submitted after the order is delivered. Contact the store for urgent help.' USING ERRCODE='22023';
  END IF;

  IF EXISTS (
    SELECT 1 FROM builder.return_requests
    WHERE order_id = v_order.id
      AND status IN ('requested', 'approved', 'received')
  ) THEN
    RAISE EXCEPTION 'A return request is already being handled for this order' USING ERRCODE='22023';
  END IF;

  INSERT INTO builder.return_requests(
    owner_id, website_id, order_id, customer_name, customer_phone,
    reason, status, refund_amount, notes
  )
  VALUES(
    v_website.owner_id, v_website.id, v_order.id,
    left(COALESCE(v_order.customer->>'name', ''), 160),
    v_phone, v_reason, 'requested', 0,
    left(trim(COALESCE(p_notes, '')), 1000)
  )
  RETURNING id INTO v_request_id;

  RETURN jsonb_build_object(
    'id', v_request_id,
    'order_number', v_order.order_number,
    'status', 'requested',
    'message', 'Your return request has been sent to the store for review.'
  );
END;
$function$;

GRANT EXECUTE ON FUNCTION builder.submit_storefront_return_request(text, text, text, text, text) TO anonymous, authenticated;
