# Fashion template suite release

This release adds four Clothing & Fashion storefront template families to the independent WordPress Studio:

- Modern Fashion Brand
- Boutique & Ethnic Wear
- Streetwear & Sneaker Store
- Multi-Category Fashion Retailer

Each family has an active design specification and 36 reusable page definitions in Neon (144 page definitions total). The template library and storefront renderer are included in the deployment bundle at `.shipstatic-deploy-bundle.json`.

The four templates share the existing Neon commerce API, website ownership model, cart/checkout, order submission, tracking and central order operations. Fashion page content is seeded when the merchant creates/opens a website from the template.

**Important operational boundary:** the current shared product/order schema still tracks stock at product level. The templates include fit, size-guide, material, colour and care content locations, but per-size/per-colour SKU inventory reservation is not enabled by this release. Merchants must use the existing product stock model until a dedicated variant inventory workflow is implemented and tested. No claim of per-variant stock accuracy should be made.

All sample prices, product cards and Unsplash images in the library preview are illustrative design content, not a real merchant catalogue. Before a storefront is published, the merchant must add verified products and licensed/owned imagery, set product information, stock, delivery zones, contact details, payment configuration and their own returns/exchange policy.

The release is additive: existing Grocery templates, websites, products and orders are not deleted or migrated.
