# Repair Shop Manager V2

A repair-shop workspace built with **JavaScript**. React components use JSX; the backend runs JavaScript directly in Node.js. TypeScript is not required.

The homepage, manager accounts, shop setup, staff invitation links, repair intake, search, manager filters, and manager repair updates are implemented.

## Start locally

Use Node.js 22.12 or newer. Open two PowerShell terminals.

**Terminal 1 — backend**

```powershell
cd "C:\Users\John Paul\Downloads\jobs\softwareDevJobs\projects\repairShopManagerV2\backend"
npm.cmd install
npm.cmd run dev
```

The existing local `backend/.env` contains the Atlas settings. For a fresh checkout, copy `.env.example` to `.env` only if it does not already exist, then fill in the connection string locally. Restart the backend after environment changes.

**Terminal 2 — frontend**

```powershell
cd "C:\Users\John Paul\Downloads\jobs\softwareDevJobs\projects\repairShopManagerV2\frontend"
npm.cmd install
npm.cmd run dev
```

Open [the app](http://127.0.0.1:5173). Keep both terminals running; Ctrl+C stops a server. Use the same hostname throughout your test. Vite forwards `/api` to the backend on port 4000. The [health endpoint](http://127.0.0.1:4000/api/health) should report `database: "connected"`.

Dependencies are already installed on the current machine, so subsequent starts only need `npm.cmd run dev` in each folder.

## Manual testing

Follow [the manual test guide](docs/MANUAL-TESTING.md) for manager registration, resumed setup, sign-in/out, invitations, employee acceptance, repair intake, and access checks.

Create account → Name your shop → Invite staff or skip → Work orders.

The password you choose in the application is separate from your Atlas database password. Invitations use a copyable link: no email is sent. Localhost links can be tested in another browser/private window on the same computer; they are not public links for remote staff yet.

## Stack — free only

| Part | Technology |
| --- | --- |
| Language | JavaScript; JSX for React components |
| Frontend | React, React Router, Vite |
| Styling | Tailwind CSS and shared CSS; local Inter font and assets |
| Backend | Node.js, Express |
| Database | MongoDB Atlas Free/M0 and the official MongoDB driver |
| Authentication | Node.js scrypt password hashes; opaque, server-side MongoDB sessions |
| Protection | HttpOnly cookies, production Secure cookies, origin checks, Helmet, request limits |
| Invitations | Random single-use links with seven-day expiry; manually shared |
| Tests | Node.js built-in test runner |

No paid subscriptions, trials, email service, or hosting subscription. The user confirmed the dedicated repair-shop-manager cluster is Free/M0. Deployment is not part of these sprints.

## Structure

- `frontend/src/pages/` — homepage, account forms, shop setup, invitation screens, intake, work orders, and saved details.
- `frontend/src/components/` — reusable layout, fields, buttons, notices, and status badges.
- `backend/src/auth/` — account and invitation routes, password handling, MongoDB data access.
- `backend/src/config/` — environment validation and database connection.
- `backend/tests/` — local tests; explicit Atlas integration tests in `integration/`.
- `docs/` — designs, sprint plan, verification records, manual testing.

See [sprints and user stories](docs/SPRINTS-AND-USER-STORIES.md) and [implementation notes](docs/SPRINTS-1-3-IMPLEMENTATION.md).

## Checks

From `frontend/`:

```powershell
npm.cmd run build
npm.cmd run preview
```

Preview uses port 5173, so stop the frontend development server first. Keep the API running.

From `backend/`:

```powershell
npm.cmd test
npm.cmd run test:integration
npm.cmd start
```

The backend needs no compilation step. Local tests do not use Atlas. Integration tests use temporary, uniquely prefixed collections in the configured app database and remove their own fixtures afterward. Do not point development tests at a production database.

## Current boundaries

Accounts, memberships, technician names, and work orders are saved in Atlas. Each staff account belongs to one shop; the backend derives access from that membership. Managers can invite front-desk employees and add technicians as assignment records. Technician accounts and customer tracking remain future work.

The homepage still shows three clearly labeled sample orders from `frontend/src/data/sampleOrders.js`. Authenticated queues search only their own shop's saved records. Managers can explicitly change an order's assignment or status; front-desk staff can read and search. No password reset, invitation email delivery, billing, or inventory features are claimed.

The selected homepage reference is preserved in [homepage-reference.html](docs/homepage-reference.html). The account and onboarding screens follow saved designs 13 and 23–27 with the same cream, charcoal, and burnt-orange palette.

Credentials belong only in the ignored `backend/.env`; never put them in frontend code or documentation.
