import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { api, ApiError, useAuth } from "../auth/AuthContext";
import AppHeader from "../components/AppHeader";
import StatusBadge from "../components/StatusBadge";
function WorkOrdersPage() {
  const { account, setAccount } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [counts, setCounts] = useState({ All: 0, Pending: 0, "In Progress": 0, Completed: 0 });
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (status) params.set("status", status);
      const data = await api("/work-orders" + (params.size ? "?" + params : ""));
      setOrders(data.orders);
      setCounts(data.counts);
    } catch (error2) {
      if (error2 instanceof ApiError && error2.status === 401) {
        setAccount(null);
        navigate("/sign-in", { replace: true });
      } else
        setError(
          error2 instanceof Error
            ? error2.message
            : "Unable to load work orders.",
        );
    } finally {
      setLoading(false);
    }
  }, [navigate, query, setAccount, status]);
  useEffect(() => {
    void load();
  }, [load]);
  const setView = (nextQuery, nextStatus = status) => {
    const next = new URLSearchParams();
    if (nextQuery) next.set("q", nextQuery);
    if (nextStatus) next.set("status", nextStatus);
    setSearchParams(next, { replace: true });
  };
  const returnPath = new URLSearchParams(searchParams).toString();
  return (
    <>
      <AppHeader />
      <main className="workspace-main page-container">
        <div className="workspace-heading">
          <div>
            <p className="eyebrow">{account?.shop?.name}</p>
            <h1>Work orders</h1>
            <p>Every repair, clearly in view.</p>
          </div>
          <div className="workspace-actions">
            {account?.shop?.role === "manager" && (
              <Link className="button button-outline" to="/setup/invite">
                Invite staff
              </Link>
            )}
            <Link className="button button-primary" to="/work-orders/new">
              New work order <span aria-hidden="true">＋</span>
            </Link>
          </div>
        </div>
        <div className="queue-controls">
          <label className="workspace-search"><span className="sr-only">Search work orders</span><input type="search" value={query} onChange={(event) => setView(event.target.value)} placeholder="Search order, customer, or phone" /></label>
          {account?.shop?.role === "manager" && <div className="status-filters" aria-label="Filter by status">{["", "Pending", "In Progress", "Completed"].map((item) => <button key={item || "All"} className={status === item ? "active" : ""} onClick={() => setView(query, item)}>{item || "All"} <span>{counts[item || "All"]}</span></button>)}</div>}
        </div>
        <section
          className="workspace-queue"
          aria-label="Your shop’s work orders"
          aria-busy={loading}
        >
          {(loading || error || !orders.length) && (
            <div className="workspace-table-head" aria-hidden="true">
              <span>Order</span>
              <span>Customer</span>
              <span>Device &amp; issue</span>
              <span>Technician</span>
              <span>Status</span>
            </div>
          )}
          <div
            className={
              !loading && !error && orders.length
                ? "saved-queue"
                : "workspace-empty"
            }
          >
            {loading ? (
              <p role="status">Loading your repair queue…</p>
            ) : error ? (
              <>
                <h2>We couldn’t load your orders</h2>
                <p role="alert">{error}</p>
                <button
                  className="button button-dark"
                  onClick={() => void load()}
                >
                  Try again
                </button>
              </>
            ) : orders.length ? (
              <table className="repair-table">
                <caption className="sr-only">
                  Saved work orders for {account.shop.name}
                </caption>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Device &amp; issue</th>
                    <th>Technician</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td data-label="Order" className="order-id">
                        <Link to={"/work-orders/" + order._id + (returnPath ? "?" + returnPath : "")}>{order.number}</Link>
                      </td>
                      <td data-label="Customer" className="customer-name">
                        {order.customerName || "Not recorded"}
                      </td>
                      <td data-label="Device & issue">
                        {order.device || "Not recorded"}
                        {order.problem && (
                          <small className="order-problem">
                            {order.problem}
                          </small>
                        )}
                      </td>
                      <td data-label="Technician">
                        {order.technicianName || "Unassigned"}
                      </td>
                      <td data-label="Status">
                        {["Pending", "In Progress", "Completed"].includes(
                          order.status,
                        ) ? (
                          <StatusBadge status={order.status} />
                        ) : (
                          "Not recorded"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : query || status ? (
              <><h2>No matching work orders</h2><p>Try another customer, phone number, order number, or status.</p><button className="button button-outline" onClick={() => setView("", "")}>Clear search and filters</button></>
            ) : (
              <>
                <svg
                  className="empty-clipboard"
                  viewBox="0 0 64 72"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <path d="M22 10H12a5 5 0 0 0-5 5v48a5 5 0 0 0 5 5h40a5 5 0 0 0 5-5V15a5 5 0 0 0-5-5H42" />
                  <path
                    d="M26 8a6 6 0 0 1 12 0h5v12H21V8h5ZM20 34h24M20 45h24M20 56h16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <h2>No work orders yet</h2>
                <p>Create your first work order to start tracking repairs.</p>
                <Link className="button button-primary" to="/work-orders/new">Create work order</Link>
              </>
            )}
          </div>
          {!loading && !error && (
            <div className="workspace-count">{query || status ? `${orders.length} matching work orders · totals include all shop work orders` : `${counts.All} work orders`}</div>
          )}
        </section>
      </main>
    </>
  );
}
export { WorkOrdersPage as default };
