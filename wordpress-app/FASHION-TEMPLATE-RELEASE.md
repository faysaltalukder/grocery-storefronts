# Fashion template suite release

This release adds four Clothing & Fashion storefront template families to the independent WordPress Studio:

- Modern Fashion Brand
- Boutique & Ethnic Wear
- Streetwear & Sneaker Store
- Multi-Category Fashion Retailer

Each family has an active design specification and 36 reusable page definitions in Neon (144 page definitions total). The template library and storefront renderer are included in the deployment bundle at `.shipstatic-deploy-bundle.json`.

The four templates share the existing Neon commerce API, website ownership model, cart/checkout, order submission, tracking and central order operations. Fashion page content is seeded when the merchant creates/opens a website from the template.

**Important operational boundaries:** the current shared product/order schema still tracks stock at product level. The templates include size-guide, fit, material, colour and care content, but selectable size/color variants with separate SKU stock and atomic variant reservation are not enabled. The current shared checkout is COD-based. Return requests use the existing return-request foundation; a complete exchange/replacement workflow is not enabled. Scheduled drop publishing, back-in-stock notifications, and boutique made-to-measure processing are design directions, not enabled backend workflows. Do not advertise these as live capabilities until implemented and tested.

All sample prices and product cards in the library preview are illustrative design content, not a real merchant catalogue. The current preview uses Unsplash-hosted image references; they are not downloaded into the deployment as local product assets. Before a storefront is published, the merchant must add verified products and owned/appropriately licensed product photography, set product information and stock, configure delivery zones and contact details, confirm supported payment methods, and publish their own returns policy.

The release is additive: existing Grocery templates, websites, products and orders are not deleted or migrated.

## Design and engineering references

- Baymard Institute, Apparel & Accessories UX Research: https://baymard.com/research/apparel-and-accessories
- Baymard Institute, Apparel UX industry guidance: https://baymard.com/industries/apparel-ux
- Baymard Institute, 2026 apparel quantitative insights: https://baymard.com/research-articles/apparel-and-accessories-quantitative-ux-insights-2026
- Shopify, SKU management for products and variants: https://help.shopify.com/en/manual/products/details/sku
- Shopify, initial inventory setup and variant-level quantity tracking: https://help.shopify.com/en/manual/inventory-and-locations/setup/initial-inventory-setup
- Google Search Central, Core Web Vitals: https://developers.google.com/search/docs/appearance/core-web-vitals
- W3C, Web Content Accessibility Guidelines 2.2: https://www.w3.org/TR/WCAG22/
- Unsplash, image license: https://unsplash.com/license

The design references informed apparel discovery, sizing/fit content, model imagery, product detail hierarchy, truthful stock messaging, responsive performance and accessibility. The template preview uses Unsplash-hosted sample images; these are visual placeholders and should be replaced with merchant-owned or appropriately licensed product photography for a real store.
