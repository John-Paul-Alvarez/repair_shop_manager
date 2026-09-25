# Homepage top-section reference

September 24, 2026. The current homepage intentionally contains only the header, photographic hero, and four benefit items. Lower sections are deferred until the user has reviewed this chunk.

## Layout and behavior

- Desktop geometry follows the supplied 940 × 510 crop: approximately 419px of hero and an 80px benefit strip at that width.
- Transparent navigation, left-aligned two-line headline, and realistic laptop/phone imagery replace the earlier flat device panels.
- Text, navigation, CTAs, and benefit icons are HTML/SVG. Device screens are part of the illustrative photograph, not interactive app screenshots.
- Start free links to account creation. Sign in links to the existing sign-in route.
- Explore demo opens the searchable, fictional sample queue in a keyboard-accessible dialog. Header buttons open concise feature, role, security, or demo dialogs while the lower sections are deferred.
- No invented review rating, customer endorsement, pricing, or video claim. The reference's trust row becomes a row representing the four roles.
- Mobile stacks the text above the device photograph and lays out benefits in two columns.

## Asset

`frontend/public/images/landing-top-workshop.png` was produced with the built-in image-generation tool using the user-supplied crop as the reference. It is a product illustration, not evidence of actual customer records or the exact operational app layout.

Generation prompt:

> Create a photographic website HERO BACKGROUND ASSET based extremely closely on the supplied reference. Output wide landscape 1880 by 836 pixels (aspect 2.249), corresponding ONLY to the reference's top photographic section from y=0 to y=418; DO NOT include the bottom feature strip. Preserve reference camera angle, warm cream sunlit electronics workshop, leafy plant along far left, softly blurred shelves, wooden counter across the entire bottom, realistic silver laptop on the right and upright black smartphone in front of its lower-left corner. Laptop frame roughly x50% to97%, y12% to90%; phone x43% to57%, y44% to99%. Laptop must have physical keyboard/base resting on the bench. Match physical devices and scene perspective. Crucial: REMOVE all marketing text, all logo/header/navigation/CTA overlays, stars, avatar row, and trust text from outside the devices. Keep the LEFT 6%-43% and TOP 0%-11% as clean bright ivory wall/negative space for HTML text overlays. Do not fill that negative space with objects. Preserve the right-hand device screens, but update their UI to truthful Repair Shop Manager product illustrations: laptop shows compact app title Repair Shop Manager, left dark sidebar with Work Orders selected orange, Invite staff, Shop settings only (NO Dashboard, inventory, payments, reports); main view shows Work Orders and a compact 6-row sample queue with Customer, Device, Technician, Status columns and purple In Progress, amber Pending, green Completed badges. Phone shows Track your repair, order WO-1043, iPhone 14 Pro, Current status: In Progress in a purple card, and a Contact the shop button. NO tracking entry form, NO Testing stage, NO timeline dates, NO claim ready for collection. Fine readable UI typography. Keep familiar black phone frame and slight angle from reference. Photorealistic, sharp, premium commercial web photography, warm ivory #F5F2EC, burnt orange #B54708 highlights. No floating UI panels outside devices, no extra people, no watermark. This is only the background photo with physical devices; no website page text outside devices.

## Verification

- Production frontend build passes.
- Browser visual comparison at 940 × 510 and responsive inspection at 390 × 844.
- Demo opens, search returns no-results feedback, clear-search restores sample rows, and Escape closes the dialog.
- Mobile navigation opens the role dialog and closes correctly.
- No backend or database changes are included.
