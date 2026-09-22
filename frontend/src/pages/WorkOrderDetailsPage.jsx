import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { api, ApiError, useAuth } from "../auth/AuthContext";
import AppHeader from "../components/AppHeader";
import StatusBadge from "../components/StatusBadge";

export default function WorkOrderDetailsPage() {
  const { orderId } = useParams();
  const { setAccount } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
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
  return <>
    <AppHeader />
    <main className="details-main page-container">
      {loading ? <div className="details-state" role="status">Loading work order…</div> : error ? <div className="details-state"><h1>Work order unavailable</h1><p role="alert">{error}</p><button className="button button-dark" onClick={() => void load()}>Try again</button><Link to="/work-orders">Back to work orders</Link></div> : <>
        <div className="details-heading"><div><Link className="back-link" to="/work-orders">← Work orders</Link><p className="eyebrow">{order.number}</p><h1>Repair received</h1><p>This work order is saved and ready for the shop.</p></div><StatusBadge status={order.status} /></div>
        <section className="details-card"><div className="details-row"><div><p className="details-label">Customer</p><h2>{order.customerName}</h2><p>{order.customerPhone}</p>{order.customerEmail && <p>{order.customerEmail}</p>}</div><div><p className="details-label">Assigned technician</p><h2>{order.technicianName || "Unassigned"}</h2><p>{order.technicianName ? "Assigned at intake" : "Assign a technician when ready."}</p></div></div><div className="details-divider" /><div className="details-row"><div><p className="details-label">Device and model</p><h2>{order.device}</h2></div><div><p className="details-label">Reported problem</p><p className="details-problem">{order.problem}</p></div></div></section>
        <div className="details-footer"><p><strong>{order.number}</strong> is currently Pending.</p><Link className="button button-primary" to="/work-orders">Back to work orders</Link></div>
      </>}
    </main>
  </>;
}
