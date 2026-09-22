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
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [noteError, setNoteError] = useState("");
  const [noteBusy, setNoteBusy] = useState(false);
  const [completePrompt, setCompletePrompt] = useState(false);
  const [unsavedAction, setUnsavedAction] = useState("");
  const modalRef = useRef(null);
  const openerRef = useRef(null);
  const technician = account?.shop?.role === "technician";
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
    if (!technician || !orderId) return undefined;
    let active = true;
    api("/work-orders/" + orderId + "/notes")
      .then((data) => active && setNotes(data.notes))
      .catch(() => active && setNotes([]));
    return () => { active = false; };
  }, [orderId, technician]);
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
  async function saveNote(afterSave) {
    const text = noteText.trim();
    if (!text) { setNoteError("Enter a note before saving."); return false; }
    setNoteBusy(true); setNoteError("");
    try {
      const data = await api("/work-orders/" + orderId + "/notes", { text });
      setNotes((current) => [...current, data.note]);
      setNoteText("");
      setSuccess("Internal repair note saved.");
      if (afterSave) afterSave();
      return true;
    } catch (error) { setNoteError(error.message); return false; } finally { setNoteBusy(false); }
  }
  async function updateTechnicianStatus(action) {
    setNoteBusy(true); setNoteError("");
    try {
      const data = await api("/work-orders/" + orderId + "/" + action, { version: order.version });
      if (action === "complete") {
        navigate(back, { replace: true, state: { message: "Repair marked completed." } });
      } else {
        setOrder(data.order);
        setSuccess("Repair marked In Progress.");
      }
    } catch (error) { setNoteError(error.message); } finally { setNoteBusy(false); }
  }
  const back = (technician ? "/my-repairs" : "/work-orders") + location.search;
  return <>
    <AppHeader />
    <main className="details-main page-container">
      {loading ? <div className="details-state" role="status">Loading work order…</div> : error ? <div className="details-state"><h1>Work order unavailable</h1><p role="alert">{error}</p><button className="button button-dark" onClick={() => void load()}>Try again</button><Link to="/work-orders">Back to work orders</Link></div> : <>
        <div className="details-heading"><div><Link className="back-link" to={back}>← {technician ? "My assigned repairs" : "Work orders"}</Link><p className="eyebrow">{order.number}</p><h1>{technician ? "Repair task" : "Repair received"}</h1><p>{technician ? "Review the problem, record your work, and keep progress clear." : "This work order is saved and ready for the shop."}</p></div><StatusBadge status={order.status} /></div>
        <section className="details-card"><div className="details-row">{!technician && <div><p className="details-label">Customer</p><h2>{order.customerName}</h2><p>{order.customerPhone}</p>{order.customerEmail && <p>{order.customerEmail}</p>}</div>}<div><p className="details-label">{technician ? "Assignment" : "Assigned technician"}</p><h2>{technician ? "Assigned to you" : order.technicianName || "Unassigned"}</h2><p>{technician ? "Only you can update this repair while it remains assigned to you." : order.technicianName ? "Assigned at intake" : "Assign a technician when ready."}</p></div></div><div className="details-divider" /><div className="details-row"><div><p className="details-label">Device and model</p><h2>{order.device}</h2></div><div><p className="details-label">Reported problem</p><p className="details-problem">{order.problem}</p></div></div></section>
        {technician && <section className="details-card repair-notes"><div className="intake-section-heading"><p className="eyebrow">Internal notes</p><h2>What did you find or do?</h2></div><div className="form-field"><label htmlFor="repair-note">Repair note</label><textarea id="repair-note" value={noteText} onChange={(event) => { setNoteText(event.target.value); setNoteError(""); }} maxLength={2000} placeholder="Add repair steps, parts used, or follow-up details." aria-describedby="repair-note-hint" /><p id="repair-note-hint" className="field-hint">Internal only. Customers cannot see these notes.</p></div>{noteError && <p className="form-error" role="alert">{noteError}</p>}<button className="button button-outline" disabled={noteBusy || !noteText.trim()} onClick={() => void saveNote()}> {noteBusy ? "Saving…" : "Save note"}</button>{notes.length > 0 && <div className="saved-notes"><h3>Saved notes</h3>{notes.map((note) => <article key={note._id}><p>{note.text}</p><small>{note.authorName} · {new Date(note.createdAt).toLocaleString()}</small></article>)}</div>}</section>}
        <div className="details-footer"><div><p><strong>{order.number}</strong> is currently {order.status}.</p>{success && <p className="save-success" role="status">{success}</p>}</div><div className="details-actions">{account?.shop?.role === "manager" && <><button className="button button-outline" onClick={(event) => open("assignment", event)}>{order.technicianName ? "Change technician" : "Assign technician"}</button><button className="button button-primary" onClick={(event) => open("status", event)}>Update status</button></>}{technician && order.status === "Pending" && <button className="button button-primary" disabled={noteBusy} onClick={() => void updateTechnicianStatus("start")}>{noteBusy ? "Saving…" : "Start repair"}</button>}{technician && order.status === "In Progress" && <button className="button button-primary" disabled={noteBusy} onClick={() => noteText.trim() ? setUnsavedAction("complete") : setCompletePrompt(true)}>{noteBusy ? "Saving…" : "Complete repair"}</button>}<Link className="button button-outline" to={back} onClick={(event) => { if (technician && noteText.trim()) { event.preventDefault(); setUnsavedAction("leave"); } }}>{technician ? "Back to my repairs" : "Back to work orders"}</Link></div></div>
        {modal && <div className="modal-backdrop"><section ref={modalRef} className="manager-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-description"><button className="modal-close" onClick={close} aria-label="Close">×</button><h2 id="modal-title">{modal === "assignment" ? "Assign technician" : "Update repair status"}</h2><p id="modal-description">{order.number} · {order.device}</p><p className="field-hint">Current {modal === "assignment" ? "technician: " + (order.technicianName || "Unassigned") : "status: " + order.status}</p><div className="modal-options">{modal === "assignment" ? [{ _id: "", name: "Unassigned" }, ...technicians].map((item) => <label key={item._id} className={choice === item._id ? "selected" : ""}><input type="radio" name="technician" checked={choice === item._id} onChange={() => setChoice(item._id)} />{item.name}</label>) : ["Pending", "In Progress", "Completed"].map((item) => <label key={item} className={choice === item ? "selected" : ""}><input type="radio" name="status" checked={choice === item} onChange={() => setChoice(item)} />{item}</label>)}</div>{saveError && <p className="form-error" role="alert">{saveError}</p>}<p className="field-hint">Changes apply when you save. Press Escape to cancel.</p><div className="modal-actions"><button className="button button-outline" onClick={close}>Cancel</button><button className="button button-primary" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save changes"}</button></div></section></div>}
        {unsavedAction && <div className="modal-backdrop"><section className="manager-modal" role="dialog" aria-modal="true" aria-labelledby="unsaved-note-title"><h2 id="unsaved-note-title">Save this note first?</h2><p>You have an unsaved internal repair note.</p><div className="modal-actions"><button className="button button-outline" onClick={() => setUnsavedAction("")}>Cancel</button><button className="button button-outline" onClick={() => { const action = unsavedAction; setNoteText(""); setUnsavedAction(""); if (action === "complete") setCompletePrompt(true); else navigate(back); }}>Discard note</button><button className="button button-primary" disabled={noteBusy} onClick={() => void saveNote(() => { const action = unsavedAction; setUnsavedAction(""); if (action === "complete") setCompletePrompt(true); else navigate(back); })}>{noteBusy ? "Saving…" : "Save note"}</button></div></section></div>}
        {completePrompt && <div className="modal-backdrop"><section className="manager-modal" role="dialog" aria-modal="true" aria-labelledby="complete-title"><h2 id="complete-title">Complete this repair?</h2><p>Mark {order.number} as Completed when the work is ready to hand back to the shop.</p><div className="modal-actions"><button className="button button-outline" onClick={() => setCompletePrompt(false)}>Cancel</button><button className="button button-primary" disabled={noteBusy} onClick={() => { setCompletePrompt(false); void updateTechnicianStatus("complete"); }}>{noteBusy ? "Saving…" : "Mark completed"}</button></div></section></div>}
      </>}
    </main>
  </>;
}
