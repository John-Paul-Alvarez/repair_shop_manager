const statusClasses = {
  Pending: "status-pending",
  "In Progress": "status-progress",
  Completed: "status-completed",
};
function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${statusClasses[status]}`}>
      <span className="status-dot" aria-hidden="true" />
      {status}
    </span>
  );
}
export { StatusBadge as default };
