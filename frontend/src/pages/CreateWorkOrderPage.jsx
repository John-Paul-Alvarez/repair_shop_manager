import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { api, ApiError, useAuth } from "../auth/AuthContext";
import AppHeader from "../components/AppHeader";
import FormField from "../components/FormField";

const blankOrder = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  device: "",
  problem: "",
  technicianId: "",
};

export default function CreateWorkOrderPage() {
  const { account, setAccount } = useAuth();
  const navigate = useNavigate();
  const requestId = useRef(crypto.randomUUID());
  const [order, setOrder] = useState(blankOrder);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState({});
  const [technicianName, setTechnicianName] = useState("");
  const [addingTechnician, setAddingTechnician] = useState(false);
  const [technicianError, setTechnicianError] = useState("");
  const dirty = Object.values(order).some(Boolean) || Boolean(technicianName);

  useEffect(() => {
    let active = true;
    api("/technicians")
      .then((data) => active && setTechnicians(data.technicians))
      .catch((loadError) => {
        if (active) setError(loadError.message);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const change = (field) => (value) => {
    setOrder((current) => ({ ...current, [field]: value }));
    setFields((current) => ({ ...current, [field]: undefined }));
  };

  function focusFirstInvalid(validation) {
    const first = ["customerName", "customerPhone", "customerEmail", "device", "problem", "technicianId"].find((name) => validation[name]);
    if (first) requestAnimationFrame(() => document.getElementById(first)?.focus());
  }

  useEffect(() => {
    const warn = (event) => {
      if (!dirty || busy) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [busy, dirty]);

  function confirmDiscard(event) {
    if (dirty && !window.confirm("Discard this work order? Your unsaved entries will be lost.")) event.preventDefault();
  }

  async function addTechnician(event) {
    event.preventDefault();
    if (addingTechnician) return;
    setTechnicianError("");
    if (!technicianName.trim()) {
      setTechnicianError("Enter a technician name.");
      return;
    }
    setAddingTechnician(true);
    try {
      const result = await api("/technicians", { name: technicianName });
      setTechnicians((current) => [...current, result.technician].sort((a, b) => a.name.localeCompare(b.name)));
      change("technicianId")(result.technician._id);
      setTechnicianName("");
    } catch (addError) {
      setTechnicianError(addError.message);
    } finally {
      setAddingTechnician(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setError("");
    const validation = {};
    if (!order.customerName.trim()) validation.customerName = "Enter the customer's name.";
    if (!order.customerPhone.trim()) validation.customerPhone = "Enter a phone number.";
    if (order.customerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.customerEmail.trim())) validation.customerEmail = "Enter a valid email address, or leave this blank.";
    if (!order.device.trim()) validation.device = "Enter the device and model.";
    if (!order.problem.trim()) validation.problem = "Describe the reported problem.";
    setFields(validation);
    if (Object.keys(validation).length) {
      focusFirstInvalid(validation);
      return;
    }
    setBusy(true);
    try {
      const result = await api("/work-orders", { ...order, requestId: requestId.current });
      navigate("/work-orders/" + result.order._id, { replace: true });
    } catch (saveError) {
      if (saveError instanceof ApiError && saveError.status === 401) {
        setAccount(null);
        navigate("/sign-in", { replace: true });
        return;
      }
      const serverFields = saveError.fields ?? {};
      setFields(serverFields);
      focusFirstInvalid(serverFields);
      setError(saveError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <AppHeader />
      <main className="intake-main page-container">
        <div className="intake-heading">
          <div>
            <p className="eyebrow">New repair intake</p>
            <h1>Create work order</h1>
            <p>Capture what the customer brought in, then confirm the repair.</p>
          </div>
          <Link className="button button-outline" to="/work-orders" onClick={confirmDiscard}>Cancel</Link>
        </div>
        <form className="intake-form" onSubmit={submit} noValidate aria-busy={busy}>
          <section className="intake-section">
            <div className="intake-section-heading">
              <p className="eyebrow">01 · Customer</p>
              <h2>Who is this repair for?</h2>
            </div>
            <div className="intake-fields two-columns">
              <FormField name="customerName" label="Customer name" value={order.customerName} onChange={change("customerName")} error={fields.customerName} autoComplete="name" maxLength={100} placeholder="Customer name" />
              <FormField name="customerPhone" label="Phone number" value={order.customerPhone} onChange={change("customerPhone")} error={fields.customerPhone} autoComplete="tel" maxLength={30} placeholder="(555) 555-5555" />
              <FormField name="customerEmail" label="Email · optional" value={order.customerEmail} onChange={change("customerEmail")} error={fields.customerEmail} type="email" autoComplete="email" maxLength={254} placeholder="customer@example.com" required={false} />
            </div>
          </section>
          <section className="intake-section">
            <div className="intake-section-heading">
              <p className="eyebrow">02 · Device</p>
              <h2>What needs attention?</h2>
            </div>
            <div className="intake-fields">
              <FormField name="device" label="Device and model" value={order.device} onChange={change("device")} error={fields.device} maxLength={150} placeholder="e.g. iPhone 14 Pro, MacBook Air" />
              <div className="form-field">
                <label htmlFor="problem">Reported problem</label>
                <textarea id="problem" name="problem" value={order.problem} onChange={(event) => change("problem")(event.target.value)} aria-invalid={!!fields.problem} aria-describedby={fields.problem ? "problem-error" : "problem-hint"} maxLength={2000} placeholder="Describe what the customer says is wrong." required />
                {fields.problem ? <p id="problem-error" className="field-error">{fields.problem}</p> : <p id="problem-hint" className="field-hint">Keep it in the customer’s own words where useful.</p>}
              </div>
            </div>
          </section>
          <section className="intake-section">
            <div className="intake-section-heading">
              <p className="eyebrow">03 · Assignment</p>
              <h2>Assign now, or leave it open</h2>
            </div>
            {loading ? <p role="status">Loading technicians…</p> : (
              <div className="intake-fields">
                <div className="form-field">
                  <label htmlFor="technician">Technician · optional</label>
                  <select id="technician" value={order.technicianId} onChange={(event) => change("technicianId")(event.target.value)} aria-invalid={!!fields.technicianId} aria-describedby={fields.technicianId ? "technician-error" : "technician-hint"}>
                    <option value="">Unassigned</option>
                    {technicians.map((technician) => <option key={technician._id} value={technician._id}>{technician.name}</option>)}
                  </select>
                  {fields.technicianId ? <p id="technician-error" className="field-error">{fields.technicianId}</p> : <p id="technician-hint" className="field-hint">You can assign a technician later.</p>}
                </div>
                {account?.shop?.role === "manager" && (
                  <div className="inline-technician">
                    <p className="field-label">Need a name in the list?</p>
                    <div className="inline-technician-controls">
                      <input value={technicianName} onChange={(event) => setTechnicianName(event.target.value)} maxLength={100} placeholder="Technician name" aria-label="Technician name" />
                      <button type="button" className="button button-outline" onClick={addTechnician} disabled={addingTechnician}>{addingTechnician ? "Adding…" : "Add technician"}</button>
                    </div>
                    {technicianError && <p className="field-error" role="alert">{technicianError}</p>}
                  </div>
                )}
              </div>
            )}
          </section>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="intake-submit">
            <p>It will start as <strong>Pending</strong>.</p>
            <button className="button button-primary" disabled={busy || loading}>{busy ? "Creating work order…" : "Create work order"}<span aria-hidden="true">→</span></button>
          </div>
        </form>
      </main>
    </>
  );
}
