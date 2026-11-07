-- Idempotent public checkout wrapper.
-- Keeps the existing checkout implementation and protects retries from duplicate orders.

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

ALTER TABLE builder.storefront_idempotency_keys ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE builder.storefront_idempotency_keys FROM PUBLIC;
REVOKE ALL ON TABLE builder.storefront_idempotency_keys FROM anonymous;
REVOKE ALL ON TABLE builder.storefront_idempotency_keys FROM authenticated;

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

  v_hash:=md5(concat_ws(E'\n',COALESCE(p_items::text,''),COALESCE(p_customer::text,''),COALESCE(p_shipping_address::text,''),COALESCE(p_notes,'')));
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
GRANT EXECUTE ON FUNCTION builder.place_storefront_order_idempotent(text,jsonb,jsonb,jsonb,text,text) TO anonymous;
GRANT EXECUTE ON FUNCTION builder.place_storefront_order_idempotent(text,jsonb,jsonb,jsonb,text,text) TO authenticated;
