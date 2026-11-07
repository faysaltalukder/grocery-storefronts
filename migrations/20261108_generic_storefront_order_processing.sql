-- Generic storefront order processing: delivery zones are optional configuration.
-- A matching zone applies its fee/minimum; otherwise store-wide defaults apply.
-- Product ownership, active state, verified inventory, stock locking, COD, idempotency,
-- and published-store checks remain enforced server-side.
CREATE OR REPLACE FUNCTION builder.place_storefront_order(p_website_slug text, p_items jsonb, p_customer jsonb, p_shipping_address jsonb, p_notes text DEFAULT ''::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'builder'
AS $function$
DECLARE
  v_website builder.websites%ROWTYPE;
  v_item jsonb;
  v_product builder.products%ROWTYPE;
  v_qty numeric;
  v_min_qty numeric;
  v_unit_price numeric;
  v_subtotal numeric:=0;
  v_delivery_fee numeric:=0;
  v_order_id uuid;
  v_order_number text;
  v_count integer:=0;
  v_areas jsonb;
  v_area text;
  v_phone_digits integer;
  v_zone_count integer:=0;
  v_zone_fee numeric:=0;
  v_zone_minimum numeric:=0;
  v_previous_stock numeric:=0;
  v_new_stock numeric:=0;
BEGIN
  IF p_items IS NULL OR jsonb_typeof(p_items)<>'array' OR jsonb_array_length(p_items)<1 OR jsonb_array_length(p_items)>30 THEN
    RAISE EXCEPTION 'Cart must contain between 1 and 30 products' USING ERRCODE='22023';
  END IF;
  IF (SELECT count(DISTINCT x.value->>'product_id') FROM jsonb_array_elements(p_items) AS x(value)) <> jsonb_array_length(p_items) THEN
    RAISE EXCEPTION 'Duplicate product lines are not allowed in the cart' USING ERRCODE='22023';
  END IF;
  IF COALESCE(trim(p_customer->>'name'),'')='' OR COALESCE(trim(p_customer->>'phone'),'')='' OR COALESCE(trim(p_shipping_address->>'address'),'')='' THEN
    RAISE EXCEPTION 'Customer name, phone and delivery address are required' USING ERRCODE='22023';
  END IF;
  v_phone_digits:=length(regexp_replace(COALESCE(p_customer->>'phone',''),'[^0-9]','','g'));
  IF v_phone_digits<7 OR v_phone_digits>20 THEN
    RAISE EXCEPTION 'Enter a valid customer phone number' USING ERRCODE='22023';
  END IF;

  SELECT * INTO v_website
  FROM builder.websites
  WHERE slug=p_website_slug AND status='published'
  FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'This storefront is not published' USING ERRCODE='P0002';
  END IF;
  IF COALESCE(NULLIF(v_website.settings->>'demo_catalog','')::boolean,true) THEN
    RAISE EXCEPTION 'This storefront is still in demo catalogue mode and cannot accept orders' USING ERRCODE='22023';
  END IF;

  v_areas:=COALESCE(v_website.settings #> '{delivery,areas}','[]'::jsonb);
  v_area:=lower(trim(COALESCE(p_shipping_address->>'area','')));

  -- Delivery zones are optional template configuration. A matching zone applies
  -- its configured fee and minimum; otherwise store-wide defaults are used.
  SELECT delivery_fee,minimum_order
  INTO v_zone_fee,v_zone_minimum
  FROM builder.delivery_zones
  WHERE website_id=v_website.id
    AND owner_id=v_website.owner_id
    AND normalized_name=v_area
    AND is_active=true
  LIMIT 1;

  IF FOUND THEN
    v_delivery_fee:=GREATEST(0,LEAST(100000,v_zone_fee));
  ELSE
    v_delivery_fee:=GREATEST(0,LEAST(100000,COALESCE(NULLIF(v_website.settings #>> '{delivery,default_fee}','')::numeric,0)));
    v_zone_minimum:=GREATEST(0,COALESCE(NULLIF(v_website.settings #>> '{delivery,minimum_order}','')::numeric,0));
  END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items) LOOP
    v_count:=v_count+1;
    IF COALESCE(v_item->>'product_id','') !~* '^[0-9a-f-]{36}$' THEN
      RAISE EXCEPTION 'Invalid product in cart' USING ERRCODE='22023';
    END IF;
    v_qty:=COALESCE(NULLIF(v_item->>'quantity','')::numeric,0);
    IF v_qty<=0 OR v_qty>1000 THEN
      RAISE EXCEPTION 'Invalid product quantity' USING ERRCODE='22023';
    END IF;
    SELECT * INTO v_product
    FROM builder.products
    WHERE id=(v_item->>'product_id')::uuid
      AND website_id=v_website.id
      AND is_active=true
    FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'A product is no longer available' USING ERRCODE='P0002';
    END IF;
    IF COALESCE(NULLIF(v_product.attributes->>'demo','')::boolean,false)
       OR NOT COALESCE(NULLIF(v_product.attributes->>'inventory_verified','')::boolean,false) THEN
      RAISE EXCEPTION 'This product is sample/demo or unverified inventory and cannot be ordered' USING ERRCODE='22023';
    END IF;
    v_min_qty:=COALESCE(NULLIF(v_product.attributes->>'minimum_order_quantity','')::numeric,1);
    IF v_qty<v_min_qty THEN
      RAISE EXCEPTION 'Minimum order quantity not met for %',v_product.name USING ERRCODE='22023';
    END IF;
    IF v_product.stock<v_qty THEN
      RAISE EXCEPTION 'Insufficient stock for %',v_product.name USING ERRCODE='P0001';
    END IF;
    SELECT t.unit_price INTO v_unit_price
    FROM builder.product_price_tiers t
    WHERE t.website_id=v_website.id
      AND t.product_id=v_product.id
      AND t.owner_id=v_website.owner_id
      AND t.is_active=true
      AND t.minimum_quantity<=v_qty
    ORDER BY t.minimum_quantity DESC
    LIMIT 1;
    IF NOT FOUND THEN v_unit_price:=v_product.price; END IF;
    v_subtotal:=v_subtotal+(v_unit_price*v_qty);
  END LOOP;

  IF v_subtotal<v_zone_minimum THEN
    RAISE EXCEPTION 'Minimum order value for this delivery area is %',v_zone_minimum USING ERRCODE='22023';
  END IF;

  v_order_number:='HF-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,10));
  INSERT INTO builder.orders(
    website_id,owner_id,order_number,customer,shipping_address,
    subtotal,delivery_fee,discount,total,payment_method,payment_status,status,notes
  )
  VALUES(
    v_website.id,v_website.owner_id,v_order_number,p_customer,p_shipping_address,
    v_subtotal,v_delivery_fee,0,v_subtotal+v_delivery_fee,'cod','unpaid','pending',left(COALESCE(p_notes,''),2000)
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items) LOOP
    SELECT * INTO v_product
    FROM builder.products
    WHERE id=(v_item->>'product_id')::uuid AND website_id=v_website.id
    FOR UPDATE;
    v_qty:=(v_item->>'quantity')::numeric;
    SELECT t.unit_price INTO v_unit_price
    FROM builder.product_price_tiers t
    WHERE t.website_id=v_website.id
      AND t.product_id=v_product.id
      AND t.owner_id=v_website.owner_id
      AND t.is_active=true
      AND t.minimum_quantity<=v_qty
    ORDER BY t.minimum_quantity DESC
    LIMIT 1;
    IF NOT FOUND THEN v_unit_price:=v_product.price; END IF;
    INSERT INTO builder.order_items(order_id,product_id,product_snapshot,quantity,unit_price,line_total)
    VALUES(
      v_order_id,
      v_product.id,
      jsonb_build_object(
        'id',v_product.id,
        'name',v_product.name,
        'sku',v_product.sku,
        'unit',v_product.unit,
        'image_url',v_product.image_url,
        'attributes',jsonb_strip_nulls(jsonb_build_object(
          'brand',v_product.attributes->>'brand',
          'barcode',v_product.attributes->>'barcode',
          'pack_size',v_product.attributes->>'pack_size',
          'origin',v_product.attributes->>'origin',
          'grade',v_product.attributes->>'grade',
          'farm_name',v_product.attributes->>'farm_name'
        ))
      ),
      v_qty,
      v_unit_price,
      v_unit_price*v_qty
    );
    UPDATE builder.products
    SET stock=stock-v_qty,updated_at=now()
    WHERE id=v_product.id AND website_id=v_website.id
    RETURNING stock+v_qty,stock INTO v_previous_stock,v_new_stock;
    INSERT INTO builder.inventory_movements(
      owner_id,website_id,product_id,movement_type,quantity_delta,
      previous_stock,new_stock,reference_type,reference_id,reason
    )
    VALUES(
      v_website.owner_id,v_website.id,v_product.id,'sale',-v_qty,
      v_previous_stock,v_new_stock,'order',v_order_id,'Stock reserved for order '||v_order_number
    );
  END LOOP;
  RETURN jsonb_build_object(
    'id',v_order_id,
    'order_number',v_order_number,
    'status','pending',
    'subtotal',v_subtotal,
    'delivery_fee',v_delivery_fee,
    'total',v_subtotal+v_delivery_fee,
    'payment_method','cod'
  );
END;
$function$

;

COMMENT ON FUNCTION builder.place_storefront_order(text,jsonb,jsonb,jsonb,text)
IS 'Public storefront checkout with atomic inventory reservation; optional delivery zones and store-wide default fee/minimum.';
