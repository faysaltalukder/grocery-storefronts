# Grocery Storefronts

Four independent grocery storefronts in one GitHub repository. Each folder is served as its own customer-facing website under GitHub Pages.

- [General Supermarket](./general-supermarket/)
- [Fresh Produce](./fresh-produce/)
- [Express Grocery](./express-grocery/)
- [Wholesale & Bulk](./wholesale-bulk/)

Shared storefront runtime lives in `shared/`. Store content and orders are isolated by their Neon website slug. The central Halal Food admin remains in the `halalfood` repository.

GitHub Pages deployment is configured through `.github/workflows/pages.yml`. Public order-taking must remain disabled until each Neon website is separately configured, verified, and intentionally published.

## Universal website template engineering standard

**Canonical instruction name:** `MASTER_WEBSITE_ENGINEERING_STANDARD`  
**Canonical file:** [`docs/MASTER_WEBSITE_ENGINEERING_STANDARD.md`](docs/MASTER_WEBSITE_ENGINEERING_STANDARD.md)  
**Repository-wide agent entry point:** [`AGENTS.md`](AGENTS.md)

This standard is intentionally open to **all industries and business models**, not only grocery. Use it for e-commerce, grocery, fashion, healthcare, medicine/pharmacy, real estate, hospitality, education, professional services, and future industries.

When asking an AI agent to build or complete templates, you can refer to the exact standard name or file path. Examples:

- “Follow `MASTER_WEBSITE_ENGINEERING_STANDARD` and build all four Fashion templates.”
- “Use the master standard for Hospital & Healthcare Template 3.”
- “Apply the universal template standard to all four Real Estate business models.”

The standard requires four genuinely differentiated business solutions per industry, rich and useful page/content architecture, relevant product or service catalogs, meaningful interactions, complete customer journeys, careful asset licensing, central-admin compatibility, secure data isolation, responsive accessibility, performance, and verified QA. The root `AGENTS.md` instructs repository-aware agents to load the master standard before template work.
