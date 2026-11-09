# Automotive & Vehicle Services — Four-template implementation profile

**Category slug:** `automotive-services`  
**Release branch:** `feature/automotive-services-four-templates-20261109`  
**Template catalog:** Neon `builder.template_catalog`  
**Page catalog:** Neon `builder.template_pages`  
**Design source:** Neon `builder.template_designs`

## Four differentiated business models

| Template | Operator / customer | Business model | Visual identity |
|---|---|---|---|
| NORTHSTAR AUTOHAUS | New-car buyers and pre-owned shoppers | Vehicle dealership, inventory discovery, trade-in and test-drive requests | Luxury automotive editorial, ink/brass, cinematic vehicle-led composition |
| TORQUEWORKS GARAGE | Private owners and fleet operators | Repair, diagnostics, maintenance and inspections | Industrial technical service manual, graphite/coral, workshop grid |
| TREADLINE EXPRESS | Drivers, commuters and fleet managers | Tyres, wheel services and express vehicle maintenance | Kinetic service lanes, cobalt/cream, quick-service selector |
| ROAM MOTOR CLUB | Travellers, local renters and organisations | Vehicle rental, chauffeur and fleet mobility | Quiet premium mobility editorial, deep teal/sand, spacious fleet discovery |

## Pages and original visual assets

- Each template has exactly **40 meaningful page types** (160 total).
- Each template has **83 unique page-specific original first-party vector illustrations**: five homepage images and two on each of the other 39 pages.
- Each page has a page-level image allocation map in `design_spec.pageAllocationMap` and asset metadata in `page_spec.media.images`.
- Artwork is original SVG illustration generated for each page and template. It is not a photograph of an actual vehicle, workshop, customer or staff member; the preview identifies it as illustrative.
- Each template has an independent palette, typography pairing, page composition, navigation and component treatment.

## Customer journeys

- Northstar: inventory discovery → vehicle detail/comparison → trade-in/finance/test-drive enquiry → operator confirmation.
- TorqueWorks: service discovery → vehicle details → repair/inspection estimate request → workshop confirmation.
- Treadline: tyre/wheel discovery → size/service guidance → fitting or fleet request → centre confirmation.
- Roam: fleet/category discovery → rental requirements → vehicle or corporate fleet request → operator confirmation.

All forms use the existing website-scoped quote-request workflow. They do not represent confirmed bookings, sales, repairs, fitments, rentals, payments or live availability. Sample content is illustrative and must be replaced with verified operator data before publication.

## Engineering integration

- Reuses the existing WordPress Studio admin, Neon API, website/page document model and shared storefront runtime.
- Adds Automotive template keys to the existing allowlist and category mapping.
- Adds a static 40-page catalog and fallback for each Automotive template.
- Adds four admin preview concepts, storefront renderers, responsive design tokens and vehicle-specific enquiry capture.
- Adds an additive, idempotent Neon migration. No existing website, catalog, page, order or customer rows are deleted.
- Preserves existing website ownership and tenant isolation through the Neon API.
