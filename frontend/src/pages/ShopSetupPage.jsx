import { useState } from "react";
import { useNavigate } from "react-router";
import { api, ApiError, useAuth } from "../auth/AuthContext";
import AppHeader from "../components/AppHeader";
import FormField from "../components/FormField";
function ShopSetupPage() {
  const [name, setName] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { setAccount } = useAuth();
  const navigate = useNavigate();
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setFieldError("");
    setError("");
    if (!name.trim()) {
      setFieldError("Enter your shop name.");
      document.getElementById("shop-name")?.focus();
      return;
    }
    setBusy(true);
    try {
      setAccount(await api("/shops", { name }));
      navigate("/work-orders", { replace: true });
    } catch (error2) {
      if (error2 instanceof ApiError && error2.status === 401) {
        setAccount(null);
        navigate("/sign-in");
        return;
      }
      setError(
        error2 instanceof Error
          ? error2.message
          : "Unable to save your shop. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <AppHeader setup />
      <main className="setup-main">
        <section className="setup-card">
          <p className="eyebrow text-burnt">Shop setup · One last step</p>
          <h1>Name your shop</h1>
          <p className="form-intro">This is the name your team will see.</p>
          <form onSubmit={submit} noValidate aria-busy={busy}>
            <FormField
              name="shop-name"
              label="Shop name"
              value={name}
              onChange={setName}
              error={fieldError}
              maxLength={100}
              autoComplete="organization"
              placeholder="e.g. Northside Repair"
            />
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <button
              className="button button-primary form-submit"
              disabled={busy}
            >
              {busy ? "Saving your shop…" : "Continue to work orders"}
              <span aria-hidden="true">→</span>
            </button>
          </form>
          <p className="setup-note">
            Just the name for now. You’ll be able to invite your team later.
          </p>
        </section>
      </main>
    </>
  );
}
export { ShopSetupPage as default };
