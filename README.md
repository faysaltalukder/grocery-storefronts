# Grocery Storefronts

Four independent grocery storefronts in one GitHub repository. Each folder is served as its own customer-facing website under GitHub Pages.

- [General Supermarket](./general-supermarket/)
- [Fresh Produce](./fresh-produce/)
- [Express Grocery](./express-grocery/)
- [Wholesale & Bulk](./wholesale-bulk/)

Shared storefront runtime lives in `shared/`. Store content and orders are isolated by their Neon website slug. The central Halal Food admin remains in the `halalfood` repository.

GitHub Pages deployment is configured through `.github/workflows/pages.yml`. Public order-taking must remain disabled until each Neon website is separately configured, verified, and intentionally published.
