# Hospital & Healthcare Asset Register

Checked: 2026-11-08  
Scope: four local hero illustrations used by the Hospital & Healthcare template suite.

All listed files are original vector artwork authored directly in this repository for this implementation. No third-party stock photography, identifiable people, patient records, real provider likenesses or real facility branding are used. The SVG files are hosted locally in the deployed site; no remote image hotlink is required.

| Asset | Repository path / deployed path | Creator / source | Licence and rights notes | Intended use | Accessibility |
|---|---|---|---|---|---|
| MedCore hospital illustration | `assets/healthcare-hospital.svg` | Original project SVG authored for this repository | No external source or stock licence. Review the repository's own licence before redistribution. | Illustrative hospital building and service hero | Alt text states that the image is illustrative, not a verified facility |
| VitalLab diagnostics illustration | `assets/healthcare-diagnostics.svg` | Original project SVG authored for this repository | No external source or stock licence. Review the repository's own licence before redistribution. | Abstract laboratory and test-directory hero | Alt text states that the image is illustrative, not a real laboratory |
| CarePoint clinic illustration | `assets/healthcare-clinic.svg` | Original project SVG authored for this repository | No external source or stock licence. Review the repository's own licence before redistribution. | Empty clinic-room and consultation setting | Alt text states that the image is illustrative, not a real clinic |
| MediConnect telehealth illustration | `assets/healthcare-telehealth.svg` | Original project SVG authored for this repository | No external source or stock licence. Review the repository's own licence before redistribution. | Device and digital-care interface illustration | Alt text states that the image is illustrative, not a live telehealth service |

## Production rules

- These images are visual placeholders and must not be presented as photographs of the merchant's real premises.
- A provider may replace them with owned or properly licensed facility imagery after confirming usage rights and privacy/model/property releases where applicable.
- Do not add real patient photographs, medical records, screenshots of clinical systems or identifiable provider images without documented permission.
- Keep descriptive alt text when replacing an asset; use empty alt text only when an image is purely decorative and adjacent text already conveys its meaning.


## Pexels stock photography — healthcare page imagery

Checked: 2026-11-08  
Source: Pexels photo CDN, with photo IDs and per-page placement metadata stored in `builder.template_pages.page_spec.media.images` in the Neon workspace.

| Template | Distinct photo IDs | Placements | Delivery | Licence / attribution |
|---|---:|---:|---|---|
| MedCore Hospital & Medical Center (`multispecialty-hospital`) | 60 | 161 | Pexels CDN | Pexels License; free commercial website use; attribution not required |
| VitalLab Diagnostics & Laboratory (`diagnostics-laboratory`) | 60 | 161 | Pexels CDN | Pexels License; free commercial website use; attribution not required |
| CarePoint Specialist Clinic (`specialist-clinic`) | 60 | 161 | Pexels CDN | Pexels License; free commercial website use; attribution not required |
| MediConnect Digital Healthcare (`telehealth-platform`) | 60 | 161 | Pexels CDN | Pexels License; free commercial website use; attribution not required |

- Source licence: https://www.pexels.com/license
- Terms: https://www.pexels.com/terms-of-service
- Photo URL pattern: `https://images.pexels.com/photos/{photo-id}/...` (the exact, verified CDN path is retained in the page media record).
- Attribution is not legally required under the Pexels License, but the source and license are recorded here for auditability.
- The images are illustrative stock photography, not evidence of the operator's actual clinicians, patients, premises, equipment, outcomes or service availability.
- Pexels terms restrict bulk/systematic copying and standalone redistribution without permission. The current implementation uses the Pexels image CDN and does not bulk-copy the 240-photo set into the repository. The photos themselves are not external hyperlinks: image clicks route only to internal website pages.
- If a photo depicts identifiable people, trademarks, logos or protected property, review the photo-specific context and any additional permissions before using it to imply an endorsement or a real provider relationship.
- When an image URL fails, the storefront falls back to the matching local SVG illustration. The renderer normalizes the known duplicated `pexels-photo` path segment before requesting the image.
