# Deployment readiness

The frontend is hosted on Vercel and the API on Render. Email delivery is not configured.

## Current hosting configuration

- Frontend: `https://repair-shop-manager-green.vercel.app`, Vercel root directory `frontend`.
- Backend: `https://repair-shop-manager-api.onrender.com`, Render root directory `backend`.
- Render health check: `/api/health`.
- Render `CLIENT_ORIGINS`: `https://repair-shop-manager-green.vercel.app` (no trailing slash).
- `frontend/vercel.json` forwards `/api/*` to Render before applying the React route fallback. API responses must not be cached.
- The frontend continues using relative `/api` requests so session cookies remain on the frontend origin. No MongoDB secrets belong in Vercel.
- After deploying, Vercel `/api/health` should return JSON with `database: "connected"`. An unauthenticated `/api/auth/me` should return JSON with status 401, not a Vercel 404 or an HTML page.

## Before deploying

1. Choose a free-compatible static frontend host and Node.js API host that support HTTPS and long-lived cookies.
2. Give the API one public HTTPS origin, for example `https://app.example.com`, and set that exact origin in `CLIENT_ORIGINS`. Do not use `*`.
3. In Atlas, allow only the network/IP range needed by the deployed API. Keep the dedicated `repair_shop_manager` database and do not reuse another project's data.
4. Put these values in the API host's private environment settings, never in Git or frontend variables:

   ```text
   NODE_ENV=production
   HOST=0.0.0.0
   PORT=<host-provided-port-or-4000>
   CLIENT_ORIGINS=https://app.example.com
   MONGODB_URI=<private-atlas-uri>
   MONGODB_DB_NAME=repair_shop_manager
   ```

5. Build the frontend with `npm.cmd run build` from `frontend/`, then configure its `/api` requests to reach the HTTPS API according to the selected host's proxy/rewrite setup.
6. Start the API with `npm.cmd start` from `backend/` and verify `GET /api/health` returns `database: "connected"`.

## Security checks

- The production API uses `Secure`, `HttpOnly`, host-only session cookies with the `__Host-` prefix. HTTPS is required for those cookies to work.
- Do not place `MONGODB_URI`, database passwords, session values, or Atlas screenshots in the frontend, repository, build output, issue tracker, or documentation.
- Keep `backend/.env` local. It is ignored by Git; use the deployment provider's secret settings in production.
- Confirm the deployed frontend's source and network responses contain no MongoDB URI. Browser code may call `/api`, but database access stays only in the backend.
- Test sign-in, sign-out, manager settings, technician isolation, tracking-link expiry/replacement, and a cross-shop denial after deployment.

## Password recovery

The sign-in screen offers a clear recovery path, but recovery email delivery is not configured. The screen gives the same response for every address and does not claim that email was sent. Choose and configure a free-compatible sender before adding reset tokens and password-reset delivery.

## Publish only after verification

Run the frontend build and backend test suite against deployment-ready settings, choose the hosting provider, then test the real HTTPS URLs. A successful local build is not evidence that a public deployment is configured.
