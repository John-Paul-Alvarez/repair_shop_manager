# Manual testing — Sprints 1–6

Use fictional shop and employee details. These accounts are persisted in your app's Atlas database. Application passwords are separate from the Atlas database password.

## Start the app

Open two PowerShell terminals and leave them running.

Terminal 1:

```powershell
cd "C:\Users\John Paul\Downloads\jobs\softwareDevJobs\projects\repairShopManagerV2\backend"
npm.cmd run dev
```

Expect `API running at http://127.0.0.1:4000` and `MongoDB connected.`

Terminal 2:

```powershell
cd "C:\Users\John Paul\Downloads\jobs\softwareDevJobs\projects\repairShopManagerV2\frontend"
npm.cmd run dev
```

Open **http://127.0.0.1:5173**. If dependencies have not been installed, run `npm.cmd install` once in each folder first. Use Ctrl+C to stop a server. Do not start another copy if one is already using that port.

Keep using `127.0.0.1` rather than switching between it and `localhost`; browser cookies belong to a hostname. An incognito/private window has a separate session, which is useful when testing the employee alongside the manager.

## Sprint 1 — manager account and shop

1. From the homepage, choose **Create your shop**.
2. Submit the empty form. Fields should explain what is missing.
3. Enter your test name, a unique test email such as `manager-one@example.test`, and an application password of at least 15 characters. Create the account.
4. You should reach **Name your shop**. Refresh: you should still be signed in on this step.
5. For the interrupted-setup check, sign out here, then sign back in. You should return to **Name your shop**.
6. Submit a blank shop name, then enter `Northside Test Repair` and choose **Continue**.
7. The optional invitation page should appear. Choose **Skip for now**.
8. Work Orders should show your saved shop name and **No work orders yet**. The homepage's three sample orders must not appear here.
9. Refresh, sign out, then sign back in. You should return directly to the same shop's Work Orders page.
10. Sign out and enter `/work-orders` in the address bar. You should be redirected to Sign in.
11. Try a wrong password. The message should say the email or password is incorrect. Try registering with your existing email: the response should direct you to sign in instead of creating another account.

## Sprint 2 — invite an employee

1. Sign in as the manager and select **Invite staff** on Work Orders. This reopens the same optional invitation form.
2. Enter an employee email such as `frontdesk-one@example.test` and choose **Create invitation link**.
3. Confirm the result shows the intended email, shop, front-desk role, and expiry date. It must say **No email has been sent**.
4. Choose **Copy invitation link**. Open it in a private/incognito window on the same computer.
5. Confirm the employee sees the inviting shop and their prefilled, read-only email.
6. Enter a test name and a new application password, then choose **Join shop**.
7. The employee should land in the manager's shop, with the same empty queue and **Front desk** label. They should not see **Invite staff**.
8. Sign the employee out, then back in. Their shop and role should persist.
9. Reopen the used invitation link. It should explain that the link is unavailable and offer sign-in/recovery guidance.

Localhost links work only on the machine running the app. Remote staff access will require a later deployment; these sprints do not publish the website or send messages.

## Existing accounts and invitation errors

- **Existing account:** Create another account but leave shop setup unfinished. Invite its email from the first manager. In a private window, open the invitation and choose **Sign in to accept**. Sign in, then choose **Join shop**. It should reuse that account without creating another shop.
- **Wrong signed-in account:** Open an invitation while signed in as a different email. The page should offer **Switch account** and should not grant access to the wrong account.
- **Replaced link:** Create an invitation twice for the same email. The first link should stop working; the new one should work.
- **Invalid link:** Open `/invite/not-a-valid-token`. Expect clear recovery guidance, not a blank page.
- **Already belongs to another shop:** Invite an email that already has its own shop. The app should refuse instead of moving that account to your shop.
- **Skip and return:** Skip onboarding invitations, then use **Invite staff** from Work Orders later.

Seven-day expiry, concurrent acceptance, forged API permissions, and cross-shop read/write attempts are covered by the integration tests rather than waiting or manually changing database records.

## Sprint 3 — receive a device

1. Sign in as the manager or front-desk employee and select **New work order**.
2. Submit the empty form. The required customer, device, and problem fields should show errors and focus the first missing field.
3. Enter a customer name and phone number, an optional email, a device/model, and a reported problem. Valid entries should remain in place when a field needs correction.
4. Leave the technician set to **Unassigned**, or, while signed in as the manager, add a technician name inline and select it. Front-desk employees can choose existing names but cannot add a new one.
5. Choose **Create work order**. You should land on the saved confirmation screen with a `WO-…` number and **Pending** status.
6. Refresh the details page, then return to Work Orders. The repair should still be present for staff in the same shop.
7. Start entering an order and choose **Cancel**. The app should ask before discarding your entries.

## Sprint 4 — inquiries and repair workload

1. Sign in as either demo account and search for `Maya`, `WO-1001`, or `5550148`. The same work order should be found despite letter case or ordinary phone punctuation.
2. Open the matching repair, then choose **Back to work orders**. The search should still be applied.
3. Search for text that does not exist. The page should say **No matching work orders** and offer **Clear search and filters**. It must not show the new-shop empty state.
4. Sign in as the manager. Use each status filter and confirm its count represents all repairs in the shop, while the footer reports matching rows for the active filter/search.
5. Open a repair and choose **Assign technician** or **Change technician**. Select a value, then choose **Cancel**. The saved assignment should not change. Repeat and choose **Save changes**; the page should confirm the saved change.
6. Choose **Update status**, select a status, then choose **Save changes**. Refresh the page and queue to confirm the status persists.
7. With the dialog open, press Escape. It should close and return keyboard focus to the button that opened it. Tab should stay within the dialog while it is open.
8. Sign in as the front-desk employee. You can search and view repair details, but assignment and status-update controls must not appear.

## Sprint 5 — quality and reliability

1. Use Tab to reach navigation, controls, form fields, and buttons. The focused element should have a clear orange outline.
2. Submit blank account, shop, and work-order forms. The first invalid field should receive focus and retain valid entries.
3. Test the queue, create-order form, and details page at a narrow browser width. Content must remain readable without horizontal page scrolling.
4. Stop the backend while Work Orders is open, refresh, and verify the connection error includes **Try again**. Restart the API and retry.
5. In two separate signed-in manager sessions, open the same repair. Save an assignment/status change in one session, then try saving from the stale session. The stale session should be asked to reload instead of overwriting the newer change.
6. Refresh after each saved intake, assignment, and status change. The saved state must remain.

## Sprint 6 — technician work

1. Sign in as a manager and select **Invite staff**. Choose **Technician — assigned repairs and notes**, enter a fictional technician email, and create the private invitation link.
2. Open the link in a private window. Create the technician account, then confirm sign-in lands on **My assigned repairs**, with no Create work order or manager controls.
3. As the manager, create or open a repair and assign the new technician. Refresh the technician’s queue: the repair should appear only there, not in another technician’s queue.
4. As the technician, search by its order number, device, or reported problem and use a status filter. Open the repair and confirm device/problem are visible.
5. Choose **Start repair**. The status should become **In Progress** only after the server saves it.
6. Add an internal repair note and choose **Save note**. Confirm the note shows its author and time. Enter another note, select **Complete repair** or **Back to my repairs**, then choose Save note, Discard note, or Cancel to verify each option behaves as labeled.
7. Complete the repair and confirm the dialog. You should return to My assigned repairs with a completion message and updated counts.
8. Reassign an open repair as the manager while the technician has it open. The technician’s next save should ask them to reload rather than change a repair no longer assigned to them.

## Loading, errors, and mobile

- Narrow the browser to a phone-sized width. Forms and buttons should remain readable without sideways page scrolling.
- While signed in, stop the backend and refresh Work Orders. Expect an error with **Try again**, not an empty shop message. Restart the API and retry.
- **New work order** opens the live Sprint 3 intake form. A saved repair should appear only after the confirmation screen loads.
- Password reset is deferred until a free-compatible email sender is chosen and configured. Use a test password you can remember for now.

## Automated checks

```powershell
# In backend/
npm.cmd test
npm.cmd run test:integration

# In frontend/
npm.cmd run build
```

The integration command needs the local Atlas connection. It creates uniquely prefixed test collections, then removes only those fixtures. It does not reset your manually created shops or accounts.
