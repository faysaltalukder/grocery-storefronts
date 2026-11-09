# Beauty & Salon — four-template implementation profile

**Category slug:** `beauty-salon`  
**Admin route:** `/admin/wordpress-templates.html?category=beauty-salon`  
**Implementation date:** 2026-11-09  
**Scope:** Four independent service-business website solutions integrated into the existing WordPress Studio dashboard and shared Neon/request architecture.

## Industry and business-model research

This category separates four operational models: premium day-spa/self-care, stylist-led hair studio, specialist nail/brow/lash studio, and bridal/occasion makeup artist. Each has its own discovery hierarchy, service taxonomy, portfolio or profile needs, and appointment-request context.

The October 2026 Clikiti review of 193 independent salon and barbershop websites found online booking and provider choice to be common, while cancellation/no-show policies and access information were less consistently disclosed. This supports placing a clear appointment action, provider preference, practical access details and policy links close to the service journey. Zenoti's 2025 benchmark shows digital booking and rebooking behavior varies by business type; those benchmarks are directional vendor data, not promises about an individual business. Fresha and Booksy guidance informed the distinction between booking deposits and cancellation fees. No deposits, payment processing, real-time availability, automated reminders or cancellation charges are enabled in this release.

## Four visual identity briefs

| Template | Business model | Visual identity | Primary journey |
|---|---|---|---|
| **Maison Beauty & Spa** | Premium day spa and facial/body-care studio | Quiet-luxury editorial; mineral paper `#F6EEE8`, espresso `#302A29`, muted rose `#8D5D54`, clay `#E8D7CE`; Cormorant Garamond + DM Sans | Ritual/service discovery → first-visit guidance → appointment request |
| **The Hair Atelier** | Stylist-led hair, colour and styling studio | Architectural, high-contrast editorial; stone `#F0EEE8`, charcoal `#202324`, copper `#B75B3A`, sand `#DCCABD`; Space Grotesk + Manrope | Service/colour discovery → stylist portfolio → consultation request |
| **Forme Nail & Brow Studio** | Nail, brow and lash specialist | Playful modular atelier; lilac paper `#F4EFF4`, plum ink `#3B303C`, mauve `#A66A83`, soft lilac `#E4D5E3`; Playfair Display + DM Sans | Service category → design inspiration → technician preference/request |
| **The Bridal Edit** | Bridal, wedding-party and occasion makeup artist | Romantic cinematic editorial; ivory `#FBF5F0`, cocoa `#3B2D2D`, antique gold `#B88B61`, blush `#E9D8D0`; Playfair Display + Inter | Portfolio/package → trial and event planning → date-specific consultation request |

The four designs use separate visual grammars and service-specific copy, not a shared generic storefront with recoloured buttons.

## Page architecture and image allocation

Each template contains **40 active page types**. Each homepage has exactly **5** meaningful illustrations; every inner page has **2**. This produces **83 unique images per website**, **332 unique image IDs across the four templates**, with no cross-template reuse.

### Maison Beauty & Spa — 40 pages / 83 unique assets

- `home` — Home — 5 images (`bs-maison-beauty-spa-home-01`, `bs-maison-beauty-spa-home-02`, `bs-maison-beauty-spa-home-03`, `bs-maison-beauty-spa-home-04`, `bs-maison-beauty-spa-home-05`)
- `services` — Treatments & Services — 2 images (`bs-maison-beauty-spa-services-01`, `bs-maison-beauty-spa-services-02`)
- `signature-facials` — Signature Facial Rituals — 2 images (`bs-maison-beauty-spa-signature-facials-01`, `bs-maison-beauty-spa-signature-facials-02`)
- `body-rituals` — Body-Care Rituals — 2 images (`bs-maison-beauty-spa-body-rituals-01`, `bs-maison-beauty-spa-body-rituals-02`)
- `massage-and-relaxation` — Massage & Relaxation — 2 images (`bs-maison-beauty-spa-massage-and-relaxation-01`, `bs-maison-beauty-spa-massage-and-relaxation-02`)
- `skin-consultations` — Personal Care Consultations — 2 images (`bs-maison-beauty-spa-skin-consultations-01`, `bs-maison-beauty-spa-skin-consultations-02`)
- `service-menu` — Service Menu — 2 images (`bs-maison-beauty-spa-service-menu-01`, `bs-maison-beauty-spa-service-menu-02`)
- `treatment-details` — Treatment Details — 2 images (`bs-maison-beauty-spa-treatment-details-01`, `bs-maison-beauty-spa-treatment-details-02`)
- `spa-packages` — Ritual Packages — 2 images (`bs-maison-beauty-spa-spa-packages-01`, `bs-maison-beauty-spa-spa-packages-02`)
- `membership` — Membership & Repeat Visits — 2 images (`bs-maison-beauty-spa-membership-01`, `bs-maison-beauty-spa-membership-02`)
- `gift-cards` — Gift Cards — 2 images (`bs-maison-beauty-spa-gift-cards-01`, `bs-maison-beauty-spa-gift-cards-02`)
- `book-appointment` — Request a Visit — 2 images (`bs-maison-beauty-spa-book-appointment-01`, `bs-maison-beauty-spa-book-appointment-02`)
- `appointment-request` — Appointment Request Details — 2 images (`bs-maison-beauty-spa-appointment-request-01`, `bs-maison-beauty-spa-appointment-request-02`)
- `first-visit` — Your First Visit — 2 images (`bs-maison-beauty-spa-first-visit-01`, `bs-maison-beauty-spa-first-visit-02`)
- `preparation-guide` — Before Your Visit — 2 images (`bs-maison-beauty-spa-preparation-guide-01`, `bs-maison-beauty-spa-preparation-guide-02`)
- `aftercare-guide` — Aftercare Guidance — 2 images (`bs-maison-beauty-spa-aftercare-guide-01`, `bs-maison-beauty-spa-aftercare-guide-02`)
- `our-story` — Our Story — 2 images (`bs-maison-beauty-spa-our-story-01`, `bs-maison-beauty-spa-our-story-02`)
- `wellness-philosophy` — The Maison Approach — 2 images (`bs-maison-beauty-spa-wellness-philosophy-01`, `bs-maison-beauty-spa-wellness-philosophy-02`)
- `team` — Meet the Team — 2 images (`bs-maison-beauty-spa-team-01`, `bs-maison-beauty-spa-team-02`)
- `therapist-profile` — Therapist Profile — 2 images (`bs-maison-beauty-spa-therapist-profile-01`, `bs-maison-beauty-spa-therapist-profile-02`)
- `spa-spaces` — The Studio — 2 images (`bs-maison-beauty-spa-spa-spaces-01`, `bs-maison-beauty-spa-spa-spaces-02`)
- `gallery` — Visual Journal — 2 images (`bs-maison-beauty-spa-gallery-01`, `bs-maison-beauty-spa-gallery-02`)
- `locations` — Locations — 2 images (`bs-maison-beauty-spa-locations-01`, `bs-maison-beauty-spa-locations-02`)
- `location-details` — Location Details — 2 images (`bs-maison-beauty-spa-location-details-01`, `bs-maison-beauty-spa-location-details-02`)
- `opening-hours` — Opening Hours — 2 images (`bs-maison-beauty-spa-opening-hours-01`, `bs-maison-beauty-spa-opening-hours-02`)
- `client-care` — Guest Care — 2 images (`bs-maison-beauty-spa-client-care-01`, `bs-maison-beauty-spa-client-care-02`)
- `faq` — Frequently Asked Questions — 2 images (`bs-maison-beauty-spa-faq-01`, `bs-maison-beauty-spa-faq-02`)
- `journal` — Beauty & Wellbeing Journal — 2 images (`bs-maison-beauty-spa-journal-01`, `bs-maison-beauty-spa-journal-02`)
- `beauty-guides` — Practical Beauty Guides — 2 images (`bs-maison-beauty-spa-beauty-guides-01`, `bs-maison-beauty-spa-beauty-guides-02`)
- `article-detail` — Article Detail — 2 images (`bs-maison-beauty-spa-article-detail-01`, `bs-maison-beauty-spa-article-detail-02`)
- `seasonal-edit` — The Seasonal Edit — 2 images (`bs-maison-beauty-spa-seasonal-edit-01`, `bs-maison-beauty-spa-seasonal-edit-02`)
- `offers` — Current Offers — 2 images (`bs-maison-beauty-spa-offers-01`, `bs-maison-beauty-spa-offers-02`)
- `contact` — Contact the Studio — 2 images (`bs-maison-beauty-spa-contact-01`, `bs-maison-beauty-spa-contact-02`)
- `booking-policy` — Booking Policy — 2 images (`bs-maison-beauty-spa-booking-policy-01`, `bs-maison-beauty-spa-booking-policy-02`)
- `cancellation-policy` — Cancellation & Late Changes — 2 images (`bs-maison-beauty-spa-cancellation-policy-01`, `bs-maison-beauty-spa-cancellation-policy-02`)
- `accessibility` — Accessibility — 2 images (`bs-maison-beauty-spa-accessibility-01`, `bs-maison-beauty-spa-accessibility-02`)
- `privacy` — Privacy Notice — 2 images (`bs-maison-beauty-spa-privacy-01`, `bs-maison-beauty-spa-privacy-02`)
- `terms` — Website Terms — 2 images (`bs-maison-beauty-spa-terms-01`, `bs-maison-beauty-spa-terms-02`)
- `careers` — Careers — 2 images (`bs-maison-beauty-spa-careers-01`, `bs-maison-beauty-spa-careers-02`)
- `partnerships` — Partnership Enquiries — 2 images (`bs-maison-beauty-spa-partnerships-01`, `bs-maison-beauty-spa-partnerships-02`)

### The Hair Atelier — 40 pages / 83 unique assets

- `home` — Home — 5 images (`bs-the-hair-atelier-home-01`, `bs-the-hair-atelier-home-02`, `bs-the-hair-atelier-home-03`, `bs-the-hair-atelier-home-04`, `bs-the-hair-atelier-home-05`)
- `hair-services` — Hair Services — 2 images (`bs-the-hair-atelier-hair-services-01`, `bs-the-hair-atelier-hair-services-02`)
- `haircuts` — Cuts & Finishes — 2 images (`bs-the-hair-atelier-haircuts-01`, `bs-the-hair-atelier-haircuts-02`)
- `hair-colour` — Colour Services — 2 images (`bs-the-hair-atelier-hair-colour-01`, `bs-the-hair-atelier-hair-colour-02`)
- `balayage` — Balayage & Highlights — 2 images (`bs-the-hair-atelier-balayage-01`, `bs-the-hair-atelier-balayage-02`)
- `blowouts-and-styling` — Blowouts & Styling — 2 images (`bs-the-hair-atelier-blowouts-and-styling-01`, `bs-the-hair-atelier-blowouts-and-styling-02`)
- `hair-treatments` — Hair Treatments — 2 images (`bs-the-hair-atelier-hair-treatments-01`, `bs-the-hair-atelier-hair-treatments-02`)
- `extensions` — Extensions & Added Length — 2 images (`bs-the-hair-atelier-extensions-01`, `bs-the-hair-atelier-extensions-02`)
- `consultation` — Colour & Style Consultation — 2 images (`bs-the-hair-atelier-consultation-01`, `bs-the-hair-atelier-consultation-02`)
- `service-menu` — Hair Service Menu — 2 images (`bs-the-hair-atelier-service-menu-01`, `bs-the-hair-atelier-service-menu-02`)
- `stylist-directory` — Meet the Stylists — 2 images (`bs-the-hair-atelier-stylist-directory-01`, `bs-the-hair-atelier-stylist-directory-02`)
- `stylist-profile` — Stylist Profile — 2 images (`bs-the-hair-atelier-stylist-profile-01`, `bs-the-hair-atelier-stylist-profile-02`)
- `portfolio` — The Atelier Portfolio — 2 images (`bs-the-hair-atelier-portfolio-01`, `bs-the-hair-atelier-portfolio-02`)
- `colour-gallery` — Colour Stories — 2 images (`bs-the-hair-atelier-colour-gallery-01`, `bs-the-hair-atelier-colour-gallery-02`)
- `cut-gallery` — Cut & Shape Gallery — 2 images (`bs-the-hair-atelier-cut-gallery-01`, `bs-the-hair-atelier-cut-gallery-02`)
- `packages` — Service Packages — 2 images (`bs-the-hair-atelier-packages-01`, `bs-the-hair-atelier-packages-02`)
- `pricing-guide` — Pricing Guide — 2 images (`bs-the-hair-atelier-pricing-guide-01`, `bs-the-hair-atelier-pricing-guide-02`)
- `book-appointment` — Request an Appointment — 2 images (`bs-the-hair-atelier-book-appointment-01`, `bs-the-hair-atelier-book-appointment-02`)
- `appointment-request` — Appointment Request Details — 2 images (`bs-the-hair-atelier-appointment-request-01`, `bs-the-hair-atelier-appointment-request-02`)
- `first-visit` — First Visit at the Atelier — 2 images (`bs-the-hair-atelier-first-visit-01`, `bs-the-hair-atelier-first-visit-02`)
- `colour-preparation` — Preparing for Colour — 2 images (`bs-the-hair-atelier-colour-preparation-01`, `bs-the-hair-atelier-colour-preparation-02`)
- `aftercare-guide` — Hair Service Aftercare — 2 images (`bs-the-hair-atelier-aftercare-guide-01`, `bs-the-hair-atelier-aftercare-guide-02`)
- `hair-care-journal` — Hair Care Journal — 2 images (`bs-the-hair-atelier-hair-care-journal-01`, `bs-the-hair-atelier-hair-care-journal-02`)
- `product-edit` — Tools & Product Edit — 2 images (`bs-the-hair-atelier-product-edit-01`, `bs-the-hair-atelier-product-edit-02`)
- `tool-guide` — Choosing Your Styling Tools — 2 images (`bs-the-hair-atelier-tool-guide-01`, `bs-the-hair-atelier-tool-guide-02`)
- `studio-story` — The Studio Story — 2 images (`bs-the-hair-atelier-studio-story-01`, `bs-the-hair-atelier-studio-story-02`)
- `creative-philosophy` — Creative Philosophy — 2 images (`bs-the-hair-atelier-creative-philosophy-01`, `bs-the-hair-atelier-creative-philosophy-02`)
- `locations` — Studio Locations — 2 images (`bs-the-hair-atelier-locations-01`, `bs-the-hair-atelier-locations-02`)
- `location-details` — Location Details — 2 images (`bs-the-hair-atelier-location-details-01`, `bs-the-hair-atelier-location-details-02`)
- `opening-hours` — Opening Hours — 2 images (`bs-the-hair-atelier-opening-hours-01`, `bs-the-hair-atelier-opening-hours-02`)
- `guest-care` — Guest Care & Consultation — 2 images (`bs-the-hair-atelier-guest-care-01`, `bs-the-hair-atelier-guest-care-02`)
- `faq` — Frequently Asked Questions — 2 images (`bs-the-hair-atelier-faq-01`, `bs-the-hair-atelier-faq-02`)
- `journal` — The Hair Journal — 2 images (`bs-the-hair-atelier-journal-01`, `bs-the-hair-atelier-journal-02`)
- `article-detail` — Article Detail — 2 images (`bs-the-hair-atelier-article-detail-01`, `bs-the-hair-atelier-article-detail-02`)
- `booking-policy` — Booking Policy — 2 images (`bs-the-hair-atelier-booking-policy-01`, `bs-the-hair-atelier-booking-policy-02`)
- `cancellation-policy` — Cancellation Policy — 2 images (`bs-the-hair-atelier-cancellation-policy-01`, `bs-the-hair-atelier-cancellation-policy-02`)
- `accessibility` — Accessibility — 2 images (`bs-the-hair-atelier-accessibility-01`, `bs-the-hair-atelier-accessibility-02`)
- `privacy` — Privacy Notice — 2 images (`bs-the-hair-atelier-privacy-01`, `bs-the-hair-atelier-privacy-02`)
- `terms` — Website Terms — 2 images (`bs-the-hair-atelier-terms-01`, `bs-the-hair-atelier-terms-02`)
- `careers` — Join the Atelier — 2 images (`bs-the-hair-atelier-careers-01`, `bs-the-hair-atelier-careers-02`)

### Forme Nail & Brow Studio — 40 pages / 83 unique assets

- `home` — Home — 5 images (`bs-forme-nail-brow-home-01`, `bs-forme-nail-brow-home-02`, `bs-forme-nail-brow-home-03`, `bs-forme-nail-brow-home-04`, `bs-forme-nail-brow-home-05`)
- `nail-services` — Nail Services — 2 images (`bs-forme-nail-brow-nail-services-01`, `bs-forme-nail-brow-nail-services-02`)
- `manicure` — Manicure — 2 images (`bs-forme-nail-brow-manicure-01`, `bs-forme-nail-brow-manicure-02`)
- `pedicure` — Pedicure — 2 images (`bs-forme-nail-brow-pedicure-01`, `bs-forme-nail-brow-pedicure-02`)
- `gel-nails` — Gel Nail Finishes — 2 images (`bs-forme-nail-brow-gel-nails-01`, `bs-forme-nail-brow-gel-nails-02`)
- `extensions` — Nail Extensions — 2 images (`bs-forme-nail-brow-extensions-01`, `bs-forme-nail-brow-extensions-02`)
- `nail-art` — Nail Art — 2 images (`bs-forme-nail-brow-nail-art-01`, `bs-forme-nail-brow-nail-art-02`)
- `nail-repair` — Nail Repair & Refresh — 2 images (`bs-forme-nail-brow-nail-repair-01`, `bs-forme-nail-brow-nail-repair-02`)
- `brow-services` — Brow Services — 2 images (`bs-forme-nail-brow-brow-services-01`, `bs-forme-nail-brow-brow-services-02`)
- `lash-services` — Lash Services — 2 images (`bs-forme-nail-brow-lash-services-01`, `bs-forme-nail-brow-lash-services-02`)
- `brow-shaping` — Brow Shaping — 2 images (`bs-forme-nail-brow-brow-shaping-01`, `bs-forme-nail-brow-brow-shaping-02`)
- `lash-lifts` — Lash Styling — 2 images (`bs-forme-nail-brow-lash-lifts-01`, `bs-forme-nail-brow-lash-lifts-02`)
- `service-menu` — Nail, Brow & Lash Menu — 2 images (`bs-forme-nail-brow-service-menu-01`, `bs-forme-nail-brow-service-menu-02`)
- `design-gallery` — Design Gallery — 2 images (`bs-forme-nail-brow-design-gallery-01`, `bs-forme-nail-brow-design-gallery-02`)
- `nail-art-detail` — Nail Design Detail — 2 images (`bs-forme-nail-brow-nail-art-detail-01`, `bs-forme-nail-brow-nail-art-detail-02`)
- `technician-directory` — Meet the Technicians — 2 images (`bs-forme-nail-brow-technician-directory-01`, `bs-forme-nail-brow-technician-directory-02`)
- `technician-profile` — Technician Profile — 2 images (`bs-forme-nail-brow-technician-profile-01`, `bs-forme-nail-brow-technician-profile-02`)
- `packages` — Service Packages — 2 images (`bs-forme-nail-brow-packages-01`, `bs-forme-nail-brow-packages-02`)
- `pricing-guide` — Pricing Guide — 2 images (`bs-forme-nail-brow-pricing-guide-01`, `bs-forme-nail-brow-pricing-guide-02`)
- `book-appointment` — Request an Appointment — 2 images (`bs-forme-nail-brow-book-appointment-01`, `bs-forme-nail-brow-book-appointment-02`)
- `appointment-request` — Appointment Request Details — 2 images (`bs-forme-nail-brow-appointment-request-01`, `bs-forme-nail-brow-appointment-request-02`)
- `first-visit` — Your First Visit — 2 images (`bs-forme-nail-brow-first-visit-01`, `bs-forme-nail-brow-first-visit-02`)
- `nail-preparation` — Before Your Nail Visit — 2 images (`bs-forme-nail-brow-nail-preparation-01`, `bs-forme-nail-brow-nail-preparation-02`)
- `aftercare-guide` — Nail, Brow & Lash Aftercare — 2 images (`bs-forme-nail-brow-aftercare-guide-01`, `bs-forme-nail-brow-aftercare-guide-02`)
- `hygiene-and-care` — Studio Hygiene & Care — 2 images (`bs-forme-nail-brow-hygiene-and-care-01`, `bs-forme-nail-brow-hygiene-and-care-02`)
- `studio-story` — The Forme Studio — 2 images (`bs-forme-nail-brow-studio-story-01`, `bs-forme-nail-brow-studio-story-02`)
- `design-philosophy` — Design Philosophy — 2 images (`bs-forme-nail-brow-design-philosophy-01`, `bs-forme-nail-brow-design-philosophy-02`)
- `memberships` — Memberships — 2 images (`bs-forme-nail-brow-memberships-01`, `bs-forme-nail-brow-memberships-02`)
- `gift-cards` — Gift Cards — 2 images (`bs-forme-nail-brow-gift-cards-01`, `bs-forme-nail-brow-gift-cards-02`)
- `locations` — Studio Locations — 2 images (`bs-forme-nail-brow-locations-01`, `bs-forme-nail-brow-locations-02`)
- `opening-hours` — Opening Hours — 2 images (`bs-forme-nail-brow-opening-hours-01`, `bs-forme-nail-brow-opening-hours-02`)
- `guest-care` — Guest Care — 2 images (`bs-forme-nail-brow-guest-care-01`, `bs-forme-nail-brow-guest-care-02`)
- `faq` — Frequently Asked Questions — 2 images (`bs-forme-nail-brow-faq-01`, `bs-forme-nail-brow-faq-02`)
- `journal` — The Forme Journal — 2 images (`bs-forme-nail-brow-journal-01`, `bs-forme-nail-brow-journal-02`)
- `article-detail` — Article Detail — 2 images (`bs-forme-nail-brow-article-detail-01`, `bs-forme-nail-brow-article-detail-02`)
- `booking-policy` — Booking Policy — 2 images (`bs-forme-nail-brow-booking-policy-01`, `bs-forme-nail-brow-booking-policy-02`)
- `cancellation-policy` — Cancellation Policy — 2 images (`bs-forme-nail-brow-cancellation-policy-01`, `bs-forme-nail-brow-cancellation-policy-02`)
- `accessibility` — Accessibility — 2 images (`bs-forme-nail-brow-accessibility-01`, `bs-forme-nail-brow-accessibility-02`)
- `privacy` — Privacy Notice — 2 images (`bs-forme-nail-brow-privacy-01`, `bs-forme-nail-brow-privacy-02`)
- `terms` — Website Terms — 2 images (`bs-forme-nail-brow-terms-01`, `bs-forme-nail-brow-terms-02`)

### The Bridal Edit — 40 pages / 83 unique assets

- `home` — Home — 5 images (`bs-the-bridal-edit-home-01`, `bs-the-bridal-edit-home-02`, `bs-the-bridal-edit-home-03`, `bs-the-bridal-edit-home-04`, `bs-the-bridal-edit-home-05`)
- `makeup-services` — Makeup Services — 2 images (`bs-the-bridal-edit-makeup-services-01`, `bs-the-bridal-edit-makeup-services-02`)
- `bridal-makeup` — Bridal Makeup — 2 images (`bs-the-bridal-edit-bridal-makeup-01`, `bs-the-bridal-edit-bridal-makeup-02`)
- `wedding-party` — Wedding-Party Makeup — 2 images (`bs-the-bridal-edit-wedding-party-01`, `bs-the-bridal-edit-wedding-party-02`)
- `event-makeup` — Event Makeup — 2 images (`bs-the-bridal-edit-event-makeup-01`, `bs-the-bridal-edit-event-makeup-02`)
- `photoshoot-makeup` — Photoshoot Makeup — 2 images (`bs-the-bridal-edit-photoshoot-makeup-01`, `bs-the-bridal-edit-photoshoot-makeup-02`)
- `party-makeup` — Party & Celebration Makeup — 2 images (`bs-the-bridal-edit-party-makeup-01`, `bs-the-bridal-edit-party-makeup-02`)
- `makeup-trials` — Bridal Makeup Trials — 2 images (`bs-the-bridal-edit-makeup-trials-01`, `bs-the-bridal-edit-makeup-trials-02`)
- `bridal-packages` — Bridal Packages — 2 images (`bs-the-bridal-edit-bridal-packages-01`, `bs-the-bridal-edit-bridal-packages-02`)
- `service-menu` — Makeup Service Menu — 2 images (`bs-the-bridal-edit-service-menu-01`, `bs-the-bridal-edit-service-menu-02`)
- `portfolio` — The Portfolio — 2 images (`bs-the-bridal-edit-portfolio-01`, `bs-the-bridal-edit-portfolio-02`)
- `bridal-looks` — Bridal Look Stories — 2 images (`bs-the-bridal-edit-bridal-looks-01`, `bs-the-bridal-edit-bridal-looks-02`)
- `look-detail` — Look Detail — 2 images (`bs-the-bridal-edit-look-detail-01`, `bs-the-bridal-edit-look-detail-02`)
- `artist-directory` — Meet the Artists — 2 images (`bs-the-bridal-edit-artist-directory-01`, `bs-the-bridal-edit-artist-directory-02`)
- `artist-profile` — Artist Profile — 2 images (`bs-the-bridal-edit-artist-profile-01`, `bs-the-bridal-edit-artist-profile-02`)
- `packages` — Occasion Packages — 2 images (`bs-the-bridal-edit-packages-01`, `bs-the-bridal-edit-packages-02`)
- `pricing-guide` — Pricing Guide — 2 images (`bs-the-bridal-edit-pricing-guide-01`, `bs-the-bridal-edit-pricing-guide-02`)
- `book-consultation` — Request a Bridal Consultation — 2 images (`bs-the-bridal-edit-book-consultation-01`, `bs-the-bridal-edit-book-consultation-02`)
- `consultation-request` — Consultation Request Details — 2 images (`bs-the-bridal-edit-consultation-request-01`, `bs-the-bridal-edit-consultation-request-02`)
- `bridal-timeline` — Bridal Beauty Timeline — 2 images (`bs-the-bridal-edit-bridal-timeline-01`, `bs-the-bridal-edit-bridal-timeline-02`)
- `wedding-party-planning` — Wedding-Party Planning — 2 images (`bs-the-bridal-edit-wedding-party-planning-01`, `bs-the-bridal-edit-wedding-party-planning-02`)
- `destination-services` — Destination & Travel Services — 2 images (`bs-the-bridal-edit-destination-services-01`, `bs-the-bridal-edit-destination-services-02`)
- `travel-policy` — Travel & Location Policy — 2 images (`bs-the-bridal-edit-travel-policy-01`, `bs-the-bridal-edit-travel-policy-02`)
- `preparation-guide` — Preparing for Your Makeup Session — 2 images (`bs-the-bridal-edit-preparation-guide-01`, `bs-the-bridal-edit-preparation-guide-02`)
- `aftercare-guide` — Makeup Aftercare — 2 images (`bs-the-bridal-edit-aftercare-guide-01`, `bs-the-bridal-edit-aftercare-guide-02`)
- `kit-and-products` — The Artist's Kit — 2 images (`bs-the-bridal-edit-kit-and-products-01`, `bs-the-bridal-edit-kit-and-products-02`)
- `gift-cards` — Gift Cards — 2 images (`bs-the-bridal-edit-gift-cards-01`, `bs-the-bridal-edit-gift-cards-02`)
- `our-story` — Our Story — 2 images (`bs-the-bridal-edit-our-story-01`, `bs-the-bridal-edit-our-story-02`)
- `artistry-philosophy` — Artistry Philosophy — 2 images (`bs-the-bridal-edit-artistry-philosophy-01`, `bs-the-bridal-edit-artistry-philosophy-02`)
- `locations` — Service Locations — 2 images (`bs-the-bridal-edit-locations-01`, `bs-the-bridal-edit-locations-02`)
- `availability` — Date & Availability Enquiry — 2 images (`bs-the-bridal-edit-availability-01`, `bs-the-bridal-edit-availability-02`)
- `client-care` — Client Care — 2 images (`bs-the-bridal-edit-client-care-01`, `bs-the-bridal-edit-client-care-02`)
- `faq` — Frequently Asked Questions — 2 images (`bs-the-bridal-edit-faq-01`, `bs-the-bridal-edit-faq-02`)
- `journal` — The Bridal Journal — 2 images (`bs-the-bridal-edit-journal-01`, `bs-the-bridal-edit-journal-02`)
- `article-detail` — Article Detail — 2 images (`bs-the-bridal-edit-article-detail-01`, `bs-the-bridal-edit-article-detail-02`)
- `booking-policy` — Booking Policy — 2 images (`bs-the-bridal-edit-booking-policy-01`, `bs-the-bridal-edit-booking-policy-02`)
- `cancellation-policy` — Cancellation Policy — 2 images (`bs-the-bridal-edit-cancellation-policy-01`, `bs-the-bridal-edit-cancellation-policy-02`)
- `accessibility` — Accessibility — 2 images (`bs-the-bridal-edit-accessibility-01`, `bs-the-bridal-edit-accessibility-02`)
- `privacy` — Privacy Notice — 2 images (`bs-the-bridal-edit-privacy-01`, `bs-the-bridal-edit-privacy-02`)
- `terms` — Website Terms — 2 images (`bs-the-bridal-edit-terms-01`, `bs-the-bridal-edit-terms-02`)

## Asset register and rights

- **Source:** original first-party procedural SVG illustrations generated by the WordPress Studio storefront renderer; no stock-provider hotlinks or external image URLs.
- **Creator:** WordPress Studio design engine.
- **License:** original in-house generated artwork; no third-party license required.
- **Attribution:** not required.
- **Date checked:** 2026-11-09.
- **Asset path pattern:** `inline:beautyArtSrc/{asset_id}`.
- **Unique ID pattern:** `bs-{template_key}-{page_key}-{01..05}`; homepage receives 5 IDs, each inner page receives 2.
- **Alt text:** descriptive page-specific alt text is stored on every asset record.
- **Navigation:** all interactive images link only to same-site internal routes; images without a useful destination remain non-interactive.
- **No fabricated evidence:** artwork is illustrative, not a real client, staff member, treatment outcome, salon interior or portfolio result. Replace it with operator-approved imagery when supplied.

## Appointment and conversion behavior

The templates collect service, preferred date, preferred time window, optional stylist/artist preference, contact details and consent. The request is sent through the existing shared `storefrontApi().submitQuoteRequest` adapter and remains scoped to the current website/tenant. The UI explicitly says a request is not a confirmed appointment. No new booking engine, second admin panel, payment path or duplicate customer/order system is introduced.

The public template showcase remains isolated: showcase settings disable appointments and enquiries. A live website can accept requests only after the owner configures and publishes the site's request workflow. Availability is not checked in real time; staff must confirm manually. Deposits, cancellation charges, pricing, opening hours, staff credentials, service claims and policies are operator-supplied.

## Safety, trust and content constraints

- No medical/clinical procedures, diagnosis or treatment claims.
- No fabricated reviews, staff biographies, qualifications, client photographs or before/after claims.
- No unverified prices, addresses, hours, availability or cancellation terms.
- Skin/hair/nail guidance remains general, non-medical and operator-reviewed.
- Consent is required before contact about a request.
- Showcase preview forms are disabled; no real booking or payment is implied.

## Implementation files

- `admin/wordpress-templates.js` — four category entries, Beauty preview renderer and showcase routing.
- `admin/wordpress-templates.css` — four distinct responsive preview identities.
- `admin/neon-builder-api.js` — template allowlist, category mapping, exact 40-page and 83-asset validation, showcase eligibility.
- `admin/website-builder.js` — matching editor visual profiles.
- `storefront.js` / `storefront.css` — service-led storefront pages, original art rendering, internal image navigation, responsive request form and shared request-desk adapter.
- `wordpress-app/migrations/20261109_beauty_salon_templates.sql` — additive/idempotent Neon catalog, design and 160-page seed with post-write assertions.

## Research references

- [Clikiti Research — State of Independent Salon and Barbershop Websites (15 Oct 2026)](https://clikiti.com/research/posts/salon-websites-booking-without-the-fine-print) — Directional review of 193 independent sites: provider booking is common, while cancellation/no-show terms and access information are less consistently disclosed.
- [Zenoti — Beauty & Wellness Industry Statistics 2025](https://www.zenoti.com/thecheckin/beauty-wellness-industry-statistics-2025) — Vendor benchmark on online booking, rebooking, retention and cancellations; used as directional context only.
- [Fresha — Salon Policies: What to Include and How to Set Them Up](https://www.fresha.com/blog/salon-policies) — Guidance on publishing notice windows, deposits, late-arrival and no-show policies; exact terms remain operator-configured.
- [Booksy Help — Deposits vs Cancellation Fees](https://support.booksy.com/hc/en-us/articles/16487431553810-What-is-the-difference-between-Deposits-and-Cancellation-Fees) — Clarifies deposits and cancellation fees are distinct mechanisms; neither is enabled here.

## Release verification targets

- Four templates visible at the Beauty & Salon admin route.
- 40 active pages and 83 unique assets for each template; 160 pages and 332 unique assets total.
- Homepage 5 images; every inner page 2 images; no external image URLs.
- Preview and editor links resolve to the correct template key and category.
- Public showcase preview disables appointment/enquiry submission.
- Live appointment requests use the shared request desk and explicitly require manual confirmation.
- Desktop/mobile visual review, internal-link crawl, keyboard/focus review, console checks and existing-template regression checks are required before declaring the suite production-ready.
