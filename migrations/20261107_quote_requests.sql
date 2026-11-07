-- Additive B2B quote-request persistence for the four isolated grocery storefronts.
-- This migration creates new objects only and does not alter or delete existing commerce data.

CREATE TABLE IF NOT EXISTS builder.quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  website_id uuid NOT NULL REFERENCES builder.websites(id) ON DELETE CASCADE,
  quote_number text NOT NULL UNIQUE,
  business_name text NOT NULL,
  contact_name text NOT NULL,
  business_type text NOT NULL DEFAULT '',
  phone text NOT NULL,
  email text NOT NULL DEFAULT '',
  tax_id text NOT NULL DEFAULT '',
  requested_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested','reviewing','quoted','approved','rejected','converted','closed')),
  response_notes text NOT NULL DEFAULT '',
  quoted_amount numeric NOT NULL DEFAULT 0 CHECK (quoted_amount >= 0),
  valid_until date,
  converted_order_id uuid REFERENCES builder.orders(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quote_requests_items_array CHECK (jsonb_typeof(requested_items) = 'array')
);

CREATE INDEX IF NOT EXISTS quote_requests_site_created_idx
  ON builder.quote_requests (website_id, created_at DESC);
CREATE INDEX IF NOT EXISTS quote_requests_owner_status_idx
  ON builder.quote_requests (owner_id, status, created_at DESC);

ALTER TABLE builder.quote_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS quote_requests_owner_select ON builder.quote_requests;
CREATE POLICY quote_requests_owner_select
  ON builder.quote_requests
  FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM builder.websites w
      WHERE w.id = quote_requests.website_id
        AND w.owner_id = auth.uid()
    )
  );

GRANT SELECT ON builder.quote_requests TO authenticated;

CREATE OR REPLACE FUNCTION builder.submit_storefront_quote_request(
  p_website_slug text,
  p_business jsonb,
  p_items jsonb,
  p_notes text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'builder'
AS $function$
DECLARE
  v_website builder.websites%ROWTYPE;
  v_business_name text;
  v_contact_name text;
  v_phone text;
  v_email text;
  v_quote_number text;
  v_quote_id uuid;
BEGIN
  IF COALESCE(trim(p_website_slug), '') = '' THEN
    RAISE EXCEPTION 'Storefront address is required' USING ERRCODE = '22023';
  END IF;
  IF p_business IS NULL OR jsonb_typeof(p_business) <> 'object' THEN
    RAISE EXCEPTION 'Business contact details are required' USING ERRCODE = '22023';
  END IF;
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array'
     OR jsonb_array_length(p_items) < 1 OR jsonb_array_length(p_items) > 100 THEN
    RAISE EXCEPTION 'Add between 1 and 100 requested items' USING ERRCODE = '22023';
  END IF;

  v_business_name := left(trim(COALESCE(p_business->>'company_name', p_business->>'business_name', '')), 180);
  v_contact_name := left(trim(COALESCE(p_business->>'contact_name', p_business->>'name', '')), 160);
  v_phone := regexp_replace(COALESCE(p_business->>'phone', ''), '[^0-9]', '', 'g');
  v_email := left(trim(COALESCE(p_business->>'email', '')), 254);

  IF v_business_name = '' OR v_contact_name = '' THEN
    RAISE EXCEPTION 'Business name and contact name are required' USING ERRCODE = '22023';
  END IF;
  IF length(v_phone) < 7 OR length(v_phone) > 20 THEN
    RAISE EXCEPTION 'Enter a valid business contact phone number' USING ERRCODE = '22023';
  END IF;
  IF v_email <> '' AND v_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$' THEN
    RAISE EXCEPTION 'Enter a valid business email address' USING ERRCODE = '22023';
  END IF;
  IF length(COALESCE(p_notes, '')) > 2000 THEN
    RAISE EXCEPTION 'Enquiry notes are too long' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_website
  FROM builder.websites
  WHERE slug = trim(p_website_slug) AND status = 'published'
  FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'This storefront is not accepting business enquiries' USING ERRCODE = 'P0002';
  END IF;

  v_quote_number := 'QT-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
  INSERT INTO builder.quote_requests (
    owner_id, website_id, quote_number, business_name, contact_name,
    business_type, phone, email, tax_id, requested_items, notes
  )
  VALUES (
    v_website.owner_id, v_website.id, v_quote_number, v_business_name, v_contact_name,
    left(trim(COALESCE(p_business->>'business_type', '')), 100),
    v_phone, v_email, left(trim(COALESCE(p_business->>'tax_id', '')), 100),
    p_items, left(trim(COALESCE(p_notes, '')), 2000)
  )
  RETURNING id INTO v_quote_id;

  RETURN jsonb_build_object(
    'id', v_quote_id,
    'quote_number', v_quote_number,
    'status', 'requested',
    'message', 'Your business quote request has been received. The store team will review it.'
  );
END;
$function$;

GRANT EXECUTE ON FUNCTION builder.submit_storefront_quote_request(text, jsonb, jsonb, text)
  TO anonymous, authenticated;
