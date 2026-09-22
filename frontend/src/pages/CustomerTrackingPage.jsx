import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { api } from "../auth/AuthContext";
import { Brand } from "../components/AppHeader";
import StatusBadge from "../components/StatusBadge";

export default function CustomerTrackingPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [repair, setRepair] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [contactOpen, setContactOpen] = useState(false);
  const [copied, setCopied] = useState("");
  useEffect(() => {
    let active = true;
    api("/tracking/" + token).then((data) => active && setRepair(data.repair)).catch((loadError) => active && setError(loadError.message)).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [token]);
  async function copyOrder() {
    try { await navigator.clipboard.writeText(repair.number); setCopied("Order number copied."); }
    catch { setCopied("Select the order number and copy it manually."); }
  }
  return <main className="tracking-page page-container">
    <Brand />
    <section className="tracking-card-public">
      {loading ? <p role="status">Checking your repair link…</p> : error ? <><p className="eyebrow text-burnt">Tracking unavailable</p><h1>This link is unavailable</h1><p>{error}</p><p className="field-hint">Contact the repair shop and ask them to issue a new tracking link.</p></> : <><p className="eyebrow text-burnt">Repair tracking</p><div className="tracking-heading"><div><h1>Your repair update</h1><p>Order {repair.number}</p></div><StatusBadge status={repair.status === "Received" ? "Pending" : repair.status} /></div><div className="tracking-status"><p className="details-label">Current status</p><h2>{repair.status}</h2><p>{repair.status === "Received" ? "Your device has been received by the shop." : repair.status === "In Progress" ? "A technician is working on your repair." : "Repair work is complete. Contact the shop about next steps."}</p></div><div className="details-divider" /><div className="tracking-details"><div><p className="details-label">Device</p><h2>{repair.device}</h2></div><div><p className="details-label">Reported issue</p><p>{repair.problem}</p></div></div><div className="tracking-actions"><button className="button button-primary" onClick={() => setContactOpen(true)}>Contact the shop</button><button className="button button-outline" onClick={() => navigate("/", { replace: true })}>End tracking</button></div></>}
    </section>
    {contactOpen && <div className="modal-backdrop"><section className="manager-modal" role="dialog" aria-modal="true" aria-labelledby="contact-title"><button className="modal-close" onClick={() => setContactOpen(false)} aria-label="Close">×</button><h2 id="contact-title">Contact the repair shop</h2><p>When you contact the shop, share this order number so staff can quickly find your repair.</p><div className="contact-order"><strong>{repair.number}</strong><button className="button button-outline" onClick={copyOrder}>Copy order number</button></div>{copied && <p role="status" className="save-success">{copied}</p>}<p className="field-hint">This page does not send a message or make a call for you.</p></section></div>}
  </main>;
}
