CREATE OR REPLACE FUNCTION builder.central_record_order_payment(p_order_id uuid, p_amount numeric, p_method text DEFAULT 'cod'::text, p_reference text DEFAULT ''::text, p_notes text DEFAULT ''::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'builder', 'auth'
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_order builder.orders%ROWTYPE;
  v_collected numeric;
  v_due numeric;
  v_payment builder.payment_transactions%ROWTYPE;
  v_status text;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501'; END IF;
  SELECT * INTO v_order FROM builder.orders WHERE id=p_order_id AND owner_id=v_user FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found' USING ERRCODE='P0002'; END IF;
  IF COALESCE(v_order.notes,'') LIKE '[DEMO ORDER%' THEN
    RAISE EXCEPTION 'Demo orders are test records; payment collection is disabled' USING ERRCODE='22023';
  END IF;
  IF v_order.status='cancelled' THEN RAISE EXCEPTION 'Payment cannot be recorded against a cancelled order' USING ERRCODE='22023'; END IF;
  IF p_amount IS NULL OR p_amount::text IN ('NaN','Infinity','-Infinity') OR p_amount<=0 THEN RAISE EXCEPTION 'Payment amount must be a finite value greater than zero' USING ERRCODE='22023'; END IF;
  IF p_method NOT IN ('cod','cash','bank','mobile_wallet','manual') THEN RAISE EXCEPTION 'Unsupported manual payment method' USING ERRCODE='22023'; END IF;
  IF length(COALESCE(p_reference,''))>120 OR length(COALESCE(p_notes,''))>500 THEN RAISE EXCEPTION 'Payment reference or notes are too long' USING ERRCODE='22023'; END IF;
  SELECT COALESCE(sum(amount),0) INTO v_collected FROM builder.payment_transactions WHERE order_id=p_order_id AND transaction_type='collection' AND status='confirmed';
  v_due:=GREATEST(v_order.total-v_collected,0);
  IF p_amount>v_due THEN RAISE EXCEPTION 'Payment exceeds the outstanding balance of %',v_due USING ERRCODE='22023'; END IF;
  INSERT INTO builder.payment_transactions(owner_id,website_id,order_id,payment_method,transaction_type,amount,reference,notes,status)
  VALUES(v_user,v_order.website_id,p_order_id,p_method,'collection',p_amount,left(COALESCE(p_reference,''),120),left(COALESCE(p_notes,''),500),'confirmed')
  RETURNING * INTO v_payment;
  v_collected:=v_collected+p_amount;
  v_status:=CASE WHEN v_collected>=v_order.total THEN 'paid' WHEN v_collected>0 THEN 'partially_paid' ELSE 'unpaid' END;
  UPDATE builder.orders SET payment_status=v_status WHERE id=p_order_id;
  INSERT INTO builder.finance_entries(owner_id,website_id,entry_type,category,amount,description,reference_type,reference_id)
  VALUES(v_user,v_order.website_id,'income','Order collection',p_amount,'Payment collected for order '||v_order.order_number,'order',p_order_id);
  RETURN jsonb_build_object('payment_id',v_payment.id,'order_id',p_order_id,'collected',v_collected,'due',GREATEST(v_order.total-v_collected,0),'payment_status',v_status);
END;
$function$;

CREATE OR REPLACE FUNCTION builder.track_storefront_order(p_website_slug text, p_order_number text, p_phone text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'builder'
AS $function$
DECLARE
 v_order builder.orders%ROWTYPE;
 v_website builder.websites%ROWTYPE;
 v_items jsonb;
 v_phone text;
BEGIN
 SELECT * INTO v_website FROM builder.websites WHERE slug=p_website_slug AND status='published';
 IF NOT FOUND THEN RETURN NULL; END IF;
 SELECT * INTO v_order FROM builder.orders WHERE website_id=v_website.id AND upper(order_number)=upper(trim(p_order_number));
 IF NOT FOUND THEN RETURN NULL; END IF;
 v_phone:=regexp_replace(COALESCE(v_order.customer->>'phone',v_order.shipping_address->>'phone',''),'[^0-9]','','g');
 IF v_phone='' OR v_phone<>regexp_replace(COALESCE(p_phone,''),'[^0-9]','','g') THEN RETURN NULL; END IF;
 SELECT COALESCE(jsonb_agg(jsonb_build_object('product',product_snapshot,'quantity',quantity,'unit_price',unit_price,'line_total',line_total) ORDER BY id),'[]'::jsonb)
 INTO v_items FROM builder.order_items WHERE order_id=v_order.id;
 RETURN jsonb_build_object('order_number',v_order.order_number,'status',v_order.status,'payment_status',v_order.payment_status,'total',v_order.total,'created_at',v_order.created_at,'demo',COALESCE(v_order.notes,'') LIKE '[DEMO ORDER%','items',v_items);
END;
$function$;

COMMENT ON FUNCTION builder.central_record_order_payment(uuid,numeric,text,text,text) IS 'Owner-only payment collection; refuses DEMO test orders.';
COMMENT ON FUNCTION builder.track_storefront_order(text,text,text) IS 'Public order lookup by exact order number and matching phone; returns a demo flag for test orders.';
