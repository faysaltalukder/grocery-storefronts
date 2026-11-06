# Independent WordPress / Grocery Builder Architecture

**Authoritative source:** `faysaltalukder/grocery-storefronts/wordpress-app/`
**Application:** WordPress Studio / Grocery Builder
**Backend:** Dedicated Neon project, branch `grocery-template-builder-v1` (`br-muddy-lake-a1tcb0n1`), database `halal_food_db`, schema `builder`.
**Authentication:** Neon Managed Better Auth (`auth_provider=neon_auth`). The dedicated Neon project/branch owns WordPress authentication and durable template definitions.
**Hosting:** Independent static deployment on its own origin; never served from the Halal Food GitHub Pages origin.

## Non-negotiable isolation

1. WordPress is a separate product with its own source directory/repository ownership, deployment, runtime origin, authentication, Neon API, data, migrations, secrets, logs, rollback and release process.
2. Halal Food is a separate product with its own `faysaltalukder/halalfood` repository, GitHub Pages hosting, Supabase project, authentication, storage, Edge Functions, secrets, orders, customers, inventory and operations.
3. The only permitted product-to-product connection is a small WordPress navigation/launch link in the Halal Food Admin. It opens the independently hosted WordPress app in a separate browser context. No application runtime or credentials cross the boundary.
4. Never import Halal Food Supabase SDK/configuration, `store-config.js`, `shared.js`, `app.js`, `HFAdminReady`, Halal Food JWTs, refresh tokens, cookies or service-role secrets into this app.
5. Never import WordPress Neon credentials, WordPress sessions, order/customer records, Neon SDK, migrations or builder code into Halal Food.
6. Do not make WordPress availability a prerequisite for Halal Food, or Halal Food availability a prerequisite for WordPress.
7. Existing Halal Food API connections (including the Halal Food Neon Storage bridge) are separate Halal Food features. Do not disconnect or repurpose them as part of WordPress separation.

## Runtime and identity

- WordPress Admin authentication is Neon Managed Better Auth only.
- WordPress public storefront visitors use the Neon anonymous/public access path allowed by the published-site RLS policy.
- Private previews require the separate WordPress Neon account.
- The app must run on a different origin from Halal Food so browser cookies, localStorage, sessionStorage, service workers and same-origin privileges are not shared.
- The Halal Food launcher must not perform SSO, token exchange, session forwarding, proxying or API calls on WordPress's behalf.
- Browser code may contain only the public Neon Data API endpoint. Never put database passwords, connection strings, admin tokens, service keys or secret credentials in the repository or browser bundle.

## Data ownership and security

- The Neon Data API exposes the `builder` schema only. WordPress `builder` schema owns `builder.template_catalog`, `builder.template_designs`, `builder.template_pages`, `builder.websites`, `builder.website_documents`, `builder.categories`, `builder.products`, `builder.assets`, `builder.website_plugins`, `builder.orders`, `builder.order_items` and `builder.audit_log`.
- Every merchant write/read must be protected by RLS and owner-scoped checks; public access is limited to the minimum records and RPCs needed for published storefronts.
- COD order placement, tracking and status transitions use the dedicated Neon RPCs. Order state changes must validate the website owner and allowed transition.
- Keep credentials out of URLs, browser storage, logs and GitHub Actions output.
- Never point migrations at Halal Food Supabase or the Halal Food Neon Storage bridge.

## Repository and release ownership

- WordPress Builder code, renderer, editor, template library, page manager, order manager, storefront renderer, Neon API client, Neon migrations, tests and WordPress workflows live only under `wordpress-app/` in `faysaltalukder/grocery-storefronts`.
- Halal Food may keep only a minimal external navigation/launch adapter. No WordPress business logic, renderer, data-access client, SQL migration or deployment job may remain in `faysaltalukder/halalfood`.
- A WordPress code change must not require a Halal Food commit, build, release, GitHub Pages deployment, Supabase migration or secret change.
- A Halal Food change must not require a WordPress commit, build, release, Neon migration or deployment.
- Use independent workflow paths, hosting origins, environment variables, caches and rollback plans.
- Do not merge or deploy production changes until the branch quality gate, browser tests and independent failure tests pass.

## Migration and production safety

- Verify the exact Neon project, branch ID, database and schema before every migration.
- Apply additive migrations only to the dedicated WordPress Neon branch. Take and verify a backup before risky data changes.
- Do not run destructive SQL, delete data, alter Halal Food Supabase settings, rotate Halal Food secrets or change the Halal Food hosting configuration as part of this work.
- Keep existing public Halal Food storefront and order flows untouched during WordPress migration.
- Preserve the current four storefront definitions and 25-page catalogue per template.

## Required release gates

- WordPress Admin login works with its own Neon account when Halal Food Supabase is unavailable.
- WordPress can read/write its own Neon records with owner-scoped RLS.
- Public storefront COD order placement and order tracking work against the WordPress Neon database.
- Halal Food website, checkout, admin login and Supabase operations continue when WordPress hosting/Neon is unavailable.
- WordPress deploy/rollback does not modify the Halal Food repository, Pages settings, Supabase resources or live website.
- Halal Food deploy/rollback does not modify WordPress repository, hosting, Neon resources or live storefront.
- Browser origin, cookies, localStorage, sessionStorage and service worker are isolated.
- No Halal Food Supabase URL, key, SDK, session or runtime dependency is present in the WordPress application.

**Stop condition:** If any release requires the other product's runtime, backend, authentication, storage, repository or deployment to be available, do not release until the dependency is removed.
