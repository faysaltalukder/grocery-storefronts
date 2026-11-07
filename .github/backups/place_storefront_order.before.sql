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
 v_subtotal numeric:=0;
 v_delivery_fee numeric:=0;
 v_order_id uuid;
 v_order_number text;
 v_count integer:=0;
BEGIN
 IF p_items IS NULL OR jsonb_typeof(p_items)<>'array' OR jsonb_array_length(p_items)<1 OR jsonb_array_length(p_items)>30 THEN
  RAISE EXCEPTION 'Cart must contain between 1 and 30 products' USING ERRCODE='22023';
 END IF;
 IF COALESCE(trim(p_customer->>'name'),'')='' OR COALESCE(trim(p_customer->>'phone'),'')='' OR COALESCE(trim(p_shipping_address->>'address'),'')='' THEN
  RAISE EXCEPTION 'Customer name, phone and delivery address are required' USING ERRCODE='22023';
 END IF;
 SELECT * INTO v_website FROM builder.websites WHERE slug=p_website_slug AND status='published' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'This storefront is not published' USING ERRCODE='P0002'; END IF;
 FOR v_item IN SELECT value FROM jsonb_array_elements(p_items) LOOP
  v_count:=v_count+1;
  IF COALESCE(v_item->>'product_id','') !~* '^[0-9a-f-]{36}$' THEN RAISE EXCEPTION 'Invalid product in cart' USING ERRCODE='22023'; END IF;
  v_qty:=COALESCE(NULLIF(v_item->>'quantity','')::numeric,0);
  IF v_qty<=0 OR v_qty>1000 THEN RAISE EXCEPTION 'Invalid product quantity' USING ERRCODE='22023'; END IF;
  SELECT * INTO v_product FROM builder.products WHERE id=(v_item->>'product_id')::uuid AND website_id=v_website.id AND is_active=true FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'A product is no longer available' USING ERRCODE='P0002'; END IF;
  IF COALESCE((v_product.attributes->>'demo')::boolean,false) THEN
   RAISE EXCEPTION 'This product belongs to the DEMO catalogue and cannot be ordered. The store owner must confirm live products, prices and stock first.' USING ERRCODE='22023';
  END IF;
  v_min_qty:=COALESCE(NULLIF(v_product.attributes->>'minimum_order_quantity','')::numeric,1);
  IF v_qty<v_min_qty THEN RAISE EXCEPTION 'Minimum order quantity not met for %',v_product.name USING ERRCODE='22023'; END IF;
  IF v_product.stock<v_qty THEN RAISE EXCEPTION 'Insufficient stock for %',v_product.name USING ERRCODE='P0001'; END IF;
  v_subtotal:=v_subtotal+(v_product.price*v_qty);
 END LOOP;
 v_delivery_fee:=GREATEST(0,LEAST(100000,COALESCE(NULLIF(v_website.settings #>> '{delivery,default_fee}','')::numeric,0)));
 v_order_number:='HF-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,10));
 INSERT INTO builder.orders(website_id,owner_id,order_number,customer,shipping_address,subtotal,delivery_fee,discount,total,payment_method,payment_status,status,notes)
 VALUES(v_website.id,v_website.owner_id,v_order_number,p_customer,p_shipping_address,v_subtotal,v_delivery_fee,0,v_subtotal+v_delivery_fee,'cod','unpaid','pending',left(COALESCE(p_notes,''),2000))
 RETURNING id INTO v_order_id;
 FOR v_item IN SELECT value FROM jsonb_array_elements(p_items) LOOP
  SELECT * INTO v_product FROM builder.products WHERE id=(v_item->>'product_id')::uuid AND website_id=v_website.id FOR UPDATE;
  v_qty:=(v_item->>'quantity')::numeric;
  INSERT INTO builder.order_items(order_id,product_id,product_snapshot,quantity,unit_price,line_total)
  VALUES(v_order_id,v_product.id,jsonb_build_object('id',v_product.id,'name',v_product.name,'sku',v_product.sku,'unit',v_product.unit,'image_url',v_product.image_url),v_qty,v_product.price,v_product.price*v_qty);
  UPDATE builder.products SET stock=stock-v_qty,updated_at=now() WHERE id=v_product.id AND website_id=v_website.id;
 END LOOP;
 RETURN jsonb_build_object('id',v_order_id,'order_number',v_order_number,'status','pending','subtotal',v_subtotal,'delivery_fee',v_delivery_fee,'total',v_subtotal+v_delivery_fee,'payment_method','cod');
END;
$function$
;
