# Hospital & Healthcare Template Suite

Implementation record: 2026-11-08  
Category slug: `hospital-healthcare`  
Engineering baseline: `docs/MASTER_WEBSITE_ENGINEERING_STANDARD.md`

## Outcome

The Hospital & Healthcare category now has four independent business-specific template definitions, four active version-1 design records and 40 active page definitions per template (160 pages total). The old Grocery preview fallback is no longer used for this category. Existing Grocery catalog entries and Grocery category data were not deleted or modified.

## Four template directions

| Template key | Name | Primary business | Distinct information architecture |
|---|---|---|---|
| `multispecialty-hospital` | MedCore Hospital & Medical Center | Multi-specialty hospitals and medical centres | Institutional navigation, departments, provider directory, patient and admission guidance |
| `diagnostics-laboratory` | VitalLab Diagnostics & Laboratory | Diagnostic centres, pathology labs and imaging centres | Test catalogue, test-specific preparation, sample collection, screening packages and report support |
| `specialist-clinic` | CarePoint Specialist Clinic | Specialist clinics, consultant chambers and outpatient practices | Specialty discovery, verified provider profiles, consultation options, clinic schedules and fees |
| `telehealth-platform` | MediConnect Digital Healthcare | Telehealth and digital-health service operators | Care-category discovery, consultation request steps, technology readiness, privacy and support |

The four directions do not share a grocery layout or simply recolour one common page. Each has its own palette, hero composition, service discovery model and patient journey.

## Mandatory corrective implementation brief — page architecture and image distribution

**Binding requirement for every future agent / ChatGPT session working on this category. Read and obey before editing.** The previous image treatment made the sites look like photo albums. That is a structural design failure and must not be repeated. Do not stop after writing a plan: implement the page records, content, image distribution, fixes and tests.

### Required page count and navigation
- **Each template must contain exactly 40 distinct, individually navigable pages.** The active records in `builder.template_pages` are the source of truth; sitemap/menu links alone do not count.
- Create/update the actual `builder.template_pages` records, not just a sitemap, menu mockup, hard-coded links or a list in the UI.
- Every page needs a unique stable key/slug, title, template/site identity, page-specific content, navigation metadata and a working route/render.
- Verify all pages through navigation and direct URL load/refresh. No dead links, duplicate filler pages, placeholder-only pages or links that all lead to one generic destination.
- Adapt the page architecture to each business model; do not force the same page titles or content across all four templates.

### Strict image-distribution rules
- Homepage: **maximum 5 meaningful images** per template. Current implementation uses exactly 5: one hero plus four contextual service-feature images.
- Every non-homepage page: **3–4 contextually relevant images**, naturally integrated with its specific content. Current implementation uses exactly 3 per page.
- Maintain **at least 60 distinct, meaningful visual assets per complete website**, as required by the master standard. All 60 registered assets are now assigned across the 40-page experience. Duplicate files, repeated crops and decorative icons do not count as distinct assets.
- Never dump the image collection into the homepage, one gallery, one carousel wall or one undifferentiated media section. **Do not turn any of the four websites into a photo album.**
- Every image must support a clear content purpose and be accompanied by a relevant heading, caption or nearby explanatory copy. Use balanced image-and-copy layouts; do not cover photos with long text overlays.
- Use varied, deliberate layouts: alternating image-and-copy sections, service/detail features, facility/process explanations, provider or test information layouts and small contextual image groups only where useful. Avoid endless galleries, repetitive oversized image cards and image-only sections.
- Use authentic, appropriately licensed assets. Do not imply stock/illustrative people are actual staff or patients, and do not invent facilities, equipment, credentials or clinical outcomes.
- Track page-level image assignments in a structured content/asset map so distribution can be audited and updated independently.

### Page content standard
Each page must be a useful destination, not an image container. Include a page-specific H1 and introduction, useful sections and subheadings, contextual images with meaningful alt text and nearby explanation, relevant internal links, a suitable CTA where appropriate, and unique SEO title/meta description where supported. Avoid filler, keyword stuffing, fabricated facts, repeated generic paragraphs and medical advice.

### Suggested 40-page architecture per template
| Page group | Target |
|---|---:|
| Home, About, Mission, Leadership, Locations | 5 |
| Departments / Specialties / Tests / Care Categories | 9 |
| Individual service, department, test or care detail pages | 9 |
| Doctors / Specialists / Team or provider directory and profiles | 5 |
| Patient journey, preparation, admission, technology or support guides | 4 |
| Appointment / consultation request, fees or packages, insurance/payment information | 4 |
| Health resources / articles / FAQs / Contact / Policies | 4 |
| **Total** | **40** |

Adapt intelligently: MedCore prioritises departments, facilities, admission and patient guidance; VitalLab prioritises test catalogue, preparation, sample collection, screening packages and report support; CarePoint prioritises specialties, verified consultants, schedules and consultation information; MediConnect prioritises digital-care categories, consultation steps, technology readiness, privacy and support. Do not invent live report portals, patient accounts or real-time consultation features.

### Image loading and reliability audit
- Audit every image URL and local asset path used by all four templates and all pages.
- Verify files exist and respond successfully; check case-sensitive paths, incorrect relative paths, stale external URLs, redirects and unsupported formats.
- Prefer reliable local assets or verified stable sources. Extend the asset register with source, creator, license, attribution, date checked, local path and exact page/section placement.
- Add a design-consistent fallback for failed images. A failed image must not break layout.
- Set dimensions/aspect ratios to prevent layout shifts; use responsive sizing and modern formats where supported.
- Lazy-load below-the-fold images, but do not lazy-load the primary above-the-fold/LCP image. Do not load the entire site's image library on the homepage.
- Test on desktop and mobile, including direct page loads, refreshes and slow-network conditions. Fix all known broken images and report the remaining broken-image count.

### Required completion evidence — all four templates
Report and verify per template: (1) exactly 40 active page definitions and working routes; (2) homepage has no more than 5 images; (3) every other page has 3–4 relevant images (currently 3); (4) 60+ distinct meaningful assets registered and distributed; (5) no photo-album layouts and images are supported by copy; (6) image URLs/paths load or have tested fallbacks; (7) navigation, breadcrumbs, CTAs and direct URLs work; (8) desktop/tablet/mobile review; (9) accessibility, SEO, performance and regression checks; (10) changed files, database changes, commit/branch and deployment evidence.

Do not mark complete if any template fails these checks. Do not replace implementation with another plan or ask the user to repeat these requirements. Never claim a test or deployment passed unless it was actually run and verified.

## Shared engineering architecture

- The template catalogue is registered in `builder.template_catalog`.
- Versioned design records are stored in `builder.template_designs`.
- Page definitions for each template are stored in `builder.template_pages`; keep exactly 40 active definitions per template.
- The static application remains one reusable engine; template-specific renderer branches and configuration drive the four experiences.
- Website content, page documents and business data remain scoped to each generated website.
- Admin template previews use the category-specific healthcare renderer.
- Live storefront pages use the healthcare renderer, not the grocery product catalogue, cart or checkout flow.
- Appointment requests, when explicitly enabled after compliance review, are recorded as healthcare service requests in the central request desk. They are not confirmed bookings.

## Page architecture

Each template now has exactly 40 active page definitions. They cover the appropriate subset of the following and must remain at exactly 40:
- Home and organisation information
- Service, department, specialty, test or care-category directory
- Service/detail and provider/detail page types
- Appointment or consultation request
- Patient guide, preparation, admission, referral or technology guidance
- Location and contact information
- Fees, insurance, pricing or package information where relevant
- FAQ, patient rights, privacy, terms and accessibility
- Careers, feedback, support and a reusable article/resource detail page

The detailed per-template page keys, titles, order and page specifications are held in `builder.template_pages` and are loaded by the website builder.

## Healthcare safety and compliance boundaries

This is a website template suite, not a clinical system.

1. No diagnosis, treatment recommendation, prescription, clinical triage or medical decision support is implemented.
2. No fake doctors, credentials, ratings, patient reviews, accreditation claims, outcome statistics or hospital capacity claims are displayed as real.
3. Provider profile slots are explicitly marked for operator-supplied, verified credentials.
4. General appointment forms request only contact and scheduling details. They must not collect symptoms, diagnoses, medication lists, test results or medical records.
5. Appointment intake is **disabled by default**. A website must explicitly set all three controls to true before the request form can transmit:
   - `healthcare_intake_enabled`
   - `healthcare_data_residency_verified`
   - `healthcare_provider_verified`
6. A request is not an appointment confirmation. The provider must confirm availability and next steps.
7. Patient portals, clinical records, report portals, live video/audio consultations, prescription workflows, remote monitoring and emergency triage are not implemented. These require separate, reviewed integrations.
8. For Bangladesh deployments, review the DGHS National Telehealth Guideline, relevant provider/platform licensing, consent, cybersecurity and data-residency requirements before enabling telehealth or processing patient information. In particular, the guideline calls for protection of patient information and health-data residency within Bangladesh. A hosting/database location must be verified; do not enable intake merely because the storefront is published.

## Accessibility and responsive design

The design targets WCAG 2.2 AA practices: semantic headings, meaningful link text, form labels, visible focus, keyboard operation, adequate contrast, responsive layouts and reduced-motion support. A formal WCAG conformance claim is not made until manual and automated accessibility testing is completed.

## Assets

All four hero illustrations are original, local SVG assets in `assets/`. They contain no identifiable people, real facilities, patient imagery or clinical claims. See `docs/HOSPITAL_HEALTHCARE_ASSET_REGISTER.md`.

## Verification record

| Check | Result |
|---|---|
| Four catalogue rows in the Hospital & Healthcare category | Verified in Neon |
| Four active design version-1 records | Verified in Neon |
| 40 active page definitions per template | Verified in Neon; 160 total across four templates |
| Eight patient-information resources per template | Registered in design specs and Health Library page specs |
| Category-specific admin renderer mapping | Implemented in source bundle |
| Live storefront healthcare renderer | Implemented in source bundle |
| Healthcare navigation and mobile navigation | Implemented in source bundle |
| Appointment request admin classification | Implemented in central request desk |
| Intake default state | Disabled pending provider and data-residency verification |
| Existing Grocery category data | Preserved; no Grocery template rows deleted |
| 40-page expansion and page-level image assignments | Verified in Neon: 5 homepage images, 3 on each of 39 non-home pages, none over 5 |\n| Production domain promotion | Requires final visual review and release approval |

## Deployment

The implementation is committed on branch `feature/hospital-healthcare-templates`. A staging deployment was created at:

`https://radiant-trail-s3x3aqc.shipstatic.com`

The staging deployment is not the production custom domain. Production promotion must happen only after the final browser review of the admin category, all four previews and mobile layouts.

## External references

- W3C, Web Content Accessibility Guidelines (WCAG) 2.2: https://www.w3.org/TR/WCAG22/
- W3C Web Accessibility Initiative, WCAG overview: https://www.w3.org/WAI/standards-guidelines/wcag/
- Bangladesh Directorate General of Health Services, National Telehealth Guideline for Bangladesh: https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-dghs/2026/2/0420ffe2-8247-454a-8902-4f2cdfe85c18.pdf
- WHO, Recommendations on Digital Interventions for Health System Strengthening: https://iris.who.int/bitstream/handle/10665/311977/WHO-RHR-19.8-eng.pdf?sequence=1
- Institute for Healthcare Improvement, Telemedicine: Ensuring Safe, Equitable, Person-Centered Virtual Care: https://www.ihi.org/library/white-papers/telemedicine-ensuring-safe-equitable-person-centered-virtual-care

These references inform design and risk boundaries; they do not replace legal, clinical or regulatory review by the provider.


## Visual redesign v2 — 2026-11-08

All four templates have been re-art-directed against MASTER WEBSITE ENGINEERING STANDARD v2.0. Each now has an independent visual identity, palette, hero composition, page rhythm and image treatment.

| Template | Visual identity | Palette | Composition |
|---|---|---|---|
| MedCore | Warm architectural editorial | Warm ivory, botanical green, terracotta | Asymmetric hospital hero, architectural crop, five-image editorial hero and feature layout |
| VitalLab | Dark precision-science | Midnight blue, slate, electric lime | Dark scientific interface, lab image hero, high-contrast data-led accents |
| CarePoint | Human-centered specialist editorial | Warm blush, muted coral, deep plum | Portrait-arch hero, personal consultation imagery with contextual page-level image/copy, softer editorial rhythm |
| MediConnect | Digital healthcare product | Midnight violet, lavender, lilac | Dark technology-led hero, connected-care overlay, remote-consultation imagery with contextual page-level image/copy |

### Image implementation

- 60 distinct Pexels photographs per template; 240 unique photo IDs in total, with all 60 assets per template assigned at least once.
- Homepage: 1 hero + 4 contextual service-feature images (5 maximum).
- Every other page: 3 images presented as alternating image-and-copy stories; no photo-only galleries or image walls.
- Neon stores exact page-level assignments in `page_spec.media.imageAssetIds`; the asset register records exact page-key placements.
- The admin preview uses one hero plus four contextual image-and-copy features; the live storefront uses three contextual images on non-home pages.
- Images have descriptive alt text, visible source/creator credits, responsive sizing, lazy loading and designed fallbacks for failed remote images.
- Stock-image disclosure clarifies that the photos do not represent actual providers, facilities, staff or patients.
- No photo ID is repeated across templates or twice on the same page.

### QA status

- The 240-photo manifest contains original Pexels source pages, CDN URLs, alt text, creator/listing credit and intended page placement. Remote CDN hosting is currently used; local mirroring is not yet complete.

- [x] Four distinct palettes and art directions defined.
- [x] 60 photo records per template and 240 globally unique IDs checked in code.
- [x] Admin preview renderer updated.
- [x] Live healthcare homepage renderer updated.
- [x] Responsive CSS added for mobile.
- [ ] DOM-level verification of all four admin previews: 60 Pexels image elements and 60 unique IDs per template. Actual CDN network load and crop verification remain pending.
- [ ] Full mobile screenshot review and visual score.
- [ ] Production promotion; staging review is required first.


## Visual asset expansion — 60 images per website

The healthcare collection contains **60 distinct Pexels photographs per template (240 unique image IDs across all four)**. All 60 assets per template are assigned to the 40 active page definitions in Neon. Each homepage renders five images maximum; each of the other 39 pages renders three images with contextual copy. Image records include original Pexels photo page, creator/listing credit, descriptive alt text, CDN URL and exact page-key placements in `docs/HOSPITAL_HEALTHCARE_ASSET_REGISTER.md`.

The image CDN is remote-hosted at present rather than mirrored into the repository. Non-hero images are lazy-loaded. Browser-level image request, responsive crop and mobile payload verification remain required before production promotion.


## Source verification update

The 240-image asset set was rebuilt using individual Pexels photo-page records only (search/category tiles and sponsored stock-photo links were excluded). Every record has a unique photo ID, individual Pexels photo-page URL, CDN image URL and descriptive alt text. See the asset register for all placements and creator credits.


### Staging verification note — 2026-11-08

- Previous staging deployment: https://radiant-trail-s3x3aqc.shipstatic.com (39 files; success), created before the 40-page/image-cap correction; its prior 60-image-gallery verification is superseded.
- Updated source bundle passed JavaScript syntax checks for the live storefront, admin renderer and Neon builder API.
- Neon confirms 40 active page definitions per template (160 total), with exactly 5 homepage image IDs and 3 image IDs on each of the 39 non-home pages; no page exceeds 5.
- All 60 distinct assets per template (240 unique IDs globally) are assigned at least once, and the asset register records exact page-key placements.
- Updated renderer provides an all-pages navigation menu, sitemap destinations, page-level image/copy stories, failed-image fallbacks and below-the-fold lazy loading.
- A fresh staging deployment and browser-level CDN/mobile review are still required. Production domain and production promotion remain untouched.


## 40-page and strict image-cap implementation update — 2026-11-08

- Database backup before changes: `.github/backups/healthcare-pages-pre-40page-layout-20261108.json` (144 prior page rows + 4 design records).
- Page catalog migration: `docs/migrations/20261108_hospital_healthcare_40_pages.sql`.
- Final balanced image assignment migration: `docs/migrations/20261108_hospital_healthcare_40_page_image_distribution.sql`.
- Verified Neon state: 40 active pages per template; 160 total. Each homepage has exactly 5 image IDs; each of the 39 non-home pages has exactly 3; zero pages exceed 5.
- All 60 distinct image assets per template are used at least once (240 globally unique photo IDs). Assignments are stored in `page_spec.media.imageAssetIds`.
- Renderer source commit: `007bfd8b13fcd0da0ca794f09d668678eb492110`. Subsequent bundle and documentation commits contain the fixes and evidence.
- Remote Pexels request success and visual browser QA remain pending. A fallback is implemented but does not prove every CDN URL responds successfully.
