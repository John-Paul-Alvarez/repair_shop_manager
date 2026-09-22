# Repair Shop Manager V2 — Sprints and User Stories

Last updated: September 21, 2026.

This is the proposed implementation sequence based on our agreed user flows and saved designs. Sprint numbers describe order, not fixed dates or durations. Estimates and calendar commitments have not been agreed.

**Status:** Sprints 0–3 are complete in local development. Sprint 0 is historically verified on September 19, 2026; see the [verification record](SPRINT-0-VERIFICATION.md). Sprints 4–5 remain planned for the first usable release. Sprints 6–7 are future scope. Designed screens are not completed application features.

## 1. Product goal and boundaries

Help the front desk and shop manager receive a device, create a work order, assign a technician, follow repair progress, and answer a customer's inquiry from one shared workspace.

- The first release uses the same Work Orders and Work Order Details pages for managers and front-desk employees.
- Simple manager/employee accounts and onboarding were added to the design after the original repair-only scope. This plan includes them before a release handling real shop data.
- Dedicated technician access and customer self-service tracking stay in future sprints.
- All tools and services must meet our no-paid-subscriptions/no-trial-dependent-services constraint. MongoDB Atlas Free/M0 is the planned database.
- No billing, payments, inventory, parts ordering, AI diagnostics, automotive bays, live telemetry, social features, or analytics dashboards.
- Do not build extra pages for states that can be shown in an existing page or dialog.
- Sprint planning does not authorize deployment, sending invitations, or sending customer messages.

## 2. Users and access

| User | Main goal | Planned access |
| --- | --- | --- |
| Visitor | Understand the product and enter the app | Public homepage; create a shop or sign in |
| Shop manager | Set up the shop and organize repairs | Own shop's queue, details, creation, technician assignment, status updates, and staff invitations |
| Front-desk employee | Receive devices and answer customer inquiries | Own shop's shared queue, create orders, read repair details; optional assignment during intake |
| Technician — future | Work on assigned repairs | Assigned repairs only, permitted status updates, internal repair notes |
| Customer — future | Check one repair and contact the shop | Authorized customer-facing information for their repair only |

**Permission decision still open:** The manager flow explicitly includes changing assignments and statuses after creation. Whether front-desk employees may also perform those changes must be settled before Sprint 4. Sharing a page does not automatically grant identical edit permissions.

In the first release, a technician can be a shop-scoped assignment record without a login. Dedicated technician accounts arrive in Sprint 6.

## 3. User flows

### Visitor and returning staff

```text
[Homepage]
    |
    +-- Create your shop --> Manager onboarding
    |
    +-- Sign in --> Authenticate --> [Work Orders]
                       |
                 Invalid credentials
                       |
                 Explain and retry
```

Future technician accounts use the same sign-in entry, then go to My Assigned Repairs.

### Manager and front-desk onboarding

```text
SHOP MANAGER                           FRONT-DESK EMPLOYEE
     |                                         |
[Create account]                       [Open shop invitation]
Name, email, password                          |
     |                                  [Set up account]
[Name your shop]                       Name and password
     |                                Email already filled in
[Invite staff — optional]                       |
     |                                Existing account?
Send invitation or skip                Sign in and accept
     |                                         |
     +-------------------+---------------------+
                         |
                  [Work Orders]
                         |
                  Any existing orders?
                    /           \
                   No           Yes
                   |             |
       [No work orders yet]  [Repair queue]
                   |
           [New work order]
```

One shop setup for the manager. Invited staff join that shop without creating another shop or choosing their own role. No profile photos, interests, tours, or welcome dashboard.

### Front desk: receive a broken device

```text
Customer brings in device
           |
     [Work Orders]
           |
   Click New work order
           |
     [Create Order]
Customer + device + problem
Optional technician assignment
           |
       Click Create
           |
      Fields valid?
       /        \
      No        Yes
      |          |
Show errors   Save order
Keep entries     |
      |     [Work Order Details]
Fix and retry    |
          Confirm order number
          and Pending status
```

### Front desk: answer a customer inquiry

```text
Customer calls or visits
           |
     [Work Orders]
           |
Search order number, name, or phone
           |
       Order found?
       /        \
      No        Yes
      |          |
Adjust search  [Work Order Details]
                 |
          Read current status
          and assigned technician
                 |
          Give customer an update
```

The update is given by the employee. A messaging page or automated notification is not required.

### Shop manager: organize repair workload

```text
[Work Orders] --> Review queue --> Filter by status
                                         |
                                  Select work order
                                         |
                                [Work Order Details]
                                         |
                         +---------------+---------------+
                         |                               |
                Assign/change technician        Update repair status
                         |                               |
                         +---------------+---------------+
                                         |
                                  Save changes
                                         |
                              Success or recoverable error
                                         |
                              Return to Work Orders
                              Keep search and filter
```

Assignment and status use focused dialogs with explicit Save changes and Cancel actions. Either can be updated independently. If a saved status no longer matches the queue filter, explain why the order disappeared.

### Technician: assigned repair — future

```text
[Sign In] --> [My Assigned Repairs] --> Select repair
                                            |
                                  [Work Order Details]
                                            |
                                 Read device and problem
                                            |
                                    Set In Progress
                                            |
                                      Perform repair
                                            |
                                  Add and save repair notes
                                            |
                              Confirm setting Completed
                                            |
                                 [My Assigned Repairs]
```

Unsaved notes require save/discard/cancel recovery. Completing repair work does not mean paid, collected, or automatically notified.

### Customer: repair tracking — future

```text
Receive tracking link
        |
[Tracking access check]
        |
Valid and authorized? ---- No --> [Link unavailable] --> Contact shop
        |
       Yes
        |
Verify access if required
        |
[Repair Tracking]
Own repair + public status only
        |
Need assistance?
    /       \
   No       Yes
   |         |
  Done   [Contact shop]
         Call or open email
```

The phone-code mockup is a design proposal. SMS delivery is not an agreed implementation dependency; a secure approach compatible with the free-only constraint must be chosen before Sprint 7.

## 4. Design references and page inventory

**Homepage authority:** Use [homepage-reference.html](homepage-reference.html), the local design matching the screenshot supplied on September 17. It has the dark photographic hero and attached sample repair queue. It supersedes earlier alternative homepage layouts for implementation.

The numbered PNGs below live in the existing local design archive. Links point to that archive; they are not portable repository assets. They guide visual consistency and page states, not completion status or final responsive measurements.

| Flow | Reference designs | Page/state distinction |
| --- | --- | --- |
| Intake | [01 Queue](<C:/Users/John Paul/Downloads/softwareDevJobs/output/shop-manager-designs/01-work-orders.png>), [02 Create](<C:/Users/John Paul/Downloads/softwareDevJobs/output/shop-manager-designs/02-create-work-order.png>), [03 Validation](<C:/Users/John Paul/Downloads/softwareDevJobs/output/shop-manager-designs/03-create-validation.png>), [04 Details](<C:/Users/John Paul/Downloads/softwareDevJobs/output/shop-manager-designs/04-work-order-details.png>) | Three pages; validation and creation success are states |
| Inquiry | [05 Found](<C:/Users/John Paul/Downloads/softwareDevJobs/output/shop-manager-designs/05-inquiry-search-found.png>), [06 No results](<C:/Users/John Paul/Downloads/softwareDevJobs/output/shop-manager-designs/06-inquiry-no-results.png>), [07 Details](<C:/Users/John Paul/Downloads/softwareDevJobs/output/shop-manager-designs/07-inquiry-order-details.png>) | Reuses queue and details |
| Manager | [08 Filtered queue](<C:/Users/John Paul/Downloads/softwareDevJobs/output/shop-manager-designs/08-manager-pending-queue.png>), [09 Details](<C:/Users/John Paul/Downloads/softwareDevJobs/output/shop-manager-designs/09-manager-order-details.png>), [10 Assignment](<C:/Users/John Paul/Downloads/softwareDevJobs/output/shop-manager-designs/10-manager-assign-technician.png>), [11 Status](<C:/Users/John Paul/Downloads/softwareDevJobs/output/shop-manager-designs/11-manager-update-status.png>), [12 Saved queue](<C:/Users/John Paul/Downloads/softwareDevJobs/output/shop-manager-designs/12-manager-saved-queue.png>) | Assignment/status are dialogs, not pages |
| Sign-in | [13 Shared staff sign-in](<C:/Users/John Paul/Downloads/softwareDevJobs/output/shop-manager-designs/13-shared-staff-sign-in.png>) | Shared entry; destination depends on role |
| Technician — future | [14 Assigned list](<C:/Users/John Paul/Downloads/softwareDevJobs/output/shop-manager-designs/14-technician-assigned-repairs.png>), [15 Details](<C:/Users/John Paul/Downloads/softwareDevJobs/output/shop-manager-designs/15-technician-repair-details.png>), [16 Notes](<C:/Users/John Paul/Downloads/softwareDevJobs/output/shop-manager-designs/16-technician-repair-notes.png>), [17 Completion](<C:/Users/John Paul/Downloads/softwareDevJobs/output/shop-manager-designs/17-technician-complete-repair.png>), [18 Returned queue](<C:/Users/John Paul/Downloads/softwareDevJobs/output/shop-manager-designs/18-technician-returned-queue.png>) | Assigned list plus role-specific details; notes/completion are states |
| Customer — future | [19 Verify](<C:/Users/John Paul/Downloads/softwareDevJobs/output/shop-manager-designs/19-customer-verify-access.png>), [20 Tracking](<C:/Users/John Paul/Downloads/softwareDevJobs/output/shop-manager-designs/20-customer-repair-tracking.png>), [21 Contact](<C:/Users/John Paul/Downloads/softwareDevJobs/output/shop-manager-designs/21-customer-contact-shop.png>), [22 Unavailable](<C:/Users/John Paul/Downloads/softwareDevJobs/output/shop-manager-designs/22-customer-tracking-link-unavailable.png>) | Tracking entry/view, verification/error states, contact dialog |
| Onboarding | [23 Account](<C:/Users/John Paul/Downloads/softwareDevJobs/output/shop-manager-designs/23-onboarding-create-account.png>), [24 Shop](<C:/Users/John Paul/Downloads/softwareDevJobs/output/shop-manager-designs/24-onboarding-name-shop.png>), [25 Optional invite](<C:/Users/John Paul/Downloads/softwareDevJobs/output/shop-manager-designs/25-onboarding-invite-staff.png>), [26 Accept](<C:/Users/John Paul/Downloads/softwareDevJobs/output/shop-manager-designs/26-onboarding-accept-invitation.png>), [27 Empty queue](<C:/Users/John Paul/Downloads/softwareDevJobs/output/shop-manager-designs/27-onboarding-empty-work-orders.png>) | Short setup sequence leading straight to queue |

### Proposed routes

These are planning names, not currently implemented routes except the homepage.

| Route | Purpose |
| --- | --- |
| `/` | Public homepage — implemented |
| `/create-account` | Manager account creation |
| `/sign-in` | Shared staff sign-in |
| `/setup/shop` | Name the shop |
| `/setup/invite` | Optional first invitation |
| `/invite/:token` | Accept an invitation or sign in to accept |
| `/work-orders` | Shared queue, including empty/search/filter states |
| `/work-orders/new` | Create work order |
| `/work-orders/:id` | Details with role-appropriate dialogs |
| `/my-repairs` | Technician assignments — future |
| `/track/:token` | Secure customer entry — future; final URL/session design undecided |

### Shared visual rules

| Element | Color |
| --- | --- |
| Page background | Warm cream `#F5F2EC` |
| Forms and tables | Soft white `#FFFEFA` |
| Header/dark surfaces | Charcoal `#252522` |
| Main text | `#242420` |
| Secondary text | `#656158` |
| Primary actions | Burnt orange `#B54708` |
| Borders | `#D8D2C8` |

Use readable labels with amber Pending, purple In Progress, and green Completed badges. Reuse typography, buttons, forms, dialogs, spacing, and app shell across roles. Provide visible keyboard focus, associated field labels, readable mobile layouts, and loading/empty/error/success states.

## 5. Sprint overview

| Sprint | Goal | Status | Dependencies |
| --- | --- | --- | --- |
| 0 | Project foundation, homepage, API scaffold | Implemented foundation | None |
| 1 | Atlas setup, manager account, shop setup, sign-in | Complete | 0 |
| 2 | Staff invitation and shared workspace entry | Complete | 1 |
| 3 | Device intake and persistent work orders | Complete | 1–2 |
| 4 | Customer inquiry and manager workload updates | Planned | 3 |
| 5 | Complete and validate the first-release flows | Planned | 1–4 |
| 6 | Dedicated technician experience | Future | First release |
| 7 | Secure customer tracking | Future | First release and access-design decision |

Sprints 6 and 7 are separate enhancements. Customer tracking does not require shipping technician accounts first.

## 6. Sprint 0 — Foundation and homepage

Goal: establish the agreed stack and a working homepage without pretending the rest of the product is complete.

**Complete — verified September 19, 2026.** All four stories below meet their acceptance criteria. Build, API, and browser evidence is recorded in [Sprint 0 verification](SPRINT-0-VERIFICATION.md).

### FND-01 — Project structure — Implemented

As a developer, I want separate frontend, backend, and documentation folders so the project is easy to extend.

Acceptance:
- [x] `frontend/`, `backend/`, and `docs/` exist.
- [x] README records the stack and free-only constraint.
- [x] Git ignore rules exclude environment secrets, dependencies, and generated builds.

### WEB-01 — Understand the product — Implemented

As a visitor, I want a clear homepage so I can understand how the app supports a repair shop.

Acceptance:
- [x] The page follows the selected photographic design and palette.
- [x] Navigation links reach the sample workspace and workflow section.
- [x] Layout works on desktop and mobile.

### WEB-02 — Explore a sample repair queue — Implemented

As a visitor, I want to inspect example work orders so I can understand the workspace before creating a shop.

Acceptance:
- [x] Three illustrative orders display customer, device, technician, and labeled status.
- [x] Search filters sample records; no-results feedback and clear-search recovery work.
- [x] Sample records are clearly labeled and are not real saved shop data.

### FND-02 — Run the API foundation — Implemented

As a developer, I want a runnable API with clear configuration so future features have a reliable starting point.

Acceptance:
- [x] Express + TypeScript builds and runs with development commands.
- [x] `GET /api/health` reports the API and database configuration state.
- [x] MongoDB connection support, JSON errors, and local frontend CORS are present.
- [x] The foundation's 10 configuration/API tests pass.

**Historical exit at Sprint 0 completion:** the foundation was runnable before Atlas, authentication, and repair APIs were added. Later sprints replaced the temporary account and work-order notices with real flows.

## 7. Sprint 1 — Manager account and shop setup

Goal: a manager creates a shop and reaches its empty queue.

Designs: 13, 23, 24, 27.

### DATA-01 — Connect the app database — Complete

As a developer, I want the app connected to its own Atlas database so shop records can be persisted.

Acceptance:
- [x] Confirm the chosen project/cluster is Shop Manager's Free/M0 resource.
- [x] Store the URI only in backend environment settings.
- [x] Verify a real connection and report failure honestly; do not modify the earlier project's data.
- [x] Establish shop-scoped records and constraints for membership, work-order identifiers, and email identities.

### AUTH-01 — Create a manager account — Complete

As a shop manager, I want to register with my name, email, and password so I can set up my shop.

Acceptance:
- [x] Show only the agreed fields with clear validation and duplicate-account recovery.
- [x] Hash passwords; never store or return plaintext passwords.
- [x] Create the account once and take the manager to Name your shop.
- [x] Interrupted setup can be resumed without creating duplicate accounts or shops.

### SHOP-01 — Name the shop — Complete

As a shop manager, I want to enter my shop name so my team's workspace has an identity.

Acceptance:
- [x] Require the shop name; do not require logo, address, billing, or social-profile fields.
- [x] Persist the shop and manager membership together consistently.
- [x] Continue to optional staff invitation once Sprint 2 is available; setup remains resumable.

### AUTH-02 — Sign in and sign out — Complete

As returning staff, I want to sign in and return to my workspace so I can begin daily work.

Acceptance:
- [x] Validate credentials through the backend and use server-side sessions with secure cookie settings.
- [x] Manager/front desk go directly to Work Orders, unless shop setup is unfinished.
- [x] Incorrect credentials show a useful error without disclosing account details.
- [x] Sign-out invalidates the session; protected routes reject unauthenticated requests.

### ACCESS-01 — Keep shops separate — Complete

As a shop manager, I want staff to access only our shop's data so another shop cannot view or change it.

Acceptance:
- [x] Derive access from the authenticated membership, not a trusted client-supplied role or shop ID.
- [x] Enforce access in the API as well as the UI.
- [x] Verify cross-shop read/write requests and unauthenticated requests are rejected.

**Exit:** a manager can register, name the shop, sign in/out, and access only that shop. Real account actions replace the homepage notices when these routes work.

## 8. Sprint 2 — Invite staff and enter the shared workspace

Goal: keep onboarding short while supporting a real front-desk account.

Designs: 25, 26, 27, 01.

### STAFF-01 — Invite or skip — Complete

As a shop manager, I want to invite a front-desk employee or skip that step so onboarding does not block my work.

Acceptance:
- [x] Enter an employee email; show the destination and front-desk role.
- [x] Skip for now goes straight to Work Orders.
- [x] Invitations are bound to the intended shop, email, and role, with expiry and single-use acceptance.
- [x] Invitations use a manual private-link approach and explicitly state that no email was sent.

### STAFF-02 — Accept a shop invitation — Complete

As an invited front-desk employee, I want to set up my account so I can join the correct shop.

Acceptance:
- [x] Show the shop and prefilled, read-only invited email; ask for name and password.
- [x] The backend enforces the invitation's email, shop, and role.
- [x] Existing account holders can sign in and accept; they are not forced to create a duplicate account.
- [x] Invalid, expired, or already-used invitations have a clear recovery path.

### WORK-01 — Enter the shared queue — Complete

As a manager or front-desk employee, I want Work Orders as my starting page so I can begin useful work immediately.

Acceptance:
- [x] Both roles use the same queue layout with their permitted actions.
- [x] Empty shops show “Create your first work order to start tracking repairs.”
- [x] Existing shops show their saved repair queue immediately.
- [x] Loading, API errors, and a truly empty shop have distinct states.

### STAFF-03 — Invite staff later — Complete

As a shop manager, I want to return to staff invitations so skipping onboarding does not prevent me from adding an employee later.

Acceptance:
- [x] Provide one discoverable manager-only entry that reuses the invitation form.
- [x] Keep this limited to invitations; no full staff administration dashboard is required.
- [x] Follow the same invitation access and delivery rules as STAFF-01.

**Exit:** manager can skip or invite; invited staff join the same shop and land on its queue. The exact later-invitation entry has not been mocked up.

## 9. Sprint 3 — Receive a device and create a work order

Goal: deliver the full intake flow with persistent records.

Designs: 01–04; reuse 27 for empty shops.

### TECH-01 — Provide a technician assignment list — Complete

As a shop manager, I want a list of our technicians so repairs can be assigned correctly.

Acceptance:
- [x] Assignment options come from this shop's technician records.
- [x] Unassigned is available; intake can proceed when the shop has no technicians.
- [x] The manager can add a technician name inline during intake; no standalone page was added.
- [x] Technician records do not grant login access in the first release.

### ORDER-01 — Record a device intake — Complete

As a front-desk employee, I want to capture customer details, device information, and the reported problem so the shop can track the repair.

Acceptance:
- [x] New work order opens the approved Create Order form.
- [x] Capture customer name and phone, optional email, device/model, and reported problem.
- [x] Technician assignment is optional and limited to the current shop.
- [x] Create a shop-scoped work order with a unique order number and initial Pending status.
- [x] Prevent duplicate creation from repeated clicks or retries using a shop-scoped request identifier.

### ORDER-02 — Correct invalid entries — Complete

As a front-desk employee, I want errors beside the relevant fields so I can fix the form without re-entering valid information.

Acceptance:
- [x] Client and server validate required fields; server validation remains authoritative.
- [x] Keep valid entries after validation or connection errors.
- [x] Highlight and focus the first invalid field, then allow retry.
- [x] Cancel returns to the queue; dirty-form handling asks before discarding unsaved entries.

### ORDER-03 — Confirm a saved work order — Complete

As a front-desk employee, I want the saved order details so I can confirm intake succeeded.

Acceptance:
- [x] Navigate to Details only after the save succeeds.
- [x] Show the order number, Pending status, customer, device, problem, and technician/Unassigned.
- [x] Data remains after reload and is visible to authorized staff in the same shop.
- [x] Missing or unauthorized orders do not reveal another shop's records.

**Exit:** complete on September 21, 2026. Receive device → create → validate → persist → confirm details works end to end.

## 10. Sprint 4 — Inquiry and repair workload

Goal: staff can answer inquiries and managers can organize the queue.

Designs: 05–12, reusing 01 and 04.

### SEARCH-01 — Find a customer's order — Complete

As a front-desk employee, I want to search by order number, customer name, or phone so I can find the correct repair during a call or visit.

Acceptance:
- [x] Search the current shop's saved records and tolerate ordinary name casing and phone formatting.
- [x] Preserve the search when opening an order and returning to the queue.
- [x] Multiple matches show enough information to distinguish orders.
- [x] Do not expose records from other shops.

### SEARCH-02 — Recover from no results — Complete

As a front-desk employee, I want useful guidance when no order matches so I can try another identifier.

Acceptance:
- [x] Show the no-results state from design 06, not “No work orders yet.”
- [x] Keep the entered query and offer Clear search.
- [x] Distinguish an unsuccessful request from a valid search with zero matches.

### INQUIRY-01 — Give a customer an update — Complete

As a front-desk employee, I want to read an order's current status and technician so I can give the customer an accurate update.

Acceptance:
- [x] Open the matching record in the shared Details page.
- [x] Load its saved status, device/problem, and current assignment.
- [x] No messaging screen, sent-notification claim, or assumed completion date is introduced.

### QUEUE-01 — Review repairs by status — Complete

As a shop manager, I want to filter the repair queue so I can focus on the next work that needs attention.

Acceptance:
- [x] Offer All, Pending, In Progress, and Completed with accurate counts.
- [x] Combine status filtering and search consistently; totals always cover the shop while matching-row totals reflect the active search/filter.
- [x] Preserve filter/query when navigating to Details and back.
- [x] Handle an empty filtered result separately from an empty shop.

### ASSIGN-01 — Assign or change a technician — Complete

As a shop manager, I want to choose the technician handling an order so responsibility is clear.

Acceptance:
- [x] Use the assignment dialog with the current and proposed assignment clearly distinguished.
- [x] Save changes persists a valid same-shop technician; Cancel leaves the record unchanged.
- [x] Reflect successful changes in Details and the queue.
- [x] A failed save preserves the attempted selection and permits retry.

### STATUS-01 — Update a repair status — Complete

As a shop manager, I want to update the status so staff can follow the repair's progress.

Acceptance:
- [x] Use the status dialog with Pending, In Progress, and Completed labels.
- [x] Selection alone does not change the saved record; explicit Save changes is required.
- [x] Show success only after the backend confirms the update.
- [x] A manager may explicitly select any of the three statuses, including reopening a repair; the app never infers a transition.

### QUEUE-02 — Return with context after saving — Complete

As a shop manager, I want to return to my previous queue view so I can continue organizing work.

Acceptance:
- [x] Preserve the search and active filter when returning from Details.
- [x] Refresh status counts and changed assignment/status data after returning to the queue.
- [x] If the order no longer matches an active filter, the user returns to that filtered queue and sees its no-match state.
- [x] Avoid silently overwriting another staff member's newer edit with version-based conflict detection and a reload message.

**Exit:** complete on September 21, 2026. Both staff flows work against persistent data, with permission checks, explicit saves, preserved queue context, and version-based conflict detection.

## 11. Sprint 5 — First-release completion

Goal: validate the planned manager/front-desk experience as a coherent application.

### QUALITY-01 — Use the app across devices and inputs — Complete

As staff, I want readable, accessible screens so I can work on desktop or a smaller device.

Acceptance:
- [x] Review the homepage, authentication, onboarding, queue, forms, details, and dialogs against the shared designs.
- [x] Verify keyboard navigation, focus recovery, labels, text contrast, status labels, and responsive layouts.
- [x] Test loading, validation, empty, no-results, network error, and save-success states.
- [x] Placeholder account/work-order actions are removed once their real flows exist.

### QUALITY-02 — Complete everyday work reliably — Complete

As a shop manager, I want repairs to remain accurate across visits and staff sessions so the team can rely on the app.

Acceptance:
- [x] Exercise manager onboarding, employee acceptance, returning sign-in, intake, inquiry, assignment, and status update end to end.
- [x] Verify persistence after reload, no duplicate submissions, and safe handling of simultaneous edits.
- [x] Test unauthenticated, wrong-role, and cross-shop requests.
- [x] Document run instructions and remaining limitations without using real customer data in tests.

### AUTH-03 — Recover account access — Deferred

As staff, I want a way to recover access so a forgotten password does not permanently block work.

Acceptance:
- [ ] The Forgot password affordance in design 13 leads to a defined recovery flow.
- [ ] Recovery does not expose whether an email belongs to an account.
- [ ] Any reset tokens are expiring, single-use, and tied to the intended account.
- [ ] Choose a free-compatible delivery method before adding recovery messaging; supporting screens still need a small design pass.

**Exit:** the manager/front-desk first release is complete. Password recovery remains deferred until a free-compatible sender is configured. Local readiness is not a claim of public deployment; hosting remains a separate decision.

## 12. Sprint 6 — Technician experience

Goal: give technicians access to their own assignments and repair notes.

Designs: 13–18.

### TECH-02 — See my assignments — Complete

As a technician, I want to see only repairs assigned to me so I can focus on my work.

Acceptance:
- [x] Shared sign-in routes technician accounts to My Assigned Repairs.
- [x] Search, counts, and filters use only that technician's authorized assignments.
- [x] API checks prevent accessing another technician's order by changing an ID.
- [x] No create-order, reassignment, customer-editing, or delete controls appear.

### TECH-03 — Start an assigned repair — Complete

As a technician, I want to read the device/problem and start work so the shop sees the repair is in progress.

Acceptance:
- [x] Details shows the authorized repair's device and reported problem.
- [x] Starting work persists Pending → In Progress and shows success/error feedback.
- [x] Access is checked again if the manager reassigns the order.

### NOTES-01 — Save internal repair notes — Complete

As a technician, I want to save repair notes so useful work details are recorded.

Acceptance:
- [x] Distinguish unsaved text from a saved note with a clear Save note action.
- [x] Identify notes as internal and store author/time.
- [x] Leaving or attempting completion with unsaved text offers save/discard/cancel.
- [x] Customer endpoints do not exist yet and internal notes are available only to the assigned technician API.

### TECH-04 — Complete a repair — Complete

As a technician, I want to confirm completion and return to my list so I can move to the next job.

Acceptance:
- [x] A confirmation precedes In Progress → Completed.
- [x] Cancel keeps the existing status; confirm updates only after a successful save.
- [x] Resolve unsaved notes first.
- [x] Return to My Assigned Repairs with updated status/counts and visible completion feedback.

**Exit:** complete on September 21, 2026. Assigned-only access, notes, start, and completion work without widening access to manager functions.

## 13. Sprint 7 — Customer tracking

Goal: let customers securely check their own repair without exposing staff information.

Designs: 19–22.

### TRACK-01 — Access my repair securely — Complete

As a customer, I want a tracking link that grants access only to my repair so I can check progress privately.

Acceptance:
- [x] Staff create a customer link in Work Order Details and manually share it; creating a replacement invalidates the earlier link.
- [x] Do not use an order number alone as authorization; links carry a 256-bit random secret while Atlas stores only its hash.
- [x] Links expire after 30 days, public reads are rate-limited, there is no customer server session, and staff revoke access by creating a replacement.
- [x] The loading and unavailable states reveal no customer, device, order, status, or note information.
- [x] Implement a free-compatible manual-link method; no phone-code or delivery service is assumed.

### TRACK-02 — Read customer-facing progress — Complete

As an authorized customer, I want to see my repair's status and device details so I understand its progress.

Acceptance:
- [ ] Only the authorized repair is accessible.
- [x] Map staff Pending to customer Received; retain In Progress and Completed meanings.
- [x] Show the device, reported issue, and public status; hide technician assignment, internal notes, other customers, and edit controls.
- [x] Completed means repair work is complete; it does not assert payment, collection availability, or notification.
- [x] Provide End tracking, which returns to the public homepage; no customer server session is stored.

### TRACK-03 — Contact the shop — Deferred

As a customer, I want to contact the shop with my order reference so I can ask for assistance.

Acceptance:
- [x] Provide a Contact the shop dialog with Copy order number and clear guidance; opening it sends nothing.
- [ ] Add call and email actions after a manager supplies verified public shop contact details.

### TRACK-04 — Recover from an unavailable link — Complete

As a customer, I want clear recovery guidance if a link is invalid or expired so I know how to get help.

Acceptance:
- [x] Show unavailable-link guidance without revealing a repair record or why a specific private record was denied.
- [ ] Offer the shop's public call/email options once verified contact details are collected.
- [x] Reissuing access replaces older access immediately.

**Exit:** secure customer tracking is complete on September 22, 2026. Shop contact details remain a small follow-up before call/email actions can be enabled.

## 14. Data and rules to keep consistent

- Core records: shops, users, shop memberships, customers, technician assignment records, and work orders.
- Invitations and server-side sessions support onboarding/access. Internal repair notes arrive in Sprint 6; tracking access records arrive in Sprint 7.
- Work orders retain a stable customer/device/problem record, shop ownership, a shop-unique display number, optional technician, status, and created/updated times.
- Display order numbers are not authorization credentials.
- Staff statuses: Pending, In Progress, Completed. New orders begin Pending.
- Customers and technicians belong to the appropriate shop; the backend enforces boundaries.
- No automatic implication that Completed means paid, collected, ready for pickup, or notified.
- Homepage sample records stay separate from real operational data.

## 15. Decisions to settle when their sprint approaches

| Decision | Needed before | Design impact |
| --- | --- | --- |
| Exact required customer/contact/device fields and duplicate-customer handling | Sprint 3 | Finalize Create Order validation |
| Minimal way to maintain assignable technician names | Sprint 3 | Small manager action; no existing roster-management mockup |
| Front-desk permissions for post-creation assignment/status changes | Sprint 4 | Which controls appear on shared Details |
| Reopening/backward status transitions and concurrent-edit recovery | Sprint 4 | Status dialog and save-conflict behavior |
| Status-count meaning while search is active | Sprint 4 | Keep counts and matching-row totals unambiguous |
| Free-compatible invitation and password-recovery delivery | Sprints 2/5 | Honest sent/failed/manual-delivery states |
| Secure customer link issuance and optional verification mechanism | Sprint 7 | May revise phone-code mockup; add minimal staff issuance action |
| Where shop contact details are maintained | Sprint 7 | Supply real customer contact options |
| Public hosting | Before deployment | No hosting provider or paid plan is selected |

## 16. Definition of done

For each implemented story:

- The user flow works end to end for the intended role.
- Relevant saved designs, shared palette, and component patterns are followed.
- Loading, validation, empty/error, cancel, and success paths are handled where applicable.
- Backend permissions and validation enforce the rules; hiding a control is not sufficient.
- Data persists when persistence is part of the story.
- Appropriate type/build checks and meaningful behavior checks pass.
- Documentation and story status are updated based on evidence.
- No secrets, real customer data in fixtures, paid dependencies, or unapproved scope additions are introduced.

Future stories remain unchecked until implemented and verified.
