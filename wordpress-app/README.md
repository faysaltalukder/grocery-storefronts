# Independent WordPress / Grocery Builder

This directory is the standalone WordPress/Grocery Builder application. Its source repository is `faysaltalukder/grocery-storefronts`; its backend and authentication are owned by the dedicated Neon environment.

## Isolation contract
- No Halal Food Supabase URL, key, JWT, session, Edge Function, storage bucket, database table, or secret is used by this application.
- Admin authentication is Neon Managed Auth. Durable template, tenant, page, catalogue, and order data use the dedicated Neon Data API and owner-scoped RLS.
- Halal Food Admin may link to this application, but does not embed its runtime or pass credentials/tokens to it.
- Keep all browser storage keys namespaced to WordPress. Never store database credentials or service tokens in browser storage.
- Do not place WordPress business logic, Neon API clients, migrations, or deployment workflows back into the Halal Food repository.
- The existing Halal Food Neon Storage bridge is a separate Halal Food capability and must not be repurposed or disconnected as part of this project.

## Local structure
- `admin/`: independent Neon-authenticated admin, editor, template library, pages and orders.
- `storefront.html`, `storefront.css`, `storefront.js`: public storefront renderer and COD checkout.
- `database/migrations/`: WordPress-only Neon migrations. Apply only to the verified WordPress Neon branch.
- `scripts/`: repository-local quality checks.

## Release safety
Never apply migrations or change Neon project settings without verifying the exact project and branch. Take a backup before risky data changes. Keep Halal Food production untouched. A WordPress release must not require a Halal Food deployment, and a Halal Food release must not require a WordPress deployment.
