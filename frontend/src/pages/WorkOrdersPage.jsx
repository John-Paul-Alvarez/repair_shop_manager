import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { api, ApiError, useAuth } from "../auth/AuthContext";
import AppHeader from "../components/AppHeader";
import FeatureNotice from "../components/FeatureNotice";
function WorkOrdersPage() {
  const { account, setAccount } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [notice, setNotice] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setOrders((await api("/work-orders")).orders);
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
  }, [navigate, setAccount]);
  useEffect(() => {
    void load();
  }, [load]);
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
          <button
            className="button button-primary"
            onClick={() => setNotice(true)}
          >
            New work order <span aria-hidden="true">＋</span>
          </button>
        </div>
        <section
          className="workspace-queue"
          aria-label="Your shop’s work orders"
          aria-busy={loading}
        >
          <div className="workspace-table-head" aria-hidden="true">
            <span>Order</span>
            <span>Customer</span>
            <span>Device &amp; issue</span>
            <span>Technician</span>
            <span>Status</span>
          </div>
          <div className="workspace-empty">
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
              <>
                <h2>Your saved orders</h2>
                <ul>
                  {orders.map((order) => (
                    <li key={order._id}>{order.number}</li>
                  ))}
                </ul>
                <p>Order details will be available with device intake.</p>
              </>
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
                <p className="field-hint">
                  Your shop is ready. Work order creation is coming in a later
                  update.
                </p>
              </>
            )}
          </div>
          {!loading && !error && (
            <div className="workspace-count">{orders.length} work orders</div>
          )}
        </section>
        <FeatureNotice
          kind={notice ? "workspace-order" : null}
          onClose={() => setNotice(false)}
        />
      </main>
    </>
  );
}
export { WorkOrdersPage as default };
