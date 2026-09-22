import { useState } from "react";
import { Link } from "react-router";
import AccountLayout from "../components/AccountLayout";
import FormField from "../components/FormField";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function submit(event) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      setSubmitted(false);
      return;
    }
    setError("");
    setSubmitted(true);
  }

  return (
    <AccountLayout>
      <p className="eyebrow text-burnt">Account recovery</p>
      <h1>Forgot your password?</h1>
      <p className="form-intro">
        Enter your work email to check the recovery option for your shop.
      </p>
      {submitted ? (
        <div className="recovery-unavailable" role="status">
          <h2>Password recovery is not configured yet.</h2>
          <p>
            Contact your shop manager to regain access. This message is the
            same for every email address and does not confirm an account.
          </p>
          <Link className="button button-primary" to="/sign-in">
            Back to sign in <span aria-hidden="true">→</span>
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <FormField
            name="recovery-email"
            label="Work email"
            type="email"
            value={email}
            onChange={setEmail}
            error={error}
            autoComplete="email"
            maxLength={254}
            placeholder="you@yourshop.com"
          />
          <button className="button button-primary form-submit">
            Continue <span aria-hidden="true">→</span>
          </button>
        </form>
      )}
      <Link to="/sign-in" className="back-home">
        ← Back to sign in
      </Link>
    </AccountLayout>
  );
}
