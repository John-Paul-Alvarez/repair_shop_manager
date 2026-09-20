import { useEffect, useRef } from "react";
const notices = {
  "create-shop": {
    title: "Shop setup is coming next",
    description:
      "Account creation and shop setup are not available yet. You can explore the sample repair queue on this homepage.",
  },
  "sign-in": {
    title: "Sign-in is coming next",
    description:
      "Staff sign-in is not available yet. This homepage currently shows a sample workspace.",
  },
  "new-order": {
    title: "You’re viewing a sample workspace",
    description:
      "These records are examples. Work order creation is coming in a later update; no customer information is collected here.",
  },
  "workspace-order": {
    title: "Work order creation is coming next",
    description:
      "Your account and shop are ready. Device intake and saved repair orders will be added in a later update.",
  },
};
function FeatureNotice({ kind, onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    if (kind && !dialog.current?.open) dialog.current?.showModal();
    if (!kind && dialog.current?.open) dialog.current.close();
  }, [kind]);
  const content = kind ? notices[kind] : null;
  return (
    <dialog
      ref={dialog}
      className="feature-notice"
      aria-labelledby="notice-title"
      aria-describedby="notice-description"
      onCancel={onClose}
      onClose={onClose}
    >
      {content && (
        <>
          <span className="eyebrow text-burnt">Repair Shop Manager</span>
          <h2 id="notice-title">{content.title}</h2>
          <p id="notice-description">{content.description}</p>
          <button autoFocus className="button button-primary" onClick={onClose}>
            {kind === "workspace-order"
              ? "Back to work orders"
              : "Back to homepage"}
          </button>
        </>
      )}
    </dialog>
  );
}
export { FeatureNotice as default };
