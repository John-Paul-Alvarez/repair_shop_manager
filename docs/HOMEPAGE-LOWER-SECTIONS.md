# Homepage roles, security, previews, and final call to action

Added below the existing feature section, following the supplied reference crop:

- Charcoal workshop background with four photographic role cards.
- Four dark security tiles beside the introductory copy.
- Customer tracking and technician workspace illustrations.
- Photographic closing banner with working account links.

Roles, Security, and Demo navigation now use section anchors; the mobile menu closes after selection. Explore sample opens the existing searchable sample queue. Start free links to `/create-account`; Sign in links to `/sign-in`.

Copy reflects supported features. No revenue reports, pricing plans, live updates, photo uploads, or Testing status are advertised. Interface illustrations use fictional records and are marked as previews. Decorative preview controls are not focusable and do not imply working forms.

## Verification

- Frontend production build passed on September 27, 2026.
- Previous browser session checked 940px desktop, 600px tablet, and 390px/320px phone widths, section navigation, mobile-menu closure, and sample search (Maya returned one of three orders).
- Fixed miniature-preview clipping and checked final desktop preview content fits within its containers.
- Frontend and API restarted successfully; API reports MongoDB connected.
- A fresh final screenshot and complete account-link navigation check could not be completed after restarting: the in-app browser automation surface was unavailable. The previous Sign in attempt reached the app’s connection error while the API was stopped; authentication itself was not changed or retested as part of this visual update.

## Image asset

Generated using the built-in image-generation tool; saved at `frontend/public/images/landing-technician.png`. Other workshop photos reuse existing local assets.

Final generation prompt:

> Use case: photorealistic-natural. Asset: wide photograph for a repair shop software website role card. Macro close-up of a professional technician's blue nitrile gloved hands carefully repairing an opened black smartphone, intricate internal components and black battery visible, tiny precision screwdriver at upper right. Device lies diagonally across lower center. Warm beige electronics workshop softly out of focus behind, afternoon sunlight, premium natural editorial photography. Hands enter from both sides, phone fills lower two thirds. No faces, no typography, no brand logos, no watermark. Landscape 3:2, realistic materials, accurate hands and repair tools.
