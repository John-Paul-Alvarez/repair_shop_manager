import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { api, ApiError, useAuth } from "../auth/AuthContext";
import AppHeader from "../components/AppHeader";
import StatusBadge from "../components/StatusBadge";

export default function WorkOrderDetailsPage() {
  const { orderId } = useParams();
  const { account, setAccount } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [choice, setChoice] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [success, setSuccess] = useState("");
  const modalRef = useRef(null);
  const openerRef = useRef(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setOrder((await api("/work-orders/" + orderId)).order);
    } catch (loadError) {
      if (loadError instanceof ApiError && loadError.status === 401) {
        setAccount(null);
        navigate("/sign-in", { replace: true });
      } else setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [navigate, orderId, setAccount]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (account?.shop?.role === "manager") {
      api("/technicians").then((data) => setTechnicians(data.technicians)).catch(() => setTechnicians([]));
    }
  }, [account]);
  useEffect(() => {
    if (!modal) return undefined;
    const dialog = modalRef.current;
    const firstControl = dialog?.querySelector("button, input");
    firstControl?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setModal(null);
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const controls = [...dialog.querySelectorAll('button:not([disabled]), input:not([disabled])')];
      if (!controls.length) return;
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      openerRef.current?.focus();
    };
  }, [modal]);
  const close = () => setModal(null);
  const open = (kind, event) => {
    openerRef.current = event.currentTarget;
    setModal(kind);
    setChoice(kind === "assignment" ? (order.technicianId ?? "") : order.status);
    setSaveError("");
    setSuccess("");
  };
  async function save() {
    if (saving) return;
    setSaving(true); setSaveError("");
    try {
      const data = await api("/work-orders/" + orderId + (modal === "assignment" ? "/assignment" : "/status"), modal === "assignment" ? { technicianId: choice, version: order.version ?? 1 } : { status: choice, version: order.version ?? 1 });
      setOrder(data.order);
      setSuccess(modal === "assignment" ? "Technician assignment saved." : "Repair status saved.");
      setModal(null);
    } catch (error) { setSaveError(error.message); } finally { setSaving(false); }
  }
  const back = "/work-orders" + location.search;
  return <>
    <AppHeader />
    <main className="details-main page-container">
      {loading ? <div className="details-state" role="status">Loading work order…</div> : error ? <div className="details-state"><h1>Work order unavailable</h1><p role="alert">{error}</p><button className="button button-dark" onClick={() => void load()}>Try again</button><Link to="/work-orders">Back to work orders</Link></div> : <>
        <div className="details-heading"><div><Link className="back-link" to={back}>← Work orders</Link><p className="eyebrow">{order.number}</p><h1>Repair received</h1><p>This work order is saved and ready for the shop.</p></div><StatusBadge status={order.status} /></div>
        <section className="details-card"><div className="details-row"><div><p className="details-label">Customer</p><h2>{order.customerName}</h2><p>{order.customerPhone}</p>{order.customerEmail && <p>{order.customerEmail}</p>}</div><div><p className="details-label">Assigned technician</p><h2>{order.technicianName || "Unassigned"}</h2><p>{order.technicianName ? "Assigned at intake" : "Assign a technician when ready."}</p></div></div><div className="details-divider" /><div className="details-row"><div><p className="details-label">Device and model</p><h2>{order.device}</h2></div><div><p className="details-label">Reported problem</p><p className="details-problem">{order.problem}</p></div></div></section>
        <div className="details-footer"><div><p><strong>{order.number}</strong> is currently {order.status}.</p>{success && <p className="save-success" role="status">{success}</p>}</div><div className="details-actions">{account?.shop?.role === "manager" && <><button className="button button-outline" onClick={(event) => open("assignment", event)}>{order.technicianName ? "Change technician" : "Assign technician"}</button><button className="button button-primary" onClick={(event) => open("status", event)}>Update status</button></>}<Link className="button button-outline" to={back}>Back to work orders</Link></div></div>
        {modal && <div className="modal-backdrop"><section ref={modalRef} className="manager-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-description"><button className="modal-close" onClick={close} aria-label="Close">×</button><h2 id="modal-title">{modal === "assignment" ? "Assign technician" : "Update repair status"}</h2><p id="modal-description">{order.number} · {order.device}</p><p className="field-hint">Current {modal === "assignment" ? "technician: " + (order.technicianName || "Unassigned") : "status: " + order.status}</p><div className="modal-options">{modal === "assignment" ? [{ _id: "", name: "Unassigned" }, ...technicians].map((item) => <label key={item._id} className={choice === item._id ? "selected" : ""}><input type="radio" name="technician" checked={choice === item._id} onChange={() => setChoice(item._id)} />{item.name}</label>) : ["Pending", "In Progress", "Completed"].map((item) => <label key={item} className={choice === item ? "selected" : ""}><input type="radio" name="status" checked={choice === item} onChange={() => setChoice(item)} />{item}</label>)}</div>{saveError && <p className="form-error" role="alert">{saveError}</p>}<p className="field-hint">Changes apply when you save. Press Escape to cancel.</p><div className="modal-actions"><button className="button button-outline" onClick={close}>Cancel</button><button className="button button-primary" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save changes"}</button></div></section></div>}
      </>}
    </main>
  </>;
}
