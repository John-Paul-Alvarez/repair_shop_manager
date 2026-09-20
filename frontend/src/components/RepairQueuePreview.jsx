import { useState } from "react";
import { sampleOrders } from "../data/sampleOrders";
import Icon from "./Icon";
import StatusBadge from "./StatusBadge";
function RepairQueuePreview({ onNewOrder }) {
  const [query, setQuery] = useState("");
  const search = query.trim().toLowerCase();
  const orders = sampleOrders.filter((order) =>
    [
      order.id,
      order.customer,
      order.device,
      order.technician,
      order.status,
    ].some((value) => value.toLowerCase().includes(search)),
  );
  return (
    <section
      className="queue-preview"
      id="workspace"
      aria-labelledby="queue-heading"
    >
      <div className="queue-toolbar">
        <div className="queue-title">
          <h2 id="queue-heading">Your repair queue</h2>
          <span className="sample-label">Sample workspace</span>
        </div>
        <div className="queue-controls">
          <div className="search-control">
            <Icon name="search" />
            <input
              type="search"
              aria-label="Search sample work orders"
              placeholder="Search order #, customer…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <button
            className="button button-dark queue-create"
            onClick={onNewOrder}
          >
            + New work order
          </button>
        </div>
      </div>
      <table className="repair-table">
        <caption className="sr-only">
          Illustrative repair orders. Search to filter the sample data.
        </caption>
        <thead>
          <tr>
            <th scope="col">Order</th>
            <th scope="col">Customer</th>
            <th scope="col">Device</th>
            <th scope="col">Technician</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td data-label="Order" className="order-id">
                {order.id}
              </td>
              <td data-label="Customer" className="customer-name">
                {order.customer}
              </td>
              <td data-label="Device">{order.device}</td>
              <td data-label="Technician">{order.technician}</td>
              <td data-label="Status">
                <StatusBadge status={order.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 && (
        <div className="empty-search">
          <p>No matching work orders.</p>
          <button
            className="text-button underline"
            onClick={() => setQuery("")}
          >
            Clear search
          </button>
        </div>
      )}
      <p className="queue-footnote" role="status" aria-live="polite">
        Showing {orders.length} of {sampleOrders.length} sample work orders{" "}
        <span aria-hidden="true">·</span> Illustrative shop view
      </p>
    </section>
  );
}
export { RepairQueuePreview as default };
