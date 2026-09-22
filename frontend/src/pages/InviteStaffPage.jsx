import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { api, ApiError, useAuth } from "../auth/AuthContext";
import AppHeader from "../components/AppHeader";
import FormField from "../components/FormField";

export default function InviteStaffPage() {
  const { account, setAccount } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("front-desk");
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [busy, setBusy] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const [copied, setCopied] = useState("");
  const link = invitation
    ? new URL(invitation.path, window.location.origin).href
    : "";
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setError("");
    setFieldError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFieldError("Enter a valid email address.");
      return;
    }
    setBusy(true);
    try {
      setInvitation(await api("/invitations", { email, role }));
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setAccount(null);
        navigate("/sign-in");
        return;
      }
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied("Link copied. Share it privately with your employee.");
    } catch {
      setCopied("Select the link below and copy it manually.");
    }
  }
  return (
    <>
      <AppHeader setup />
      <main className="setup-main">
        <section className="setup-card invite-card">
          <p className="eyebrow text-burnt">Shop setup · Optional invitation</p>
          <h1>
            {invitation ? "Your invitation is ready" : "Invite a team member"}
          </h1>
          <p className="form-intro">
            Give your team access to <strong>{account.shop.name}</strong>.
          </p>
          {invitation ? (
            <div className="invite-result">
              <p>
                For <strong>{invitation.email}</strong>
              </p>
              <p className="field-hint">
                Access: {invitation.role === "technician" ? "Technician" : "Front-desk employee"} · Expires{" "}
                {new Date(invitation.expiresAt).toLocaleDateString()}
              </p>
              <label htmlFor="invitation-link">Invitation link</label>
              <input
                id="invitation-link"
                value={link}
                readOnly
                onFocus={(event) => event.target.select()}
              />
              <button
                className="button button-primary form-submit"
                onClick={copyLink}
              >
                Copy invitation link
              </button>
              {copied && (
                <p role="status" className="field-hint">
                  {copied}
                </p>
              )}
              <p className="invite-note">
                No email has been sent. Share this link privately with the
                employee shown above. It can be used once.
              </p>
              <Link
                className="button button-dark form-submit"
                to="/work-orders"
              >
                Continue to work orders
              </Link>
              <button
                className="text-button"
                onClick={() => {
                  setInvitation(null);
                  setEmail(""); setRole("front-desk");
                  setCopied("");
                }}
              >
                Invite another employee
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={submit} noValidate aria-busy={busy}>
                <FormField
                  name="employee-email"
                  label="Employee email"
                  type="email"
                  autoComplete="email"
                  placeholder="employee@example.com"
                  value={email}
                  onChange={setEmail}
                  error={fieldError}
                  maxLength={254}
                  hint="Choose the access this person needs."
                />
                <div className="form-field">
                  <label htmlFor="employee-role">Team role</label>
                  <select id="employee-role" value={role} onChange={(event) => setRole(event.target.value)}>
                    <option value="front-desk">Front desk — shared queue and intake</option>
                    <option value="technician">Technician — assigned repairs and notes</option>
                  </select>
                </div>
                {error && (
                  <p role="alert" className="form-error">
                    {error}
                  </p>
                )}
                <p className="invite-note">
                  Create a private link to share yourself. No email service is
                  needed. A new link for the same email replaces the previous
                  one.
                </p>
                <button
                  className="button button-primary form-submit"
                  disabled={busy}
                >
                  {busy ? "Creating invitation…" : "Create invitation link"}
                </button>
              </form>
              <Link to="/work-orders" className="skip-invite">
                Skip for now
              </Link>
              <p className="setup-note">
                You can invite staff later from Work orders.
              </p>
            </>
          )}
        </section>
      </main>
    </>
  );
}
