import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { api, useAuth } from "../auth/AuthContext";
import AccountLayout from "../components/AccountLayout";
import FormField from "../components/FormField";

export default function AcceptInvitationPage() {
  const { token } = useParams();
  const { account, loading: accountLoading, setAccount } = useAuth();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [fields, setFields] = useState({});
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const path = "/invite/" + token;
  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError("");
    setInvitation(null);
    setError("");
    api("/invitations/" + token)
      .then((data) => {
        if (active) setInvitation(data);
      })
      .catch((error) => {
        if (active) setLoadError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token, attempt]);
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setError("");
    const validation = {};
    if (!account && !name.trim()) validation.name = "Enter your name.";
    if (!account && password.length < 15)
      validation.password = "Use at least 15 characters.";
    setFields(validation);
    if (Object.keys(validation).length) return;
    setBusy(true);
    try {
      const result = await api(
        "/invitations/" + token + "/accept",
        account ? {} : { name, password },
      );
      setPassword("");
      setAccount(result);
      navigate("/work-orders", { replace: true });
    } catch (error) {
      setError(error.message);
      setFields(error.fields ?? {});
    } finally {
      setBusy(false);
    }
  }
  async function switchAccount() {
    setBusy(true);
    setError("");
    try {
      await api("/auth/sign-out", {});
      setAccount(null);
      navigate("/sign-in?invite=" + token);
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  const wrongAccount = account && account.user.email !== invitation?.email;
  return (
    <AccountLayout>
      <p className="eyebrow text-burnt">You’re invited</p>
      {loading || accountLoading ? (
        <p role="status">Loading your invitation…</p>
      ) : loadError ? (
        <>
          <h1>Invitation unavailable</h1>
          <p role="alert" className="form-intro">
            {loadError}
          </p>
          <button
            className="button button-dark"
            onClick={() => setAttempt(attempt + 1)}
          >
            Try again
          </button>
          <p className="account-switch">
            <Link to="/sign-in">Sign in to your workspace</Link>
          </p>
        </>
      ) : (
        <>
          <h1>Join {invitation.shopName}</h1>
          <p className="form-intro">
            {account
              ? "Accept your invitation to join the team."
              : "Set up your account to get started."}
          </p>
          <p className="invite-access">Access: Front-desk employee</p>
          <form onSubmit={submit} noValidate aria-busy={busy}>
            {!account && (
              <FormField
                name="name"
                label="Full name"
                autoComplete="name"
                value={name}
                onChange={setName}
                error={fields.name}
                maxLength={100}
                placeholder="Your name"
              />
            )}
            <div className="form-field">
              <label htmlFor="invited-email">Work email</label>
              <div className="field-input-wrap">
                <input
                  id="invited-email"
                  type="email"
                  readOnly
                  value={invitation.email}
                  aria-describedby="invited-email-hint"
                />
              </div>
              <p id="invited-email-hint" className="field-hint">
                This invitation is for this email address.
              </p>
            </div>
            {!account && (
              <FormField
                name="password"
                label="Password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={setPassword}
                error={fields.password}
                maxLength={128}
                hint="At least 15 characters. Try a memorable phrase."
              />
            )}
            {wrongAccount && (
              <p className="form-error">
                You’re signed in as {account.user.email}. Switch to the invited
                account to continue.
              </p>
            )}
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            {wrongAccount ? (
              <button
                className="button button-primary form-submit"
                type="button"
                onClick={switchAccount}
                disabled={busy}
              >
                Switch account
              </button>
            ) : (
              <button
                className="button button-primary form-submit"
                disabled={busy}
              >
                {busy ? "Joining shop…" : "Join shop"}
                <span aria-hidden="true">→</span>
              </button>
            )}
          </form>
          {!account && (
            <p className="account-switch">
              Already have an account?{" "}
              <Link to={"/sign-in?invite=" + token} state={{ from: path }}>
                Sign in to accept
              </Link>
            </p>
          )}
          {account?.shop && (
            <p className="account-switch">
              <Link to="/work-orders">Back to your workspace</Link>
            </p>
          )}
        </>
      )}
      <Link to="/" className="back-home">
        ← Back to homepage
      </Link>
    </AccountLayout>
  );
}
