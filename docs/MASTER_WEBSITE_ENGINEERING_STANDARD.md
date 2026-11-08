# MASTER WEBSITE ENGINEERING STANDARD
**Canonical ID:** `MASTER_WEBSITE_ENGINEERING_STANDARD`  
**Canonical file:** `docs/MASTER_WEBSITE_ENGINEERING_STANDARD.md`  
**Applies to:** Every industry, business model, website, and template in WordPress Studio  
**Status:** Active project standard  
**Version:** 2.0

> This is the universal source of truth for designing, building, completing, testing, and releasing any website template in this repository. It is intentionally industry-neutral. Industry-specific requirements must be discovered and added as an implementation profile; they must never narrow or replace this standard.

## 1. How to invoke this standard

When a user mentions any of the following names, treat this document as the required operating specification:
- `MASTER_WEBSITE_ENGINEERING_STANDARD`
- `MASTER WEBSITE STANDARD`
- `UNIVERSAL TEMPLATE STANDARD`
- `WEBSITE TEMPLATE MASTER GUIDELINE`
- `docs/MASTER_WEBSITE_ENGINEERING_STANDARD.md`
- Repository: `faysaltalukder/grocery-storefronts`

Examples of valid requests:
- “Use MASTER_WEBSITE_ENGINEERING_STANDARD and complete all four Grocery templates.”
- “Follow the Master Website Standard. Build Hospital & Healthcare Template 3.”
- “In grocery-storefronts, design all four Real Estate templates according to the master guideline.”
- “Apply the universal standard to the Fashion industry.”

### Mandatory agent procedure
1. Read this complete file before planning or changing a template.
2. Read the root `AGENTS.md` and relevant repository README/architecture notes.
3. Inspect the current implementation, existing template inventory, shared runtime, admin integration, database/API contracts, and tests before editing.
4. Identify the requested industry, the four business models, and the target template number/name. If the request names only an industry and says “all four”, deliver four differentiated business solutions.
5. Produce an internal implementation checklist and execute end-to-end. Do not stop after a mockup, hero section, or static front-end.
6. Reuse and extend the existing architecture. Do not create a parallel admin, duplicate order engine, or incompatible data model.
7. Test all changed journeys and regressions. Fix discovered issues before calling the work complete.
8. Report exactly what changed, what was tested, what remains blocked, and the relevant commit/file links. Never claim an unperformed test passed.

Routine design decisions are delegated to the agent. Do not ask the user to select ordinary fonts, icons, stock imagery, layout details, color shades, component spacing, or implementation libraries. Make sound professional decisions autonomously. Ask only when an essential business fact is unknowable, a genuine authentication/permission blocker exists, or a high-impact irreversible decision cannot safely be made from available context.

## 2. Universal mission and quality bar

Create a complete, credible, conversion-oriented, accessible, responsive, fast, secure, and distinctive business website—not merely a theme preview. Every template must communicate a coherent business proposition and provide the actual journeys that customers, staff, and administrators need.

Target an internal quality score of **at least 85/100**, with **90/100 as the preferred target**. This is a project acceptance target, not a guarantee or an externally certified rating. A high numerical score never overrides a critical release blocker.

The standard applies to:
- E-commerce and retail
- Grocery, food, restaurants, and delivery
- Fashion, beauty, wellness, and fitness
- Medicine, pharmacy, hospitals, and healthcare
- Real estate, rentals, and property services
- Education, courses, and training
- Travel, tourism, and hospitality
- Professional, legal, financial, and local services
- Automotive, construction, logistics, and events
- Media, portfolios, nonprofits, and future industries not listed here

Do not assume every business is an online shop. Select the correct operating model: product commerce, service discovery, appointment/booking, property listing, course enrollment, quotation/lead generation, subscription, editorial publishing, or a justified hybrid.

## 3. Three-layer design and implementation model

### Layer A — Universal foundation
This document defines shared quality, engineering, content, accessibility, performance, security, testing, and release rules. These remain in force for every template.

### Layer B — Industry intelligence profile
Before design, research the selected industry's:
- Customer segments, needs, expectations, trust signals, and buying barriers
- Business models, revenue mechanisms, and operational workflows
- Terminology, service/product taxonomy, and common decision criteria
- Compliance, privacy, safety, professional qualification, and disclosure requirements
- Competitor conventions and opportunities to differentiate
- Relevant conversion events and post-purchase/service journeys

Use credible, current sources where factual or regulated information matters. Record important assumptions and sources in project documentation. Never invent certifications, clinical outcomes, licenses, testimonials, customer numbers, guarantees, or legal claims.

### Layer C — Four distinct business templates
Every industry must contain four genuinely different business solutions. The four templates must differ in target operator, customer intent, catalog/service structure, navigation, conversion path, operational needs, content strategy, and complete creative direction—not merely in color, typography, or homepage arrangement. Visual differentiation is mandatory and independently testable: each template must have a recognizably different brand personality, palette, composition, typography, imagery, component styling, and interaction language. A palette swap or rearranged version of the same starter layout does not count as a distinct template.

For each template, write a short business profile:
- Template name and business model
- Intended operator and customer segments
- Primary customer jobs-to-be-done
- Revenue/conversion model
- Core listings/catalog and required data
- Essential pages and user journeys
- Trust, safety, and compliance needs
- Distinctive creative direction

Illustrative differentiation:
- **Medicine & Pharmacy:** community pharmacy; wellness and healthcare retail; medical equipment and supplies; digital/express pharmacy.
- **Hospital & Healthcare:** multi-specialty hospital; diagnostic/pathology center; specialist clinic and appointment platform; telemedicine/digital healthcare platform.
- **Real Estate:** residential sales brokerage; rental/property management; commercial real estate; property developer/project sales.
- **Fashion:** multi-brand fashion retailer; focused designer/boutique label; footwear/accessories store; custom/modest/sustainable fashion brand.
- **Grocery:** neighborhood supermarket; fresh produce and farm shop; quick-commerce/express grocery; wholesale and bulk supply.

These are examples, not a fixed taxonomy. Discover the most useful four business models for the requested industry rather than copying examples blindly.

## 4. Business discovery and requirements

Create a business requirements matrix before implementation. Map each business need to a page, component, data entity, action, and test.

At minimum determine:
- Who operates the business and who uses the website
- What the business sells, provides, lists, books, or publishes
- How customers discover, compare, evaluate, and convert
- Which details are necessary to make a confident decision
- Which workflows need staff review or approval
- Which transactions, messages, bookings, or leads must persist
- Which customer and admin actions are needed after conversion
- Which information is regulated, sensitive, or restricted
- Which languages, currencies, delivery regions, and devices are relevant

Do not create features just to inflate scope. Every page and interaction must serve a real user or operational purpose.

## 5. Complete website and page architecture

A full business website should normally contain approximately **30–40 meaningful pages or page types**, adjusted to the complexity of the business. The count is a planning benchmark, not a reason to create empty, repetitive, or artificially split pages. Dynamic detail pages may use one reusable template populated by distinct records.

A typical architecture may include:
1. Home / primary landing
2. About / company story
3. Mission, values, or approach
4. Team, specialists, agents, or leadership
5. Main catalog/service/listing hub
6. Category or department landing pages
7. Subcategory or collection pages
8. Search results
9. Filtered or curated discovery pages
10. Individual product/service/property/course/doctor detail pages
11. Pricing, plans, or packages
12. Compare or selection guidance where useful
13. How it works / process
14. Booking, appointment, quote, or consultation entry
15. Cart or booking summary where applicable
16. Checkout, payment, or submission
17. Confirmation / success state
18. Order, booking, or application tracking
19. Customer account / dashboard
20. Customer profile and preferences
21. Customer history / saved items
22. Help center / FAQ
23. Contact
24. Locations / branches / service areas
25. Blog / insights index
26. Article detail pages
27. Author/editor profile where relevant
28. Testimonials / case studies with genuine or clearly labelled sample data
29. Careers / partnership / supplier pages where appropriate
30. Privacy policy
31. Terms and conditions
32. Returns, cancellation, refund, or service policy
33. Shipping/delivery or booking policy
34. Accessibility statement
35. Cookie/privacy preferences where legally appropriate
36. 404 / empty / error states
37. Additional industry-specific pages justified by the business model

Use meaningful page titles, unique copy, clear page purpose, and useful internal links. Do not duplicate the same paragraph across pages to reach a page-count target. If a page is not relevant, replace it with a relevant business-specific page rather than filler.

## 6. Content and editorial quality

Content must be complete enough to make the website believable and useful. Write original, natural, audience-specific copy; avoid keyword stuffing, generic AI filler, repeated claims, lorem ipsum, and fabricated proof.

Each important page should include:
- A clear page purpose and audience
- A specific headline and supporting explanation
- Useful, scannable sections with meaningful detail
- Relevant imagery, data, or examples
- Appropriate next action / call to action
- Trust and policy information where needed
- SEO title, meta description, canonical handling, and structured data where appropriate

### Blog and knowledge content
Where editorial content fits the industry, provide a functioning blog/insights system and approximately **8–12 complete launch articles**. Each article needs a distinct title, useful body, logical headings, introduction, relevant visual, author/date treatment, category/tags where useful, related content, and metadata. Articles must be genuinely useful and fact-checked where necessary. For industries where a blog is not the primary content channel, an equivalent useful resource center, guides, FAQs, or case-study library may supplement it.

### Product, service, and listing data
For product-led commerce, target **30–60 distinct products**, with **60 as a strong full-catalog target** when appropriate. A useful starting structure is 10 categories × 6 products, but adapt the taxonomy to the actual business. Never pad the catalog with renamed duplicates.

Every product should have accurate structured fields appropriate to the category: name, distinct description, price, SKU/identifier, category, image, availability/stock, variants, specifications, shipping/return details, and attributes for filtering. Do not invent real-world claims or imply sample inventory is live.

For service-led businesses, provide an appropriately rich set of services, departments, specialists, properties, courses, packages, locations, or other relevant records. A practical target is often 10–30 meaningful listings, but the business model and quality take precedence over arbitrary counts.

## 7. Interactive and rich content standard

The website must feel like a complete, responsive product—not a collection of static pages.

Use purposeful interaction such as:
- Smart search, autocomplete, filters, sorting, and useful empty states
- Product/service/property cards with meaningful hover and focus states
- Galleries, image zoom, comparison, variants, quantity controls, and wishlists
- Interactive maps, location selectors, availability calendars, and booking slots
- Step-by-step forms with validation, progress, and clear error recovery
- Calculators, configurators, eligibility checks, or guided selectors when useful
- Tabs, accordions, drawers, modals, sticky summaries, and contextual help
- Personalized recommendations based on available, consented, non-sensitive data
- Clear loading, success, error, disabled, and offline states
- Relevant dashboards, status timelines, notifications, and history views

Every visible interactive control must do what its label promises. No dead buttons, fake links, inert dropdowns, placeholder forms, or deceptive interaction. If an action is not implemented, do not present it as functional.

Use animation to explain state, guide attention, and add polish—not to obstruct reading or slow essential workflows. Respect reduced-motion preferences and provide keyboard-accessible equivalents.

## 8. Premium creative direction and design systems

Each template needs its own coherent creative concept. Do not apply one universal visual skin to every industry or force four templates to share the same composition.

For each template define:
- Brand positioning and visual personality
- Color system with semantic roles and accessible contrast
- Typography hierarchy and font loading strategy
- Grid, spacing, container widths, and responsive rules
- Buttons, forms, cards, tables, badges, menus, and feedback states
- Icon style and illustration/photo direction
- Image treatment, cropping, aspect ratios, and art direction
- Motion principles and interaction states
- Component variants and reusable design tokens

Create a polished first impression, strong visual hierarchy, clear conversion path, balanced whitespace, consistent alignment, and carefully composed responsive layouts. Avoid oversized cards, clutter, random gradients, excessive decoration, low-contrast controls, and generic template appearance.

Use distinctive layouts when justified: editorial storytelling, premium catalog grids, split-screen narratives, asymmetric compositions, immersive hero sections, data-rich dashboards, map-led discovery, or other suitable patterns. Ensure the design serves the customer journey.


### 8.1 Mandatory visual differentiation across templates

Visual identity is a first-class product requirement, not a final styling pass. Every template—including templates within the same industry—must feel like a separately art-directed, contemporary website.

For every template, create and document a **Visual Identity Brief** before implementation:
- Brand personality, positioning, audience and emotional tone
- A distinct primary, secondary and accent palette plus background, surface, text, border, success, warning and error tokens
- Typography pairing, scale, weights, line lengths and hierarchy
- Layout grammar: grid, page rhythm, section compositions, whitespace and content density
- Hero concept and image art direction
- Card, navigation, button, form, table, badge and footer treatments
- Iconography, illustration style, photography treatment and motion language
- Mobile-specific composition and navigation behavior

**Color autonomy and diversity**
- Choose colors from the actual business positioning, audience, culture, product/service and content—not from a fixed repository-wide palette or a single industry stereotype.
- Different templates may use different warm, cool, neutral, saturated, muted, light, dark, editorial, premium or playful directions when appropriate. There is no mandatory blue/green/white healthcare look, nor any other fixed industry color.
- Do not force every template into one color family, one background tone, one accent color, or one visual mood.
- Each template must have its own complete token set. Do not merely change one accent hex value while leaving the same dominant surfaces and components.
- Apply tokens consistently to the actual rendered UI. Defining unused palette variables does not satisfy this requirement.
- Maintain accessible contrast and meaningful semantic states; aesthetic freedom never overrides accessibility.

**Structural and artistic differentiation**
- Do not reuse one homepage composition, hero layout, section sequence, card geometry, navigation treatment or page rhythm across all four templates by default.
- Select a visual concept that fits each business model: for example editorial, architectural, immersive photography, premium minimal, bold typographic, data-led, human-centered, asymmetrical, modular, or cinematic.
- Shared code primitives are allowed, but template-specific compositions and styling must remain visible. Avoid a single generic shared CSS shell that flattens all identities.
- Use deliberate art direction: subject choice, crop, lighting, aspect ratio, focal point, overlays, negative space and image-to-copy balance must work together.
- Create visual hierarchy through composition, typography, imagery, contrast and spacing—not oversized cards, random gradients or decoration alone.
- Review all four templates side-by-side. If a reviewer can mistake one for another after the logo and business name are hidden, differentiation is insufficient.

### 8.2 Contemporary and dynamic website experience

“Dynamic” means more than animation or a fashionable hero. A contemporary website should combine:
- Content and records rendered from the correct website-specific data, not hard-coded repeated filler
- Responsive layouts and navigation adapted to mobile, tablet and desktop
- Useful live or near-real-time states when supported by the backend (availability, inventory, status, appointments, notices or other relevant data); never fake live data
- Meaningful interactive discovery, filters, search, forms, calculators, galleries, comparison or booking tools where relevant
- Thoughtful motion, transitions, hover/focus feedback and micro-interactions with reduced-motion support
- Strong visual storytelling, high-quality imagery, layered composition and purposeful whitespace
- Loading, empty, error, success, offline and retry states designed as part of the experience
- Fast rendering, progressive enhancement and graceful fallbacks on lower-powered devices

Do not equate “modern” with excessive animation, glassmorphism, gradients, 3D or trendy effects. Use a technique only when it strengthens the brand, clarity or task completion. A static brochure with decorative motion is not a dynamic product; a useful, data-driven and responsive experience can be contemporary without heavy effects.

## 9. 3D, motion, and visual technology

Use 3D and advanced motion when they add real value to the brand or product:
- Lightweight 3D hero objects or product viewers
- Scroll-linked storytelling and depth
- Interactive product/configuration previews
- Subtle parallax and layered transitions
- Carefully timed micro-interactions and page transitions
- Canvas/WebGL effects for a justified experience

Do not add 3D merely as decoration. Avoid heavy scenes on mobile, GPU-intensive effects, motion that causes layout shifts, or animation that blocks interaction. Use progressive enhancement, static fallbacks, lazy loading, device-aware quality, and reduced-motion support. Prefer CSS/SVG/HTML for simple effects over a 3D engine. Measure performance before and after.

## 10. Image, font, icon, and asset sourcing policy

Visual assets are required content, not optional decoration. The agent must independently research, select, verify, prepare and integrate assets that match the exact template, page purpose and creative direction. Do not ask the user to curate ordinary assets.

### Minimum visual asset coverage
- A complete multi-page website should target **at least 60 distinct, meaningful image assets per website**, distributed across the homepage, category/service pages, detail pages, team/location/editorial content and other relevant sections. This is a site-wide target, not a requirement to place 60 images on the homepage.
- Count actual photographs, original illustrations, diagrams, meaningful infographics and other substantial visual assets. Do not inflate the count with icons, tiny UI glyphs, repeated crops of the same source, background textures, logos or duplicate files.
- Use a balanced mix appropriate to the business: hero imagery, service/product imagery, people/team imagery where authorized, facilities/locations, editorial images, process diagrams, charts and contextual illustrations.
- Every important page or reusable page type must have an intentional visual plan. Avoid long runs of text-only pages where imagery, diagrams or visual examples would materially improve comprehension or trust.
- Use genuinely varied images and subjects. Do not repeat the same four hero illustrations throughout a 30–40 page website or fill every card with the same stock photograph.
- For business models where 60 meaningful assets would be artificial or misleading, document the reason and provide an equivalent visual-content plan (for example, original diagrams, maps, product renders or data visualizations). Never invent real people, facilities, products, clinical outcomes or evidence to hit a count.

### Asset research and rights
Potential sources include Unsplash, Pexels, Pixabay, Wikimedia Commons, Google Fonts, Lucide, Material Symbols, and reputable open-source libraries. These are discovery starting points, not blanket permission to use every asset.

For every external asset:
1. Verify the actual license and relevant restrictions at the time of use.
2. Check commercial use, modification, redistribution, attribution, model/property releases, trademarks, and any editorial-only limitations.
3. Prefer assets with clear commercial rights; preserve attribution when required.
4. Do not use paid, trial-only, watermarked, pirated, scraped, or license-unclear assets.
5. Do not hotlink third-party assets blindly. Download/optimize and host locally when permitted and appropriate.
6. Keep an asset register with source URL, creator, license, attribution text, date checked, local path, intended placement and any release/permission notes.
7. Use genuinely distinct images for distinct products/listings. Avoid reusing one image across an entire catalog unless it is intentionally a placeholder clearly marked as such.
8. Never present a stock photo as a real customer, employee, doctor, property, facility, product, testimonial or actual business location.
9. Use safe fallbacks and descriptive alt text; decorative images should have empty alt text.
10. For people, verify permission and releases appropriate to the asset and intended use. For regulated or sensitive contexts, avoid identifiable people unless the rights and context are explicitly cleared.

### Image implementation and quality
- Prefer high-quality, relevant images with intentional focal points, authentic subject matter and crops that suit each component.
- Use responsive image sources and sizes or the framework's equivalent, modern formats such as AVIF/WebP where supported, explicit dimensions/aspect ratios, and lazy loading below the fold.
- Prioritize the main hero/LCP image appropriately; do not lazy-load the primary above-the-fold image by default.
- Prevent layout shift, oversized downloads, blurry thumbnails and broken image URLs.
- Optimize image payloads for mobile and use local assets/CDN delivery according to the existing architecture.
- Provide meaningful alt text for informative images and empty alt text for purely decorative visuals.
- Provide a designed fallback state for missing/failed assets; do not leave broken-image icons or empty visual holes.
- Ensure image overlays and text remain legible and contrast-compliant.

### Fonts and icons
- Use a deliberate, limited type system with reliable fallbacks and optimized font loading.
- Use a consistent icon family and stroke/fill style within each template. Icons support comprehension; they do not substitute for meaningful photography or illustrations.
- Verify icon licenses and avoid emoji as a substitute for professional interface iconography.

## 11. Commerce, bookings, and conversion workflows

Choose the right transaction model and implement the complete journey.

### Product commerce
Discovery → category/search → product detail → variant/quantity → cart → checkout → validation → order submission/payment → confirmation → order tracking → customer history → staff order management.

### Booking and appointment
Service/specialist/location discovery → availability → slot selection → customer details → consent/policy → booking submission → confirmation → reminders/status → reschedule/cancel where supported → staff calendar/management.

### Property, course, quote, and lead journeys
Listing/detail → inquiry or application → validated contact details → consent → submission → reference/confirmation → staff assignment/status → customer follow-up.

Include clear prices, fees, availability, shipping/delivery, cancellation, refund, tax, and payment disclosures as applicable. Use a secure payment provider only when properly configured. Never store raw card data. Never imply a transaction is real if the environment is a demo or the provider is not configured.

Restricted or regulated goods/services require appropriate age, prescription, professional, eligibility, or staff review gates. Do not expose prohibited direct-purchase paths. For medical and other high-stakes content, use qualified review and clear scope limitations.

## 12. Central admin and multi-website architecture

The platform must support a shared central administration experience while keeping each website's business data logically isolated.

### Core rules
- Every website must have a stable, unique `website_id` (and human-readable slug).
- Every record that belongs to a website must be scoped to that website, including products/listings, categories, pages, customers, orders, bookings, settings, content, and analytics.
- A website must never read or mutate another website's private data through client-controlled IDs or untrusted filters.
- The central admin may aggregate authorized records across sites, but every row/detail must retain website identity and context.
- Central orders must show which website, industry, template, and storefront generated the order.
- Admin filters should support website, status, date, and other useful dimensions.
- Website-level settings, brand identity, catalog, content, customer records, policies, and integrations remain independently configurable.
- Shared infrastructure must not mean shared customer data or accidental cross-site leakage.

### Integration requirements
Before adding or changing admin functionality, inspect the current admin, APIs, database schema, auth model, and order lifecycle. Reuse existing central order and commerce services. Extend schemas with backward-compatible migrations where possible. Preserve existing working templates and workflows. Do not duplicate the order engine or create a second admin panel.

### Data integrity
Use server-side authorization and tenant scoping. Never trust a `website_id` supplied by a browser without validating the authenticated user's access. Add indexes and constraints for tenant-scoped queries. Use transactions for multi-step writes. Record audit-relevant changes where appropriate.

## 13. Backend, database, and API engineering

- Inspect the existing stack and follow its established patterns.
- Keep business rules on trusted server-side boundaries.
- Validate and normalize every input on the server.
- Use typed, documented API contracts and consistent error responses.
- Add pagination, filtering, sorting, rate limiting, and abuse controls where appropriate.
- Avoid N+1 queries, unbounded result sets, and unnecessary payloads.
- Use database constraints for important invariants.
- Make webhook processing authenticated, idempotent, and observable.
- Ensure order/booking creation is idempotent where retries may occur.
- Never expose service-role keys, secrets, private tokens, or privileged database credentials in browser code.
- Keep environment-specific configuration out of committed source.
- Provide migrations and rollback/backup considerations for schema changes.
- Do not destructively alter production data or schema without a verified backup and a clear rollback plan.

## 14. Security, privacy, and trust

Apply least privilege, secure authentication, authorization checks, secure session handling, CSRF protection where applicable, output escaping, parameterized queries, safe file uploads, dependency hygiene, and appropriate rate limiting.

Protect personal data. Collect only what is needed, explain why it is needed, define retention and deletion paths, and do not expose customer records across websites. Avoid placing sensitive data in URLs, logs, analytics events, or client-side storage. Use consent and privacy controls appropriate to the jurisdiction and data type.

For regulated industries, identify applicable rules and require qualified review. This guideline is engineering direction, not legal, medical, financial, or regulatory advice.

## 15. Responsive design and accessibility

Design and test from small screens upward, then verify tablet and desktop. Support touch, keyboard, mouse, zoom, and assistive technologies.

Target WCAG 2.2 AA as the project baseline where applicable:
- Semantic landmarks and heading order
- Keyboard-operable navigation and controls
- Visible focus indicators
- Accessible labels, descriptions, and validation errors
- Sufficient text and non-text contrast
- Meaningful alt text and captions
- Correct dialogs, menus, tabs, and status announcements
- Adequate target sizes and spacing
- No color-only communication
- Reduced-motion support
- Responsive reflow without horizontal overflow

Accessibility is a release requirement, not a final cosmetic pass.

## 16. SEO, discoverability, and performance

Implement semantic HTML, unique titles and descriptions, canonical URLs, clean slugs, internal linking, sitemap, robots rules, structured data only when accurate, social sharing metadata, and indexable content. Prevent duplicate or thin pages from being indexed.

Optimize image formats, responsive sizes, lazy loading, font subsets, caching, code splitting, critical CSS, and third-party scripts. Avoid unnecessary JavaScript and render-blocking assets.

Use Core Web Vitals as practical targets: LCP ≤ 2.5s, INP < 200ms, CLS < 0.1 at the 75th percentile where field data is available. Lab measurements are diagnostic and do not guarantee field results. Measure mobile and desktop and do not regress existing production performance without a justified, documented tradeoff.

## 17. Analytics and operational observability

Define meaningful events for the business model, such as product view, search, add to cart, checkout start, purchase, lead submission, booking, cancellation, and contact action. Use consent-aware tracking, avoid sensitive payloads, and deduplicate events where relevant.

Provide useful logs and operational visibility for failed submissions, payment/webhook errors, order state changes, booking conflicts, and admin actions. Never log secrets or unnecessary personal information.

## 18. Autonomous execution and change safety

The agent is expected to act as a capable senior product designer, UX researcher, content strategist, frontend/backend engineer, and QA engineer.

- Make routine decisions autonomously using the requirements and existing architecture.
- Research industry conventions and free assets without asking the user to curate them.
- Build complete flows, not isolated visual fragments.
- Use existing authorized tools and permissions. Never claim to bypass authentication or permissions.
- Do not request repeated approval for ordinary reversible implementation steps.
- If blocked by missing credentials, denied permissions, an unavailable external service, or a genuinely ambiguous high-impact decision, state the exact blocker and the minimum action needed.
- Do not fabricate API results, successful deployments, payment tests, or external integrations.
- Preserve existing functionality. Inspect diffs, run relevant tests, and avoid unrelated rewrites.
- Before risky changes, create or verify a backup and establish rollback.
- Keep implementation notes and decisions concise but sufficient for future agents.

## 19. Quality scoring and release gates

Score each template out of 100:

| Dimension | Weight |
|---|---:|
| Visual design, originality, brand fit and visual asset quality | 25 |
| Business-model fit and functional completeness | 18 |
| Content quality and page/catalog completeness | 12 |
| UX, interaction quality, and conversion journey | 15 |
| Accessibility and responsive behavior | 10 |
| Backend, data integrity, security, and admin integration | 8 |
| Performance and SEO | 7 |
| QA evidence, maintainability, and documentation | 5 |
| **Total** | **100** |

Acceptance:
- **90–100:** preferred production-ready target, subject to all release gates.
- **85–89:** acceptable project target if all critical gates pass and known limitations are documented.
- **Below 85:** improve before acceptance.
- **Independent visual gate:** a template must score at least **20/25** in visual design and pass the visual verification checks below. A high total score cannot compensate for weak visual design, generic appearance or missing imagery.

### Non-negotiable release blockers
Do not mark complete if any of the following remain:
- Broken primary navigation or core user journey
- Non-functional visible buttons/forms or fake transaction states
- Checkout/order/booking/lead submission fails or data does not persist
- Incorrect website/tenant data isolation or unauthorized access
- Exposed secrets or critical security issue
- Critical mobile layout failure or inaccessible core interaction
- Major missing/empty pages that are represented as finished
- Unlicensed, watermarked, misleading, or inappropriate assets
- A template that fails the independent visual gate, lacks its own visual identity, or uses a generic/recolored clone of another template
- Major missing image coverage, broken image assets, or an undocumented shortfall against the 60-asset target without a justified equivalent plan
- Serious data loss risk or unverified destructive migration
- Critical console/runtime errors affecting user journeys

A score cannot waive a release blocker.

## 20. Testing and verification

Use the repository's available test stack. Add or update automated checks for changed behavior. Where supported, use unit/integration tests and browser-level end-to-end tests.

Test at minimum:
- All navigation items and important internal links
- Search, filters, sorting, and empty/error states
- Every primary CTA and form validation path
- Product/service/listing details and relevant variants
- Cart/checkout/order or booking/lead submission end-to-end
- Confirmation, tracking, account history, and admin status updates
- Tenant isolation across at least two different websites
- Responsive behavior at representative mobile, tablet, and desktop widths
- Keyboard navigation, focus, labels, and reduced motion
- Loading, network failure, server error, and retry behavior
- SEO metadata, broken links, console errors, and performance
- Visual review of every template at desktop and mobile widths, including homepage and representative inner/detail pages
- Side-by-side comparison of all four templates to verify distinct palettes, typography, hero art direction, layouts, imagery and component styling
- Asset audit: count meaningful assets, inspect source/licensing register, verify image URLs/load success, detect duplicates, review alt text, responsive sizing and mobile payloads
- Confirm color tokens are actually consumed by rendered components and no template silently falls back to a generic shared skin
- Existing templates and shared runtime for regressions

Record the test method and actual result. If a third-party provider cannot be exercised in the available environment, state that it was not live-tested and verify the integration through safe mocks/staging checks instead.

## 21. Deployment, documentation, and maintenance

- Follow the repository's current deployment process.
- Verify build output and deployment status before claiming release.
- Keep demo and production states explicit.
- Never enable real order-taking, payment, booking, or public intake until the relevant backend, credentials, policies, and operational handling are verified.
- Document template identity, business model, page map, data model, integrations, asset licenses, setup requirements, test evidence, and known limitations.
- Keep reusable components and design tokens documented.
- Monitor failures after deployment and fix regressions promptly.

## 22. Definition of done

A template is complete only when all applicable items are true:
- [ ] Industry and business model are researched and documented.
- [ ] The template is meaningfully distinct from the other templates in its industry in business model and visual identity.
- [ ] Its Visual Identity Brief is documented and its palette, typography, layout grammar, imagery and motion are applied in the rendered website.
- [ ] The template passes the independent visual gate (at least 20/25) and side-by-side differentiation review.
- [ ] The site meets the 60-asset visual target or has a documented business-specific equivalent visual-content plan.
- [ ] Page architecture is complete and contains no filler pages.
- [ ] Copy and editorial content are useful, original, and sufficiently complete.
- [ ] Product/service/listing catalog is populated with distinct, relevant records.
- [ ] Images and other assets are relevant, licensed, optimized, distinct, distributed across relevant pages, and documented in the asset register.
- [ ] Image loading, responsive behavior, alt text, duplication and mobile payload checks are verified.
- [ ] Visual design is polished, artistic, coherent, contemporary, responsive, accessible and unmistakably distinct from sibling templates.
- [ ] Interactive components and all visible controls work.
- [ ] Primary business journey is fully implemented and persists data.
- [ ] Central admin integration and website-level data isolation are verified.
- [ ] Security, privacy, SEO, and performance checks are completed.
- [ ] Automated/manual tests pass and regressions are checked.
- [ ] Quality score is at least 85/100 and no critical release blocker remains.
- [ ] Deployment state and any limitations are accurately reported.

## 23. Required completion report

For each requested template, report:
1. Industry and business model
2. Template name/number and distinct concept
3. Pages and content delivered
4. Catalog/listings/articles delivered (with counts)
5. Functional journeys implemented
6. Admin/backend/data integration changes
7. Assets and license documentation
8. QA performed and actual results
9. Quality score with category breakdown
10. Deployment/commit/file references
11. Remaining blockers or limitations (write “None verified” only when actually checked)

---

## Final operating rule

**One standard, every industry, four distinct business solutions, complete interactive experiences.** When the user names an industry, template number, or template name together with this standard or repository, discover the correct business model, read the existing implementation, and carry the work through design, content, engineering, integration, testing, and verified completion. Do not reduce the request to a visual mockup or a generic template skin.
