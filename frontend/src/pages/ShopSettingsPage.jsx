import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { api, ApiError, useAuth } from "../auth/AuthContext";
import AppHeader from "../components/AppHeader";
import FormField from "../components/FormField";

export default function ShopSettingsPage() {
  const { setAccount } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({ name: "", publicPhone: "", publicEmail: "" });
  const [fields, setFields] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState("");
  useEffect(() => { let active = true; api("/shop-settings").then((data) => active && setSettings(data)).catch((loadError) => active && setError(loadError.message)).finally(() => active && setLoading(false)); return () => { active = false; }; }, []);
  const change = (field) => (value) => { setSettings((current) => ({ ...current, [field]: value })); setFields((current) => ({ ...current, [field]: undefined })); };
  async function submit(event) {
    event.preventDefault(); if (busy) return;
    setBusy(true); setError(""); setSuccess("");
    try { const data = await api("/shop-settings", settings); setAccount((current) => ({ ...current, shop: data.shop })); setSuccess("Shop settings saved."); }
    catch (saveError) { if (saveError instanceof ApiError) setFields(saveError.fields); setError(saveError.message); } finally { setBusy(false); }
  }
  return <><AppHeader /><main className="intake-main page-container"><div className="intake-heading"><div><p className="eyebrow">Shop settings</p><h1>Customer contact details</h1><p>Only these details can appear on a customer’s tracking page.</p></div><Link className="button button-outline" to="/work-orders">Back to work orders</Link></div>{loading ? <p role="status">Loading shop settings…</p> : <form className="intake-form" onSubmit={submit} noValidate aria-busy={busy}><section className="intake-section"><div className="intake-section-heading"><p className="eyebrow">Public shop details</p><h2>What customers can see</h2></div><div className="intake-fields"><FormField name="shop-name-settings" label="Shop name" value={settings.name} onChange={change("name")} error={fields.name} maxLength={100} /><FormField name="public-phone" label="Public phone · optional" value={settings.publicPhone} onChange={change("publicPhone")} error={fields.publicPhone} type="tel" autoComplete="tel" maxLength={30} hint="A Call button appears on tracking when this is saved." required={false} /><FormField name="public-email" label="Public email · optional" value={settings.publicEmail} onChange={change("publicEmail")} error={fields.publicEmail} type="email" autoComplete="email" maxLength={254} hint="An Email button appears on tracking when this is saved." required={false} /></div></section>{error && <p className="form-error" role="alert">{error}</p>}{success && <p className="save-success" role="status">{success}</p>}<div className="intake-submit"><p>Leave either contact field empty to keep that action hidden from customers.</p><button className="button button-primary" disabled={busy}>{busy ? "Saving…" : "Save settings"}</button></div></form>}</main></>;
}
