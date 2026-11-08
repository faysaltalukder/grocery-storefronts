# Hospital & Healthcare Template Suite

Implementation record: 2026-11-08  
Category slug: `hospital-healthcare`  
Engineering baseline: `docs/MASTER_WEBSITE_ENGINEERING_STANDARD.md`

## Outcome

The Hospital & Healthcare category now has four independent business-specific template definitions, four active version-1 design records and 40 reusable page definitions per template (160 pages total). The old Grocery preview fallback is no longer used for this category. Existing Grocery catalog entries and Grocery category data were not deleted or modified.

## Four template directions

| Template key | Name | Primary business | Distinct information architecture |
|---|---|---|---|
| `multispecialty-hospital` | MedCore Hospital & Medical Center | Multi-specialty hospitals and medical centres | Institutional navigation, departments, provider directory, patient and admission guidance |
| `diagnostics-laboratory` | VitalLab Diagnostics & Laboratory | Diagnostic centres, pathology labs and imaging centres | Test catalogue, test-specific preparation, sample collection, screening packages and report support |
| `specialist-clinic` | CarePoint Specialist Clinic | Specialist clinics, consultant chambers and outpatient practices | Specialty discovery, verified provider profiles, consultation options, clinic schedules and fees |
| `telehealth-platform` | MediConnect Digital Healthcare | Telehealth and digital-health service operators | Care-category discovery, consultation request steps, technology readiness, privacy and support |

The four directions do not share a grocery layout or simply recolour one common page. Each has its own palette, hero composition, service discovery model and patient journey.

## Shared engineering architecture

- The template catalogue is registered in `builder.template_catalog`.
- Versioned design records are stored in `builder.template_designs`.
- The 40 page definitions for each template are stored in `builder.template_pages`.
- The static application remains one reusable engine; template-specific renderer branches and configuration drive the four experiences.
- Website content, page documents and business data remain scoped to each generated website.
- Admin template previews use the authenticated live storefront renderer; stale static sample fallbacks are not shown when Neon is unavailable.
- Live storefront pages use the healthcare renderer, not the grocery product catalogue, cart or checkout flow.
- Appointment requests, when explicitly enabled after compliance review, are recorded as healthcare service requests in the central request desk. They are not confirmed bookings.

## Page architecture

Each template has 40 page definitions. They cover the appropriate subset of:
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
| 40 page definitions per template | Verified in Neon |
| Homepage image limit | 5 images maximum, including hero and service cards |
| Inner-page image limit | 4 images per page, editorial image-and-copy layout |
| Any page above 5 images | 0 pages across all four templates |
| Eight patient-information resources per template | Registered in design specs and Health Library page specs |
| Category-specific admin renderer mapping | Implemented in source bundle |
| Live storefront healthcare renderer | Implemented in source bundle |
| Healthcare navigation and mobile navigation | Implemented in source bundle |
| Appointment request admin classification | Implemented in central request desk |
| Intake default state | Disabled pending provider and data-residency verification |
| Existing Grocery category data | Preserved; no Grocery template rows deleted |
| Production domain promotion | Requires final visual review and release approval |

## Deployment

The implementation is committed on branch `feature/hospital-healthcare-templates`. A staging deployment was created at:

`https://shaped-nova-t57fes7.shipstatic.com`

The staging deployment is not the production custom domain. Production promotion must happen only after the final browser review of the admin category, all four previews and mobile layouts.

## External references

- W3C, Web Content Accessibility Guidelines (WCAG) 2.2: https://www.w3.org/TR/WCAG22/
- W3C Web Accessibility Initiative, WCAG overview: https://www.w3.org/WAI/standards-guidelines/wcag/
- Bangladesh Directorate General of Health Services, National Telehealth Guideline for Bangladesh: https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-dghs/2026/2/0420ffe2-8247-454a-8902-4f2cdfe85c18.pdf
- WHO, Recommendations on Digital Interventions for Health System Strengthening: https://iris.who.int/bitstream/handle/10665/311977/WHO-RHR-19.8-eng.pdf?sequence=1
- Institute for Healthcare Improvement, Telemedicine: Ensuring Safe, Equitable, Person-Centered Virtual Care: https://www.ihi.org/library/white-papers/telemedicine-ensuring-safe-equitable-person-centered-virtual-care

These references inform design and risk boundaries; they do not replace legal, clinical or regulatory review by the provider.
