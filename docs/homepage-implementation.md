# Homepage implementation

## Reference

The user's September 17 screenshot selects the Digital Workbench design: floating navigation, dark hero with repair photography, an attached sample queue, a two-column workflow section, and a charcoal closing banner. The matching original HTML is preserved in `homepage-reference.html`.

The Figma connector returned that no layer was selected; implementation used the matching original HTML and supplied screenshot. SVG icons were extracted from that HTML. The hero photo was downloaded from the source URL in that same file and stored as `frontend/public/images/repair-workbench.jpg`. Inter is installed through the open-source `@fontsource/inter` package. The running homepage does not depend on the prototype's remote Tailwind script or remote photo URL.

## Components

- `HomePage` composes the page and manages the unavailable-feature notice.
- `SiteHeader` contains the brand, section links, and account actions.
- `RepairQueuePreview` filters three in-memory sample records.
- `StatusBadge` renders the consistent status colors and labels.
- `WorkflowSection` describes the three repair steps.
- `FeatureNotice` uses a native dialog with keyboard dismissal and focus restoration.
- `Icon` renders the original SVG assets.

## Intentional adaptations

- The footer count says “sample work orders,” since the sample includes a completed order.
- The sample search works rather than being a read-only field.
- Mobile places the photo below the hero text and transforms the queue into readable order summaries.
- Unimplemented actions explain their availability instead of linking to missing routes or pretending to save data.
- No backend, database, account forms, or repair-editing workflows were added.

## Validation

- `npm.cmd run build`: TypeScript and production build passed.
- Browser checks: desktop and 390px mobile rendering, local image/icon loading, no horizontal page overflow, search matching, empty results, clearing search, notice dismissal with Escape, and return of focus to the triggering button.
- Dependency installation reported zero known vulnerabilities at implementation time.
