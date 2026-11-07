-- Production checkout reliability: replay-safe orders plus a conservative per-phone rate limit.
-- This migration is additive. It does not modify existing orders, products, or policies.

CREATE TABLE IF NOT EXISTS builder.storefront_idempotency_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id uuid NOT NULL REFERENCES builder.websites(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  idempotency_key text NOT NULL,
  request_hash text NOT NULL,
  response jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT storefront_idempotency_key_length CHECK (length(idempotency_key) BETWEEN 16 AND 128),
  CONSTRAINT storefront_idempotency_hash_length CHECK (length(request_hash)=32),
  CONSTRAINT storefront_idempotency_site_key_unique UNIQUE (website_id,idempotency_key)
);

CREATE TABLE IF NOT EXISTS builder.storefront_checkout_rate_limits (
  website_id uuid NOT NULL REFERENCES builder.websites(id) ON DELETE CASCADE,
  customer_key_hash text NOT NULL,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  request_count integer NOT NULL DEFAULT 0 CHECK (request_count >= 0),
  PRIMARY KEY (website_id,customer_key_hash)
);

ALTER TABLE builder.storefront_idempotency_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder.storefront_checkout_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE builder.storefront_idempotency_keys FROM PUBLIC;
REVOKE ALL ON TABLE builder.storefront_idempotency_keys FROM anonymous;
REVOKE ALL ON TABLE builder.storefront_idempotency_keys FROM authenticated;
REVOKE ALL ON TABLE builder.storefront_checkout_rate_limits FROM PUBLIC;
REVOKE ALL ON TABLE builder.storefront_checkout_rate_limits FROM anonymous;
REVOKE ALL ON TABLE builder.storefront_checkout_rate_limits FROM authenticated;

CREATE OR REPLACE FUNCTION builder.place_storefront_order_idempotent(
  p_website_slug text,
  p_items jsonb,
  p_customer jsonb,
  p_shipping_address jsonb,
  p_notes text,
  p_idempotency_key text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'builder', 'auth'
AS $function$
DECLARE
  v_website builder.websites%ROWTYPE;
  v_key text := trim(COALESCE(p_idempotency_key,''));
  v_hash text;
  v_existing_hash text;
  v_response jsonb;
  v_phone text;
  v_phone_hash text;
  v_attempts integer;
BEGIN
  IF v_key !~ '^[A-Za-z0-9._:-]{16,128}$' THEN
    RAISE EXCEPTION 'A valid checkout idempotency key is required' USING ERRCODE='22023';
  END IF;

  SELECT * INTO v_website
  FROM builder.websites
  WHERE slug=p_website_slug AND status='published';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'This storefront is not published' USING ERRCODE='P0002';
  END IF;

  v_hash:=md5(concat_ws(E'\\n',COALESCE(p_items::text,''),COALESCE(p_customer::text,''),COALESCE(p_shipping_address::text,''),COALESCE(p_notes,'')));
  PERFORM pg_advisory_xact_lock(hashtextextended(v_website.id::text||':'||v_key,0));

  SELECT request_hash,response
  INTO v_existing_hash,v_response
  FROM builder.storefront_idempotency_keys
  WHERE website_id=v_website.id AND idempotency_key=v_key
  FOR UPDATE;

  IF FOUND THEN
    IF v_existing_hash<>v_hash THEN
      RAISE EXCEPTION 'This checkout key has already been used with different order details' USING ERRCODE='22023';
    END IF;
    RETURN v_response;
  END IF;

  -- Count only new order attempts; retries with the same key returned above.
  v_phone:=regexp_replace(COALESCE(p_customer->>'phone',''),'[^0-9]','','g');
  IF length(v_phone)<7 THEN
    RAISE EXCEPTION 'A valid customer phone number is required' USING ERRCODE='22023';
  END IF;
  v_phone_hash:=md5(v_phone);

  INSERT INTO builder.storefront_checkout_rate_limits(
    website_id,customer_key_hash,window_started_at,request_count
  ) VALUES (v_website.id,v_phone_hash,now(),1)
  ON CONFLICT (website_id,customer_key_hash)
  DO UPDATE SET
    window_started_at=CASE
      WHEN builder.storefront_checkout_rate_limits.window_started_at <= now()-interval '15 minutes' THEN now()
      ELSE builder.storefront_checkout_rate_limits.window_started_at
    END,
    request_count=CASE
      WHEN builder.storefront_checkout_rate_limits.window_started_at <= now()-interval '15 minutes' THEN 1
      ELSE builder.storefront_checkout_rate_limits.request_count+1
    END
  RETURNING request_count INTO v_attempts;

  IF v_attempts>8 THEN
    RAISE EXCEPTION 'Too many checkout attempts. Please wait 15 minutes before trying again.' USING ERRCODE='P0001';
  END IF;

  v_response:=builder.place_storefront_order(
    p_website_slug,p_items,p_customer,p_shipping_address,COALESCE(p_notes,'')
  );

  INSERT INTO builder.storefront_idempotency_keys(
    website_id,owner_id,idempotency_key,request_hash,response
  )
  VALUES(v_website.id,v_website.owner_id,v_key,v_hash,v_response);

  RETURN v_response;
END;
$function$;

REVOKE ALL ON FUNCTION builder.place_storefront_order_idempotent(text,jsonb,jsonb,jsonb,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION builder.place_storefront_order_idempotent(text,jsonb,jsonb,jsonb,text,text) FROM anonymous;
REVOKE ALL ON FUNCTION builder.place_storefront_order_idempotent(text,jsonb,jsonb,jsonb,text,text) FROM authenticated;
GRANT EXECUTE ON FUNCTION builder.place_storefront_order_idempotent(text,jsonb,jsonb,jsonb,text,text) TO anonymous;
GRANT EXECUTE ON FUNCTION builder.place_storefront_order_idempotent(text,jsonb,jsonb,jsonb,text,text) TO authenticated;
