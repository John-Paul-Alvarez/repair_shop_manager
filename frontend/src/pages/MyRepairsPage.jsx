import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { api, ApiError, useAuth } from "../auth/AuthContext";
import AppHeader from "../components/AppHeader";
import StatusBadge from "../components/StatusBadge";

export default function MyRepairsPage() {
  const { account, setAccount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const status = params.get("status") ?? "";
  const [orders, setOrders] = useState([]);
  const [counts, setCounts] = useState({ All: 0, Pending: 0, "In Progress": 0, Completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const next = new URLSearchParams();
      if (query) next.set("q", query);
      if (status) next.set("status", status);
      const data = await api("/my-repairs" + (next.size ? "?" + next : ""));
      setOrders(data.orders); setCounts(data.counts);
    } catch (loadError) {
      if (loadError instanceof ApiError && loadError.status === 401) {
        setAccount(null); navigate("/sign-in", { replace: true });
      } else setError(loadError.message);
    } finally { setLoading(false); }
  }, [navigate, query, setAccount, status]);
  useEffect(() => { void load(); }, [load]);
  const setView = (nextQuery, nextStatus = status) => {
    const next = new URLSearchParams();
    if (nextQuery) next.set("q", nextQuery);
    if (nextStatus) next.set("status", nextStatus);
    setParams(next, { replace: true });
  };
  const backQuery = new URLSearchParams(params).toString();
  return <>
    <AppHeader />
    <main className="workspace-main page-container">
      <div className="workspace-heading">
        <div><p className="eyebrow">{account?.shop?.name}</p><h1>My assigned repairs</h1><p>Focus on the devices that need your attention.</p>{location.state?.message && <p className="save-success" role="status">{location.state.message}</p>}</div>
      </div>
      <div className="queue-controls">
        <label className="workspace-search"><span className="sr-only">Search my assigned repairs</span><input type="search" value={query} onChange={(event) => setView(event.target.value)} placeholder="Search order, device, or problem" /></label>
        <div className="status-filters" aria-label="Filter my repairs by status">{["", "Pending", "In Progress", "Completed"].map((item) => <button key={item || "All"} className={status === item ? "active" : ""} onClick={() => setView(query, item)}>{item || "All"} <span>{counts[item || "All"]}</span></button>)}</div>
      </div>
      <section className="workspace-queue" aria-label="My assigned repairs" aria-busy={loading}>
        {(loading || error || !orders.length) && <div className="workspace-table-head" aria-hidden="true"><span>Order</span><span>Device</span><span>Reported problem</span><span>Status</span></div>}
        <div className={!loading && !error && orders.length ? "saved-queue" : "workspace-empty"}>
          {loading ? <p role="status">Loading your assigned repairs…</p> : error ? <><h2>We couldn’t load your repairs</h2><p role="alert">{error}</p><button className="button button-dark" onClick={() => void load()}>Try again</button></> : orders.length ? <table className="repair-table technician-table"><caption className="sr-only">Repairs assigned to {account.user.name}</caption><thead><tr><th>Order</th><th>Device</th><th>Reported problem</th><th>Status</th></tr></thead><tbody>{orders.map((order) => <tr key={order._id}><td data-label="Order" className="order-id"><Link to={"/my-repairs/" + order._id + (backQuery ? "?" + backQuery : "")}>{order.number}</Link></td><td data-label="Device">{order.device}</td><td data-label="Reported problem"><span className="order-problem">{order.problem}</span></td><td data-label="Status"><StatusBadge status={order.status} /></td></tr>)}</tbody></table> : query || status ? <><h2>No matching assigned repairs</h2><p>Try another order, device, problem, or status.</p><button className="button button-outline" onClick={() => setView("", "")}>Clear search and filters</button></> : <><h2>No repairs assigned to you</h2><p>When your manager assigns a repair, it will appear here.</p></>}
        </div>
        {!loading && !error && <div className="workspace-count">{query || status ? `${orders.length} matching repairs · totals include all your assigned repairs` : `${counts.All} assigned repairs`}</div>}
      </section>
    </main>
  </>;
}
