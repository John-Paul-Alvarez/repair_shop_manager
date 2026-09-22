# Repair Shop Manager API

Express + plain JavaScript. Node.js runs the source directly; there is no TypeScript or backend build step.

## Run

```powershell
npm.cmd install
# Fresh checkout only, if .env does not exist:
Copy-Item .env.example .env
npm.cmd run dev
```

Development uses Node's watch mode. `npm.cmd start` runs without the watcher. Restart after editing `.env`. The default URL is http://127.0.0.1:4000.

## Environment

| Variable | Default | Purpose |
| --- | --- | --- |
| NODE_ENV | development | development, test, or production |
| HOST | 127.0.0.1 | Local interface |
| PORT | 4000 | API port |
| CLIENT_ORIGINS | http://127.0.0.1:5173,http://localhost:5173 | Exact allowed browser origins |
| MONGODB_URI | empty | Private Atlas connection string |
| MONGODB_DB_NAME | repair_shop_manager | App database |

Without a URI, health reports `not_configured` and account services return 503. With a URI, startup connects and creates the required indexes before listening. A health ping reports `connected` or `unavailable` (503).

## Routes

| Method | Route | Purpose |
| --- | --- | --- |
| GET | /api/health | Database/API state |
| POST | /api/auth/register | Manager account: name, email, password |
| POST | /api/auth/sign-in | Start session |
| POST | /api/auth/sign-out | Revoke session and clear cookie |
| GET | /api/auth/me | Current user and saved membership |
| GET/POST | /api/shop-settings | Manager reads or saves this shop's public name, phone, and email |
| POST | /api/shops | Save shop name and initial manager membership atomically |
| GET | /api/shops/:shopId | Own shop only |
| GET | /api/work-orders | Own shop's saved queue, up to 1,000 records |
| POST | /api/work-orders | Create a Pending order for the authenticated shop |
| GET | /api/work-orders/:orderId | Own shop's saved work-order details |
| GET | /api/technicians | Own shop's technician assignment records |
| POST | /api/technicians | Manager adds a technician assignment record |
| POST | /api/invitations | Manager creates/replaces a front-desk invitation for an email |
| GET | /api/invitations/:token | Valid invitation preview |
| POST | /api/invitations/:token/accept | Join using an existing session or a new name/password |
| GET | /api/my-repairs | Assigned technician's repair queue |
| POST | /api/work-orders/:orderId/notes | Assigned technician saves an internal note |
| POST | /api/work-orders/:orderId/tracking-link | Staff creates or replaces a customer tracking link |
| GET | /api/tracking/:token | Public customer-safe repair tracking view |

Mutations require an allowed Origin and application/json. Manager-only assignment/status/settings actions, technician notes, and customer tracking enforce role- and shop-scoped access in the API.

## Data and access

- Normalized email identities have a unique index.
- Shops embed memberships so initial shop setup is one atomic write. Unique owner and membership indexes keep retries and concurrent requests from creating multiple shops for one user.
- Work-order numbers and client retry identifiers are unique per shop. The queue and all order reads derive the shop from the authenticated membership.
- Technician names are shop-scoped assignment records. They do not create user accounts or grant login access.
- Passwords use salted scrypt (N=131072, r=8, p=1). Application passwords require 15–128 characters.
- Session cookies carry a random 256-bit token. Only its SHA-256 hash is stored in MongoDB. Sessions expire after eight hours; every request checks expiry independently of TTL cleanup.
- Cookies are HttpOnly and SameSite=Lax. Production uses Secure and the __Host- prefix; local HTTP development uses a regular host-only cookie.
- Authentication attempts are rate-limited per IP in this single-process development server. A multi-instance deployment would need a shared limiter store and explicit trusted-proxy configuration.
- Invitations store token hashes, target email, shop, fixed role, expiry, and acceptance state. Reissuing replaces the earlier link. Acceptance uses a MongoDB transaction to save the account/membership and consume the invitation together.
- Invitation links are bearer secrets. The manager shares them privately with the intended employee; the app does not send mail or independently verify email ownership.
- Customer tracking links are separate expiring bearer secrets. Atlas stores only their hashes. The public route returns only the repair number, device, reported issue, customer-safe status, and manager-entered public contact fields.
- Password recovery email is deliberately unconfigured. The frontend gives the same unavailable message for every submitted address; it does not claim a message was sent or expose account existence.

## Tests

```powershell
npm.cmd test
npm.cmd run test:integration
```

Local tests cover configuration, JSON errors, CORS, health, and password hashing. Integration tests exercise real Atlas persistence, duplicate/racing requests, session revocation/expiry, cross-shop denial, role enforcement, invitation lifecycle, technician access, and tracking. Only each run's uniquely named test collections are removed afterward. Do not run against production.

See [manual testing](../docs/MANUAL-TESTING.md) and [implementation notes](../docs/SPRINTS-1-3-IMPLEMENTATION.md).
