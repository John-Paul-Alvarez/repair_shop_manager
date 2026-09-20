import { useState } from "react";
import { useNavigate } from "react-router";
import SiteHeader from "../components/SiteHeader";
import RepairQueuePreview from "../components/RepairQueuePreview";
import WorkflowSection from "../components/WorkflowSection";
import FeatureNotice from "../components/FeatureNotice";
import Icon from "../components/Icon";
function HomePage() {
  const [notice, updateNotice] = useState(null);
  const navigate = useNavigate();
  const setNotice = (kind) => {
    if (kind === "create-shop") navigate("/create-account");
    else if (kind === "sign-in") navigate("/sign-in");
    else updateNotice(kind);
  };
  return (
    <div id="top" className="min-h-screen flex flex-col">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader onAction={setNotice} />
      <main id="main" className="grow">
        <section
          className="page-container hero-section"
          aria-labelledby="hero-heading"
        >
          <div className="workbench-frame">
            <div className="hero-banner">
              <img
                className="hero-photo"
                src="/images/repair-workbench.jpg"
                alt="Technician repairing a laptop on an orange work mat with neatly arranged precision tools."
                fetchPriority="high"
                width="1536"
                height="1024"
              />
              <div className="hero-shade" aria-hidden="true" />
              <div className="hero-copy">
                <p className="eyebrow hero-eyebrow">Repair shop management</p>
                <h1 id="hero-heading">
                  Less chasing updates.
                  <br />
                  More repairs moving.
                </h1>
                <p className="hero-description">
                  Keep your work orders, technicians, and repair progress
                  together.
                </p>
                <div className="hero-actions">
                  <button
                    className="button button-primary"
                    onClick={() => setNotice("create-shop")}
                  >
                    Create your shop
                  </button>
                  <a className="hero-link" href="#workspace">
                    See the workspace{" "}
                    <Icon name="arrow-right" className="light-icon" />
                  </a>
                </div>
              </div>
            </div>
            <RepairQueuePreview onNewOrder={() => setNotice("new-order")} />
          </div>
        </section>
        <WorkflowSection />
        <section
          className="page-container closing-section"
          aria-labelledby="closing-heading"
        >
          <div className="closing-banner">
            <h2 id="closing-heading">
              Ready for a more organized repair queue?
            </h2>
            <div className="closing-actions">
              <button
                className="button button-primary"
                onClick={() => setNotice("create-shop")}
              >
                Create your shop
              </button>
              <button
                className="text-button closing-sign-in"
                onClick={() => setNotice("sign-in")}
              >
                Already have an account? Sign in
              </button>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="page-container footer-content">
          <div className="footer-brand">
            <strong>Repair Shop Manager</strong>
            <span className="footer-dot" aria-hidden="true">
              ·
            </span>
            <span>Built for the people behind every repair.</span>
          </div>
          <button className="text-button" onClick={() => setNotice("sign-in")}>
            Sign in
          </button>
        </div>
      </footer>
      <FeatureNotice kind={notice} onClose={() => setNotice(null)} />
    </div>
  );
}
export { HomePage as default };
