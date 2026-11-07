-- Refund processing and accurate partial-payment states for Central Commerce.
-- Additive migration: no existing business rows are deleted or rewritten.

CREATE OR REPLACE FUNCTION builder.central_record_order_payment(
  p_order_id uuid,
  p_amount numeric,
  p_method text DEFAULT 'cod',
  p_reference text DEFAULT '',
  p_notes text DEFAULT ''
)
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
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501';
  END IF;
  SELECT * INTO v_order
  FROM builder.orders
  WHERE id=p_order_id AND owner_id=v_user
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found' USING ERRCODE='P0002';
  END IF;
  IF v_order.status='cancelled' THEN
    RAISE EXCEPTION 'Payment cannot be recorded against a cancelled order' USING ERRCODE='22023';
  END IF;
  IF p_amount IS NULL OR p_amount::text IN ('NaN','Infinity','-Infinity') OR p_amount<=0 THEN
    RAISE EXCEPTION 'Payment amount must be a finite value greater than zero' USING ERRCODE='22023';
  END IF;
  IF p_method NOT IN ('cod','cash','bank','mobile_wallet','manual') THEN
    RAISE EXCEPTION 'Unsupported manual payment method' USING ERRCODE='22023';
  END IF;
  IF length(COALESCE(p_reference,''))>120 OR length(COALESCE(p_notes,''))>500 THEN
    RAISE EXCEPTION 'Payment reference or notes are too long' USING ERRCODE='22023';
  END IF;

  SELECT COALESCE(sum(amount),0) INTO v_collected
  FROM builder.payment_transactions
  WHERE order_id=p_order_id AND transaction_type='collection' AND status='confirmed';
  v_due:=GREATEST(v_order.total-v_collected,0);
  IF p_amount>v_due THEN
    RAISE EXCEPTION 'Payment exceeds the outstanding balance of %',v_due USING ERRCODE='22023';
  END IF;

  INSERT INTO builder.payment_transactions(
    owner_id,website_id,order_id,payment_method,transaction_type,amount,reference,notes,status
  )
  VALUES(
    v_user,v_order.website_id,p_order_id,p_method,'collection',p_amount,
    left(COALESCE(p_reference,''),120),left(COALESCE(p_notes,''),500),'confirmed'
  )
  RETURNING * INTO v_payment;

  v_collected:=v_collected+p_amount;
  v_status:=CASE
    WHEN v_collected>=v_order.total THEN 'paid'
    WHEN v_collected>0 THEN 'partially_paid'
    ELSE 'unpaid'
  END;
  UPDATE builder.orders SET payment_status=v_status WHERE id=p_order_id;

  INSERT INTO builder.finance_entries(
    owner_id,website_id,entry_type,category,amount,description,reference_type,reference_id
  )
  VALUES(
    v_user,v_order.website_id,'income','Order collection',p_amount,
    'Payment collected for order '||v_order.order_number,'order',p_order_id
  );

  RETURN jsonb_build_object(
    'payment_id',v_payment.id,'order_id',p_order_id,
    'collected',v_collected,'due',GREATEST(v_order.total-v_collected,0),
    'payment_status',v_status
  );
END;
$function$;

CREATE OR REPLACE FUNCTION builder.central_process_return_refund(
  p_return_id uuid,
  p_amount numeric,
  p_method text DEFAULT 'manual',
  p_reference text DEFAULT '',
  p_notes text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'builder', 'auth'
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_return builder.return_requests%ROWTYPE;
  v_order builder.orders%ROWTYPE;
  v_collected numeric := 0;
  v_refunded numeric := 0;
  v_payment builder.payment_transactions%ROWTYPE;
  v_payment_status text;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501';
  END IF;
  IF p_amount IS NULL OR p_amount::text IN ('NaN','Infinity','-Infinity') OR p_amount<=0 THEN
    RAISE EXCEPTION 'Refund amount must be a finite value greater than zero' USING ERRCODE='22023';
  END IF;
  IF p_method NOT IN ('cod','cash','bank','mobile_wallet','manual') THEN
    RAISE EXCEPTION 'Unsupported refund method' USING ERRCODE='22023';
  END IF;
  IF length(COALESCE(p_reference,''))>120 OR length(COALESCE(p_notes,''))>500 THEN
    RAISE EXCEPTION 'Refund reference or notes are too long' USING ERRCODE='22023';
  END IF;

  SELECT rr.* INTO v_return
  FROM builder.return_requests rr
  JOIN builder.websites w ON w.id=rr.website_id
  WHERE rr.id=p_return_id
    AND rr.owner_id=v_user
    AND w.owner_id=v_user
  FOR UPDATE OF rr;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Return request not found' USING ERRCODE='P0002';
  END IF;
  IF v_return.status<>'received' OR v_return.refund_amount>0 THEN
    RAISE EXCEPTION 'Only an inspected return with no previous refund can be refunded' USING ERRCODE='22023';
  END IF;

  SELECT * INTO v_order
  FROM builder.orders
  WHERE id=v_return.order_id
    AND website_id=v_return.website_id
    AND owner_id=v_user
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Related order not found' USING ERRCODE='P0002';
  END IF;

  SELECT COALESCE(sum(amount),0) INTO v_collected
  FROM builder.payment_transactions
  WHERE order_id=v_order.id
    AND transaction_type='collection'
    AND status='confirmed';
  SELECT COALESCE(sum(amount),0) INTO v_refunded
  FROM builder.payment_transactions
  WHERE order_id=v_order.id
    AND transaction_type='refund'
    AND status='confirmed';

  IF v_collected<=v_refunded THEN
    RAISE EXCEPTION 'There is no collected payment available to refund' USING ERRCODE='22023';
  END IF;
  IF p_amount>v_collected-v_refunded THEN
    RAISE EXCEPTION 'Refund exceeds the remaining refundable amount of %',v_collected-v_refunded USING ERRCODE='22023';
  END IF;

  INSERT INTO builder.payment_transactions(
    owner_id,website_id,order_id,payment_method,transaction_type,amount,reference,status,notes
  )
  VALUES(
    v_user,v_order.website_id,v_order.id,p_method,'refund',p_amount,
    left(COALESCE(p_reference,''),120),'confirmed',left(COALESCE(p_notes,''),500)
  )
  RETURNING * INTO v_payment;

  INSERT INTO builder.finance_entries(
    owner_id,website_id,entry_type,category,amount,description,reference_type,reference_id
  )
  VALUES(
    v_user,v_order.website_id,'expense','Customer refund',p_amount,
    'Refund recorded for order '||v_order.order_number,'return',v_return.id
  );

  v_refunded:=v_refunded+p_amount;
  v_payment_status:=CASE WHEN v_refunded>=v_collected THEN 'refunded' ELSE 'partially_refunded' END;
  UPDATE builder.orders SET payment_status=v_payment_status WHERE id=v_order.id;
  UPDATE builder.return_requests
  SET status='refunded',
      refund_amount=p_amount,
      notes=left(concat_ws(E'\\n',NULLIF(notes,''),NULLIF(trim(COALESCE(p_notes,'')),'')),2000),
      updated_at=now()
  WHERE id=v_return.id;

  RETURN jsonb_build_object(
    'payment_id',v_payment.id,
    'return_id',v_return.id,
    'order_id',v_order.id,
    'order_number',v_order.order_number,
    'refund_amount',p_amount,
    'total_refunded',v_refunded,
    'collected',v_collected,
    'payment_status',v_payment_status,
    'return_status','refunded'
  );
END;
$function$;

-- Owner-only RPCs must not be executable by PUBLIC or anonymous callers.
REVOKE ALL ON FUNCTION builder.central_adjust_inventory(uuid,uuid,numeric,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION builder.central_adjust_inventory(uuid,uuid,numeric,text,text) FROM anonymous;
GRANT EXECUTE ON FUNCTION builder.central_adjust_inventory(uuid,uuid,numeric,text,text) TO authenticated;

REVOKE ALL ON FUNCTION builder.central_create_purchase_order(uuid,uuid,jsonb,date,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION builder.central_create_purchase_order(uuid,uuid,jsonb,date,text) FROM anonymous;
GRANT EXECUTE ON FUNCTION builder.central_create_purchase_order(uuid,uuid,jsonb,date,text) TO authenticated;

REVOKE ALL ON FUNCTION builder.central_receive_purchase_order(uuid,jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION builder.central_receive_purchase_order(uuid,jsonb) FROM anonymous;
GRANT EXECUTE ON FUNCTION builder.central_receive_purchase_order(uuid,jsonb) TO authenticated;

REVOKE ALL ON FUNCTION builder.central_record_order_payment(uuid,numeric,text,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION builder.central_record_order_payment(uuid,numeric,text,text,text) FROM anonymous;
GRANT EXECUTE ON FUNCTION builder.central_record_order_payment(uuid,numeric,text,text,text) TO authenticated;

REVOKE ALL ON FUNCTION builder.central_record_supplier_payment(uuid,numeric,text,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION builder.central_record_supplier_payment(uuid,numeric,text,text,text) FROM anonymous;
GRANT EXECUTE ON FUNCTION builder.central_record_supplier_payment(uuid,numeric,text,text,text) TO authenticated;

REVOKE ALL ON FUNCTION builder.update_storefront_order_status(uuid,uuid,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION builder.update_storefront_order_status(uuid,uuid,text) FROM anonymous;
GRANT EXECUTE ON FUNCTION builder.update_storefront_order_status(uuid,uuid,text) TO authenticated;

REVOKE ALL ON FUNCTION builder.central_process_return_refund(uuid,numeric,text,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION builder.central_process_return_refund(uuid,numeric,text,text,text) FROM anonymous;
GRANT EXECUTE ON FUNCTION builder.central_process_return_refund(uuid,numeric,text,text,text) TO authenticated;
