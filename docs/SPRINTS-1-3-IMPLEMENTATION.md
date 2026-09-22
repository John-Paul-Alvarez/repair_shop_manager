# Sprints 1–3 — implementation record

Completed locally on September 21, 2026 using JavaScript/JSX, the dedicated MongoDB Atlas Free/M0 cluster, and no paid services.

## What works

- A manager can register, name a shop, resume unfinished setup, sign in/out, and reach only that shop's queue.
- A manager can skip staff setup or create a seven-day, single-use front-desk invitation link. The link is copied and shared manually; the app does not send email.
- An invited employee can create an account with the invitation's fixed email or sign in with an existing account, then join the correct shop.
- Managers and front-desk employees share the saved queue. Managers alone see the invitation entry.
- Staff can create a repair with customer name and phone, optional email, device/model, reported problem, and optional technician. New records start as Pending and open a saved confirmation page.
- Managers can add shop-scoped technician names inside the intake form. These records do not create logins.

## Guardrails

- Membership, shop, technician, and work-order access are derived on the server from the current session.
- Passwords use salted scrypt; sessions are server-side and represented by HttpOnly cookies.
- Invitation tokens are stored as hashes, have a seven-day expiry, and are consumed once.
- Work-order numbers and request identifiers are unique within each shop. Retrying the same intake request returns the existing record instead of creating another one.
- Browser writes require the configured local Origin and JSON content type. Protected routes reject missing or foreign-shop records.

## Verification

- `frontend/npm.cmd run build` passed.
- `backend/npm.cmd test` passed: 11 local configuration, API, and password checks.
- `backend/npm.cmd run test:integration` passed: Sprint 1, Sprint 2, and Sprint 3 against temporary uniquely prefixed Atlas collections. The Sprint 3 suite covers manager-only technician creation, front-desk intake, Pending order creation, retry protection, validation, order details, and access isolation.

Use [manual testing](MANUAL-TESTING.md) to exercise the visible manager, staff, and intake flows. The tests remove only their own uniquely named collections; manually created shops and orders are not reset.

## Deferred

Sprint 4 will add search, status filters, and manager-controlled assignment/status edits. This sprint does not include password reset, invitation email delivery, technician user accounts, customer tracking, billing, inventory, deployment, or repair status changes after creation.
