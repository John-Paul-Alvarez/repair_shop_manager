# Sprint 0 — Verification record

Verified September 19, 2026 against the acceptance criteria in [Sprints and user stories](SPRINTS-AND-USER-STORIES.md#6-sprint-0--foundation-and-homepage).

**Result: complete.** The existing implementation satisfies all four Sprint 0 stories. This pass required documentation updates only; no application changes or additional features were needed.

## Acceptance evidence

| Story | Evidence | Result |
| --- | --- | --- |
| FND-01 — Project structure | `frontend/`, `backend/`, and `docs/` exist. README describes the installed and planned stack, local commands, and free-only constraint. Scoped Git ignore checks confirm `.env`, dependencies, and build output are excluded; `.env.example` is allowed. | Pass |
| WEB-01 — Understand the product | Homepage retains the saved photographic design, cream surfaces, charcoal hero, and burnt-orange actions. Workspace and workflow links reach their sections. Desktop and mobile browser checks confirm responsive rendering. | Pass |
| WEB-02 — Explore a sample repair queue | All three sample orders show customer, device, technician, and labeled status. Searching `maya` returns WO-1043 only. Searching `no-such-order` shows no-results feedback; Clear search restores all three records. The workspace and record count explicitly identify sample data. | Pass |
| FND-02 — Run the API foundation | Backend production compilation and development startup succeed. Live health endpoint returns HTTP 200 and `database: "not_configured"`. Local frontend CORS is present. All 10 configuration/API tests pass. MongoDB connection support is present but not connected to Atlas. | Pass |

## Commands and live API check

Run each command from the indicated folder:

| Folder | Command | Result |
| --- | --- | --- |
| `frontend/` | `npm run build` | TypeScript check and Vite production build pass |
| `frontend/` | `npm run dev` | Serves homepage at `http://127.0.0.1:5173/` |
| `backend/` | `npm run build` | TypeScript compilation passes |
| `backend/` | `npm test` | 10 passed, 0 failed |
| `backend/` | `npm run dev` | Serves API at `http://127.0.0.1:4000/` without database credentials |

Live `GET /api/health` returned HTTP 200:

```json
{
  "status": "ok",
  "service": "repair-shop-manager-api",
  "database": "not_configured"
}
```

A request with `Origin: http://127.0.0.1:5173` received the matching `Access-Control-Allow-Origin` header.

The automated tests cover unconfigured and unavailable database health, allowed CORS origins, JSON 404 responses, malformed JSON, oversized bodies, local defaults, invalid ports, exact-origin validation, and database configuration validation without exposing supplied credentials. Database outage tests use a stub; they do not test a live Atlas connection.

## Browser checks

- Desktop at 1440px, mobile at 390px, and an additional width check at 320px: no horizontal page overflow.
- Mobile hero retains its photograph; order rows become readable labeled summaries.
- Photo and icon assets load successfully.
- Desktop navigation reaches `#workspace` and `#how-it-works`; mobile's hero link reaches the sample workspace.
- Matching search, no-results feedback, and clear-search recovery pass.
- Create your shop, Sign in, and New work order each show the appropriate availability notice.
- Escape dismisses the order notice and returns focus to its triggering button.
- No browser console warnings or errors were observed during these checks.

## Sprint boundary

Atlas is not connected. Authentication, onboarding, and repair-order APIs are not implemented. Homepage records remain illustrative local data; account and order actions explain their availability without creating or saving records. No paid services, deployments, or Sprint 1 features were introduced.
