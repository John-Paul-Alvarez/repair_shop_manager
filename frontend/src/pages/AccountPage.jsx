import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { api, ApiError, destination, useAuth } from "../auth/AuthContext";
import AccountLayout from "../components/AccountLayout";
import FormField from "../components/FormField";
function AccountPage({ register = false }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fields, setFields] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { setAccount } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const inviteToken = params.get("invite");
  const invitePath =
    inviteToken && /^[a-f0-9]{64}$/.test(inviteToken)
      ? "/invite/" + inviteToken
      : null;
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const errors = {};
    if (register && !name.trim()) errors.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Enter your password.";
    else if (register && password.length < 15)
      errors.password =
        "Use at least 15 characters. A few unrelated words work well.";
    setFields(errors);
    setError("");
    if (Object.keys(errors).length) {
      document.getElementById(Object.keys(errors)[0])?.focus();
      return;
    }
    setBusy(true);
    try {
      const account = await api(register ? "/auth/register" : "/auth/sign-in", {
        ...(register ? { name } : {}),
        email,
        password,
      });
      setPassword("");
      setAccount(account);
      navigate(invitePath ?? destination(account), { replace: true });
    } catch (error2) {
      setError(error2 instanceof Error ? error2.message : "Please try again.");
      if (error2 instanceof ApiError) setFields(error2.fields);
    } finally {
      setBusy(false);
    }
  }
  return (
    <AccountLayout>
      <p className="eyebrow text-burnt">
        {register ? "Shop manager" : "Staff sign in"}
      </p>
      <h1>{register ? "Create your account" : "Welcome back."}</h1>
      <p className="form-intro">
        {register
          ? "Set up your account, then name your shop."
          : "Sign in to manage your shop’s repairs."}
      </p>
      <form onSubmit={submit} noValidate aria-busy={busy}>
        {register && (
          <FormField
            name="name"
            label="Full name"
            value={name}
            onChange={setName}
            error={fields.name}
            autoComplete="name"
            maxLength={100}
            placeholder="Your name"
          />
        )}
        <FormField
          name="email"
          label="Work email"
          type="email"
          value={email}
          onChange={setEmail}
          error={fields.email}
          autoComplete="email"
          maxLength={254}
          placeholder="you@yourshop.com"
        />
        <FormField
          name="password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          error={fields.password}
          autoComplete={register ? "new-password" : "current-password"}
          maxLength={128}
          hint={
            register
              ? "At least 15 characters. Try a memorable phrase."
              : undefined
          }
        />
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <button className="button button-primary form-submit" disabled={busy}>
          {busy
            ? register
              ? "Creating account…"
              : "Signing in…"
            : register
              ? "Create account"
              : "Sign in"}
          <span aria-hidden="true">→</span>
        </button>
      </form>
      <p className="account-switch">
        {register ? "Already have an account? " : "Setting up a shop? "}
        <Link to={register ? "/sign-in" : "/create-account"}>
          {register ? "Sign in" : "Create an account"}
        </Link>
      </p>
      {!register && (
        <p className="field-hint">
          Joining an existing shop? Open the invitation link from your manager.
        </p>
      )}
      <Link to="/" className="back-home">
        ← Back to homepage
      </Link>
    </AccountLayout>
  );
}
export { AccountPage as default };
