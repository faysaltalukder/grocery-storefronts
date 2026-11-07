-- Restrict authenticated merchant access without blocking public reads of published catalogues.
-- RESTRICTIVE policies are ANDed with legacy permissive policies. No existing rows or
-- policies are deleted. Public SELECT remains available only for published storefront data.
DO $tenant_scope$
DECLARE
  v_table text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='websites' AND policyname='tenant_scope_websites_select') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_websites_select ON builder.websites AS RESTRICTIVE FOR SELECT TO authenticated USING (owner_id=auth.uid() OR status='published')$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='websites' AND policyname='tenant_scope_websites_insert') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_websites_insert ON builder.websites AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (owner_id=auth.uid())$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='websites' AND policyname='tenant_scope_websites_update') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_websites_update ON builder.websites AS RESTRICTIVE FOR UPDATE TO authenticated USING (owner_id=auth.uid()) WITH CHECK (owner_id=auth.uid())$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='websites' AND policyname='tenant_scope_websites_delete') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_websites_delete ON builder.websites AS RESTRICTIVE FOR DELETE TO authenticated USING (owner_id=auth.uid())$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='assets' AND policyname='tenant_scope_assets_select') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_assets_select ON builder.assets AS RESTRICTIVE FOR SELECT TO authenticated USING (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=assets.website_id AND w.owner_id=auth.uid()))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='assets' AND policyname='tenant_scope_assets_insert') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_assets_insert ON builder.assets AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=assets.website_id AND w.owner_id=auth.uid()))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='assets' AND policyname='tenant_scope_assets_update') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_assets_update ON builder.assets AS RESTRICTIVE FOR UPDATE TO authenticated USING (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=assets.website_id AND w.owner_id=auth.uid())) WITH CHECK (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=assets.website_id AND w.owner_id=auth.uid()))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='assets' AND policyname='tenant_scope_assets_delete') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_assets_delete ON builder.assets AS RESTRICTIVE FOR DELETE TO authenticated USING (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=assets.website_id AND w.owner_id=auth.uid()))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='categories' AND policyname='tenant_scope_categories_select') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_categories_select ON builder.categories AS RESTRICTIVE FOR SELECT TO authenticated USING (owner_id=auth.uid() OR EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=categories.website_id AND w.status='published'))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='categories' AND policyname='tenant_scope_categories_insert') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_categories_insert ON builder.categories AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=categories.website_id AND w.owner_id=auth.uid()))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='categories' AND policyname='tenant_scope_categories_update') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_categories_update ON builder.categories AS RESTRICTIVE FOR UPDATE TO authenticated USING (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=categories.website_id AND w.owner_id=auth.uid())) WITH CHECK (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=categories.website_id AND w.owner_id=auth.uid()))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='categories' AND policyname='tenant_scope_categories_delete') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_categories_delete ON builder.categories AS RESTRICTIVE FOR DELETE TO authenticated USING (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=categories.website_id AND w.owner_id=auth.uid()))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='products' AND policyname='tenant_scope_products_select') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_products_select ON builder.products AS RESTRICTIVE FOR SELECT TO authenticated USING (owner_id=auth.uid() OR EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=products.website_id AND w.status='published'))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='products' AND policyname='tenant_scope_products_insert') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_products_insert ON builder.products AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=products.website_id AND w.owner_id=auth.uid()))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='products' AND policyname='tenant_scope_products_update') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_products_update ON builder.products AS RESTRICTIVE FOR UPDATE TO authenticated USING (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=products.website_id AND w.owner_id=auth.uid())) WITH CHECK (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=products.website_id AND w.owner_id=auth.uid()))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='products' AND policyname='tenant_scope_products_delete') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_products_delete ON builder.products AS RESTRICTIVE FOR DELETE TO authenticated USING (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=products.website_id AND w.owner_id=auth.uid()))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='website_documents' AND policyname='tenant_scope_website_documents_select') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_website_documents_select ON builder.website_documents AS RESTRICTIVE FOR SELECT TO authenticated USING (owner_id=auth.uid() OR EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=website_documents.website_id AND w.status='published'))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='website_documents' AND policyname='tenant_scope_website_documents_insert') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_website_documents_insert ON builder.website_documents AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=website_documents.website_id AND w.owner_id=auth.uid()))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='website_documents' AND policyname='tenant_scope_website_documents_update') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_website_documents_update ON builder.website_documents AS RESTRICTIVE FOR UPDATE TO authenticated USING (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=website_documents.website_id AND w.owner_id=auth.uid())) WITH CHECK (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=website_documents.website_id AND w.owner_id=auth.uid()))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='website_documents' AND policyname='tenant_scope_website_documents_delete') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_website_documents_delete ON builder.website_documents AS RESTRICTIVE FOR DELETE TO authenticated USING (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=website_documents.website_id AND w.owner_id=auth.uid()))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='website_plugins' AND policyname='tenant_scope_website_plugins_select') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_website_plugins_select ON builder.website_plugins AS RESTRICTIVE FOR SELECT TO authenticated USING (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=website_plugins.website_id AND w.owner_id=auth.uid()))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='website_plugins' AND policyname='tenant_scope_website_plugins_insert') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_website_plugins_insert ON builder.website_plugins AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=website_plugins.website_id AND w.owner_id=auth.uid()))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='website_plugins' AND policyname='tenant_scope_website_plugins_update') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_website_plugins_update ON builder.website_plugins AS RESTRICTIVE FOR UPDATE TO authenticated USING (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=website_plugins.website_id AND w.owner_id=auth.uid())) WITH CHECK (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=website_plugins.website_id AND w.owner_id=auth.uid()))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='website_plugins' AND policyname='tenant_scope_website_plugins_delete') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_website_plugins_delete ON builder.website_plugins AS RESTRICTIVE FOR DELETE TO authenticated USING (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=website_plugins.website_id AND w.owner_id=auth.uid()))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='orders' AND policyname='tenant_scope_orders_select') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_orders_select ON builder.orders AS RESTRICTIVE FOR SELECT TO authenticated USING (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=orders.website_id AND w.owner_id=auth.uid()))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='orders' AND policyname='tenant_scope_orders_insert') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_orders_insert ON builder.orders AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=orders.website_id AND w.owner_id=auth.uid()))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='orders' AND policyname='tenant_scope_orders_update') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_orders_update ON builder.orders AS RESTRICTIVE FOR UPDATE TO authenticated USING (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=orders.website_id AND w.owner_id=auth.uid())) WITH CHECK (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=orders.website_id AND w.owner_id=auth.uid()))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='orders' AND policyname='tenant_scope_orders_delete') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_orders_delete ON builder.orders AS RESTRICTIVE FOR DELETE TO authenticated USING (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=orders.website_id AND w.owner_id=auth.uid()))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='order_items' AND policyname='tenant_scope_order_items_select') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_order_items_select ON builder.order_items AS RESTRICTIVE FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM builder.orders o JOIN builder.websites w ON w.id=o.website_id WHERE o.id=order_items.order_id AND o.owner_id=auth.uid() AND w.owner_id=auth.uid()))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='order_items' AND policyname='tenant_scope_order_items_insert') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_order_items_insert ON builder.order_items AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM builder.orders o JOIN builder.websites w ON w.id=o.website_id WHERE o.id=order_items.order_id AND o.owner_id=auth.uid() AND w.owner_id=auth.uid()))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='order_items' AND policyname='tenant_scope_order_items_update') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_order_items_update ON builder.order_items AS RESTRICTIVE FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM builder.orders o JOIN builder.websites w ON w.id=o.website_id WHERE o.id=order_items.order_id AND o.owner_id=auth.uid() AND w.owner_id=auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM builder.orders o JOIN builder.websites w ON w.id=o.website_id WHERE o.id=order_items.order_id AND o.owner_id=auth.uid() AND w.owner_id=auth.uid()))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='order_items' AND policyname='tenant_scope_order_items_delete') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_order_items_delete ON builder.order_items AS RESTRICTIVE FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM builder.orders o JOIN builder.websites w ON w.id=o.website_id WHERE o.id=order_items.order_id AND o.owner_id=auth.uid() AND w.owner_id=auth.uid()))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='audit_log' AND policyname='tenant_scope_audit_log_select') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_audit_log_select ON builder.audit_log AS RESTRICTIVE FOR SELECT TO authenticated USING (owner_id=auth.uid() AND (website_id IS NULL OR EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=audit_log.website_id AND w.owner_id=auth.uid())))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='audit_log' AND policyname='tenant_scope_audit_log_insert') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_audit_log_insert ON builder.audit_log AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (owner_id=auth.uid() AND (website_id IS NULL OR EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=audit_log.website_id AND w.owner_id=auth.uid())))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='audit_log' AND policyname='tenant_scope_audit_log_update') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_audit_log_update ON builder.audit_log AS RESTRICTIVE FOR UPDATE TO authenticated USING (owner_id=auth.uid() AND (website_id IS NULL OR EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=audit_log.website_id AND w.owner_id=auth.uid()))) WITH CHECK (owner_id=auth.uid() AND (website_id IS NULL OR EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=audit_log.website_id AND w.owner_id=auth.uid())))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='audit_log' AND policyname='tenant_scope_audit_log_delete') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_audit_log_delete ON builder.audit_log AS RESTRICTIVE FOR DELETE TO authenticated USING (owner_id=auth.uid() AND (website_id IS NULL OR EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=audit_log.website_id AND w.owner_id=auth.uid())))$p$;
  END IF;
  -- Neutralize the legacy single-owner restrictive guard only after the replacement
  -- tenant-scoped restrictive policies above have been created in this same transaction.
  FOREACH v_table IN ARRAY ARRAY['websites','assets','audit_log','categories','order_items','orders','products','website_documents','website_plugins']
  LOOP
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename=v_table AND policyname='owner_identity_guard') THEN
      EXECUTE format('ALTER POLICY owner_identity_guard ON builder.%I USING (true) WITH CHECK (true)',v_table);
    END IF;
  END LOOP;
END;
$tenant_scope$;
