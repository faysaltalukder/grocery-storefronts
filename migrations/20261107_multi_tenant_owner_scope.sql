-- Enforce per-merchant row ownership even while legacy permissive owner policies exist.
-- RESTRICTIVE policies are ANDed with permissive policies, preventing the legacy
-- fixed-owner compatibility policy from granting cross-tenant access.
-- No existing policies or business records are dropped or rewritten.

DO $tenant_scope$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='websites' AND policyname='tenant_scope_guard_websites') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_guard_websites ON builder.websites AS RESTRICTIVE FOR ALL TO authenticated USING (owner_id=auth.uid()) WITH CHECK (owner_id=auth.uid())$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='assets' AND policyname='tenant_scope_guard_assets') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_guard_assets ON builder.assets AS RESTRICTIVE FOR ALL TO authenticated USING (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=assets.website_id AND w.owner_id=auth.uid())) WITH CHECK (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=assets.website_id AND w.owner_id=auth.uid()))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='categories' AND policyname='tenant_scope_guard_categories') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_guard_categories ON builder.categories AS RESTRICTIVE FOR ALL TO authenticated USING (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=categories.website_id AND w.owner_id=auth.uid())) WITH CHECK (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=categories.website_id AND w.owner_id=auth.uid()))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='products' AND policyname='tenant_scope_guard_products') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_guard_products ON builder.products AS RESTRICTIVE FOR ALL TO authenticated USING (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=products.website_id AND w.owner_id=auth.uid())) WITH CHECK (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=products.website_id AND w.owner_id=auth.uid()))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='website_documents' AND policyname='tenant_scope_guard_website_documents') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_guard_website_documents ON builder.website_documents AS RESTRICTIVE FOR ALL TO authenticated USING (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=website_documents.website_id AND w.owner_id=auth.uid())) WITH CHECK (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=website_documents.website_id AND w.owner_id=auth.uid()))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='website_plugins' AND policyname='tenant_scope_guard_website_plugins') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_guard_website_plugins ON builder.website_plugins AS RESTRICTIVE FOR ALL TO authenticated USING (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=website_plugins.website_id AND w.owner_id=auth.uid())) WITH CHECK (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=website_plugins.website_id AND w.owner_id=auth.uid()))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='orders' AND policyname='tenant_scope_guard_orders') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_guard_orders ON builder.orders AS RESTRICTIVE FOR ALL TO authenticated USING (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=orders.website_id AND w.owner_id=auth.uid())) WITH CHECK (owner_id=auth.uid() AND EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=orders.website_id AND w.owner_id=auth.uid()))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='order_items' AND policyname='tenant_scope_guard_order_items') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_guard_order_items ON builder.order_items AS RESTRICTIVE FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM builder.orders o JOIN builder.websites w ON w.id=o.website_id WHERE o.id=order_items.order_id AND o.owner_id=auth.uid() AND w.owner_id=auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM builder.orders o JOIN builder.websites w ON w.id=o.website_id WHERE o.id=order_items.order_id AND o.owner_id=auth.uid() AND w.owner_id=auth.uid()))$p$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='builder' AND tablename='audit_log' AND policyname='tenant_scope_guard_audit_log') THEN
    EXECUTE $p$CREATE POLICY tenant_scope_guard_audit_log ON builder.audit_log AS RESTRICTIVE FOR ALL TO authenticated USING (owner_id=auth.uid() AND (website_id IS NULL OR EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=audit_log.website_id AND w.owner_id=auth.uid()))) WITH CHECK (owner_id=auth.uid() AND (website_id IS NULL OR EXISTS (SELECT 1 FROM builder.websites w WHERE w.id=audit_log.website_id AND w.owner_id=auth.uid())))$p$;
  END IF;
END;
$tenant_scope$;
