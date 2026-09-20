import Icon from "./Icon";
const steps = [
  {
    icon: "smartphone",
    title: "Receive the device",
    description: "Record the customer, device, and problem.",
  },
  {
    icon: "technician",
    title: "Assign the repair",
    description: "Choose who will handle the work.",
  },
  {
    icon: "update",
    title: "Update the status",
    description: "Keep progress clear when customers ask.",
  },
];
function WorkflowSection() {
  return (
    <section
      className="page-container workflow-section"
      id="how-it-works"
      aria-labelledby="workflow-heading"
    >
      <div className="workflow-layout">
        <div>
          <p className="eyebrow text-burnt mb-3">From drop-off to done</p>
          <h2 id="workflow-heading">Keep the next step clear.</h2>
          <p className="workflow-description">
            Give the front desk and shop manager the same view of every repair.
          </p>
        </div>
        <ol className="workflow-steps">
          {steps.map((step, index) => (
            <li key={step.title}>
              <Icon name={step.icon} />
              <div>
                <h3>
                  0{index + 1} — {step.title}
                </h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
export { WorkflowSection as default };
