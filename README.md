# Repair Shop Manager V2

The React homepage and a minimal Express backend foundation are implemented. The local backend is connected to the Shop Manager Atlas cluster using the `repair_shop_manager` database name. Application authentication is not implemented yet.

Sprint 0 is complete and verified. See the [Sprint 0 verification record](docs/SPRINT-0-VERIFICATION.md) for the checks performed and current limitations.

## Run the homepage

Use Node.js 22.12 or newer. From the project root:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Open the local URL printed by Vite (normally `http://127.0.0.1:5173`).

```powershell
npm.cmd run build       # Type-check and create a production build
npm.cmd run typecheck   # Check TypeScript without building
npm.cmd run preview     # Preview the production build locally
```

## Homepage scope

- Floating navigation, photographic hero, attached sample repair queue, workflow section, closing banner, and footer.
- Responsive desktop and mobile layouts using our cream, charcoal, and burnt-orange palette.
- Searchable sample orders with Pending, In Progress, and Completed status badges.
- Sign-in, shop creation, and new-order buttons display a notice explaining that those flows are not available yet. They do not create accounts or collect customer data.
- The original photo, SVG icons, and Inter font are served locally by the frontend.

The screenshot supplied on September 17 matches `docs/homepage-reference.html`, copied from the earlier `32-selected-homepage.html` design. That is the reference for this implementation, rather than the later alternative homepage layout.

## Run the backend

From the project root, in a separate terminal:

```powershell
cd backend
npm.cmd install
# Only if backend/.env does not exist:
Copy-Item .env.example .env
npm.cmd run dev
```

The API runs at `http://127.0.0.1:4000`. Check `http://127.0.0.1:4000/api/health` to confirm it is responding.

On a fresh checkout, local startup works with an empty `MONGODB_URI` and reports `database: "not_configured"`. If a URI is provided, startup requires a successful connection. The current local configuration has passed a live Atlas connection and ping check; this does not create collections or verify application features.

The backend includes environment validation, MongoDB connection support, CORS for the local frontend, security headers, JSON request/error handling, and graceful shutdown. Authentication and repair-order endpoints are not implemented; the homepage still uses its local sample records.

```powershell
npm.cmd run build       # Compile the backend to dist/
npm.cmd start           # Run the compiled backend
npm.cmd run typecheck   # Check application TypeScript
npm.cmd test            # Run checks without Atlas
```

See `backend/README.md` for environment settings and the folder structure.

## Tech stack

React, TypeScript, Vite, and Tailwind CSS are installed for the homepage. Node.js, Express, and the MongoDB driver are configured for the backend foundation. React Router will be added when additional pages are implemented.

| Part | Technology | Purpose |
| --- | --- | --- |
| Frontend | React | Build pages and reusable UI components. |
| Language | TypeScript | Add type checking to frontend and backend code. |
| Build tool | Vite | Run the frontend development server and build the React app. |
| Styling | Tailwind CSS | Implement our warm cream, charcoal, and burnt-orange design. |
| Navigation | React Router | Navigate between the homepage, sign-in, work orders, and order details. |
| Backend | Node.js + Express | Handle API requests, validation, and permissions. |
| Database | MongoDB Atlas Free/M0 | Store shops, users, customers, technicians, and work orders. |
| Database access | MongoDB Node.js driver | Read and write database records from the backend. |
| Authentication | Password hashing + server-side sessions | Sign staff in and protect shop data using secure cookies. Specific libraries are still to be chosen. |
| Version control | Git | Track project changes. |

### How the parts connect

```text
React + TypeScript + Tailwind CSS
               |
          Express API
          on Node.js
               |
     MongoDB Node.js driver
               |
      MongoDB Atlas Free/M0
```

## Structure

See [Sprints and user stories](docs/SPRINTS-AND-USER-STORIES.md) for the planned implementation order, role-based user flows, design references, and acceptance criteria. Technician and customer self-service features are marked as future scope.

- `frontend/` — React, TypeScript, Vite, and Tailwind CSS. React Router is planned for additional pages.
- `backend/` — Node.js, Express, TypeScript, and the MongoDB Node.js driver.
- `docs/` — Project notes, user flows, and design references.

## Database and cost constraint

Use MongoDB Atlas Free/M0. Keep this project on free tools and services; no paid subscriptions or trial-dependent services.

The frontend and backend will run locally during development. Public hosting is still to be decided.

Database credentials belong only in the ignored `backend/.env`, never in frontend code or Git. Restart the backend after changing this file. The frontend will communicate with the Express API, which connects to MongoDB.

The Atlas connection is verified; registration, shop records, membership constraints, and application sessions remain Sprint 1 work. Homepage sample records are defined in `frontend/src/data/sampleOrders.ts` and are not persisted.
