# Beauty & Salon Photography Asset Register

Checked: 2026-11-09  
Source: Unsplash contributors  
License: Unsplash License (each selected photo page identifies the image as free to use under the Unsplash License). Attribution is not required by the license, but creator credit and source links are retained here.  
Delivery: responsive Unsplash CDN URLs (images.unsplash.com) with auto=format, crop and width parameters. Images are not mirrored into the repository in this release.

## Placement and image budget

- Each homepage uses five distinct photographs: one hero photograph and four service-card photographs.
- Each non-homepage Beauty & Salon page renders two photographs in its editorial media section or appointment-request panel.
- Photos are never linked off-site; clickable photo cards navigate only to an internal page on the same storefront.
- Images use descriptive alt text, responsive object-fit: cover, lazy loading for below-the-fold content and high priority for the hero image.
- The same photo set is used by the corresponding admin live preview and customer-facing showcase so the two views remain visually consistent.

## Maison Beauty & Spa

| Asset | Intended placement | Creator | Unsplash source |
|---|---|---|---|
| Facial cleansing treatment | Homepage hero / facial rituals | kimia kazemi | https://unsplash.com/photos/a-person-receiving-a-facial-treatment-RbIcMsh0NSk |
| Facial massage | Service card / skin consultation | Anna Keibalo | https://unsplash.com/photos/a-woman-getting-a-facial-massage-at-a-spa-qybZ2w0CzMw |
| Warm towel facial | Service card / spa rituals | Stephen Olmo | https://unsplash.com/photos/spa-treatment-with-a-towel-covering-the-face-EpKT9rdinCA |
| Facial skincare close-up | Service card / skin care story | Dominique Rivas | https://unsplash.com/photos/a-woman-getting-a-facial-massage-on-her-face-rWwuf8yKw4Y |
| Back massage | Service card / body-care ritual | Simon HUMLER | https://unsplash.com/photos/a-woman-getting-a-back-massage-at-a-spa--AakIaAPV0w |

## The Hair Atelier

| Asset | Intended placement | Creator | Unsplash source |
|---|---|---|---|
| Salon haircut session | Homepage hero / cut and finish | Aditya Sethia | https://unsplash.com/photos/a-woman-getting-her-hair-cut-at-a-salon-jWaK7wl0b1s |
| Hair washing and care | Service card / hair treatments | Lindsay Cash | https://unsplash.com/photos/a-woman-getting-her-hair-cut-by-a-hair-stylist-Md_DhaFsnCQ |
| Contemporary salon styling floor | Service card / studio story | Vinicius "amnx" Amano | https://unsplash.com/photos/a-woman-getting-her-hair-done-in-a-salon-lK8oXGycy88 |
| Bridal updo styling | Service card / occasion styling | Alexander Mass | https://unsplash.com/photos/hairstylist-creating-an-updo-for-a-seated-client-g0cSOCHaHiY |
| Precision haircut | Service card / stylist profile | Kristina Goncharova | https://unsplash.com/photos/a-barber-cuts-a-clients-hair-in-a-salon-cAN-eg8-Q-Q |

## Forme Nail & Brow Studio

| Asset | Intended placement | Creator | Unsplash source |
|---|---|---|---|
| Nail technician at work | Homepage hero / manicure | Giorgio Trovato | https://unsplash.com/photos/a-woman-getting-her-nails-done-at-a-nail-salon-gb6gtiTZKB8 |
| Nail treatment close-up | Service card / nail services | Anna Keibalo | https://unsplash.com/photos/a-woman-getting-her-nails-done-at-a-salon-refgCopwymo |
| Manicure detail | Service card / nail finishes | Behnaz Kh | https://unsplash.com/photos/a-woman-is-doing-a-manicure-on-her-nails-c9zCtwGsJAA |
| Nail studio interior | Service card / studio experience | Or Hakim | https://unsplash.com/photos/a-nail-salon-with-chairs-and-a-counter-0jR7w4OW5SQ |
| Finished nail art | Service card / design gallery | Budka Damdinsuren | https://unsplash.com/photos/womans-nails-with-manicure-jRXxNpA6d_k |

## The Bridal Edit

| Asset | Intended placement | Creator | Unsplash source |
|---|---|---|---|
| Bride with makeup artists | Homepage hero / bridal makeup | Alexander Mass | https://unsplash.com/photos/a-bride-getting-her-makeup-done-by-two-artists-hCZiuy70xwk |
| Bridal hair and makeup preparation | Service card / getting-ready story | Lucas T Photography | https://unsplash.com/photos/a-bride-getting-makeup-and-hair-done--A9kNJTX2vc |
| Makeup artist applying bridal look | Service card / makeup trials | Alexander Mass | https://unsplash.com/photos/bride-having-makeup-applied-by-a-makeup-artist-OWunn6bxGGg |
| Professional wedding makeup | Service card / artist portfolio | Colynary Media | https://unsplash.com/photos/a-woman-getting-her-make-up-done-by-a-professional-makeup-artist-BgKD6HaZKs8 |
| Indian bridal makeup detail | Service card / occasion portfolio | Raju Kumar | https://unsplash.com/photos/a-bride-is-having-her-makeup-applied-gkLzTqe2aoE |

## Implementation note

The CDN photo mapping is deliberately separate from the template-page records. The 83 page-level image identifiers remain intact for the builder and its image-allocation checks; the storefront renderer maps those page slots to licensed editorial photography for display. This keeps the existing page catalog stable while replacing the visible first-party placeholder artwork in the Beauty & Salon preview and storefront.
