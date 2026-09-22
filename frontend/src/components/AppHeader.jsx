import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { api, useAuth } from "../auth/AuthContext";
import Icon from "./Icon";
function Brand() {
  return (
    <Link to="/" className="brand">
      <span className="brand-mark">
        <Icon name="wrench" />
      </span>
      Repair Shop Manager
    </Link>
  );
}
function AppHeader({ setup = false }) {
  const { account, setAccount } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const technician = account?.shop?.role === "technician";
  async function signOut() {
    setBusy(true);
    setError("");
    try {
      await api("/auth/sign-out", {});
      setAccount(null);
      navigate("/sign-in", { replace: true });
    } catch (error2) {
      setError(
        error2 instanceof Error ? error2.message : "Unable to sign out.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <Brand />
          {setup ? (
            <span className="app-section-label">Shop setup</span>
          ) : (
            <div className="app-nav"><Link className="app-current" to={technician ? "/my-repairs" : "/work-orders"} aria-current="page">{technician ? "My repairs" : "Work orders"}</Link>{account?.shop?.role === "manager" && <Link to="/shop-settings">Shop settings</Link>}</div>
          )}
          <div className="app-user">
            <span>
              {account?.user.name}
              <small>
                {technician
                  ? "Technician"
                  : account?.shop?.role === "front-desk"
                    ? "Front desk"
                    : "Shop manager"}
              </small>
            </span>
            <button className="text-button" onClick={signOut} disabled={busy}>
              {busy ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      </header>
      {error && (
        <p className="app-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
export { Brand, AppHeader as default };
