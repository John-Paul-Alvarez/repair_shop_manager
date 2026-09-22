import { Brand } from "./AppHeader";

export default function AccountLayout({ children }) {
  return (
    <main className="account-layout">
      <section className="account-story" aria-label="Your repair workspace">
        <img
          src="/images/repair-workbench.jpg"
          alt="Laptop repair tools arranged on a workshop bench."
        />
        <div className="account-story-content">
          <Brand />
          <div>
            <p className="eyebrow">Built for the repair shop</p>
            <h2>
              Your repair
              <br />
              workspace.
            </h2>
            <p>
              Manage work orders.
              <br />
              Keep repairs moving.
            </p>
          </div>
          <small>Built for the people behind every repair.</small>
        </div>
      </section>
      <section className="account-form-area">
        <div className="mobile-brand">
          <Brand />
        </div>
        <div className="account-form-content">{children}</div>
      </section>
    </main>
  );
}
