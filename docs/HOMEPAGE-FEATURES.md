# Homepage feature section

Added directly below the accepted hero and benefit strip. Matches the supplied feature crop's cream background, asymmetric two-row grid, orange icon tiles, photographic intake card, and small interface previews.

Content reflects implemented features: work orders, assignment/status updates, internal repair notes, private customer tracking, public shop contact settings, and staff invitations. Inventory, service pricing, photos, activity logs, and a Testing status are not advertised. All preview records are fictional and labeled as illustrative.

The Features navigation now links to this section on desktop and mobile. Previews are static illustrations, not nonfunctional form controls. The section uses semantic headings; decorative previews are hidden from assistive technology.

## Asset

- Tool: built-in image generation.
- Saved asset: `frontend/public/images/landing-feature-intake.png`.
- React supplies the angled form and all interface text.
- Final prompt: Use case: product-mockup. Generate a photographic background asset for a repair software website feature card, landscape 2:1 aspect ratio, 1200x600. Warm cream workshop interior in soft afternoon sunlight, subtle diagonal bands of sun and shadow across ivory wall. Composition is critical: top-left 45 percent and left middle are clean pale cream empty negative space for webpage heading and paragraph, no text there. Bottom-left corner has a cropped black laptop angled toward viewer, softly defocused screen with tiny indistinct gray lines and one orange accent. Rightmost 22 percent has two elegant black smartphones standing at slight angles, one showing rear cameras and one showing cracked black front glass. Phones occupy x78-96 percent and y20-78 percent. Center x45-76 percent stays light cream empty space because a tilted white HTML form will be layered there by developer. Bottom edge is a pale oak workbench. Real photographic materials, tasteful shallow depth of field, minimal warm workshop aesthetic. No visible typography, no logos, no UI panels, no form, no buttons, no watermark. Full bleed composition.

## Verification

- Frontend production build passed.
- Browser checks at 940px, 600px, 390px, and 320px widths.
- Fixed intake-form clipping and narrow-screen card text overlaps.
- Verified Features anchor navigation and mobile menu closure.
- Desktop review capture: `docs/homepage-features-desktop.png`.
