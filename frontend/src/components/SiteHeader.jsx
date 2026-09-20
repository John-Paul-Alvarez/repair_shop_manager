import Icon from "./Icon";
function SiteHeader({ onAction }) {
  return (
    <header className="page-container pt-6">
      <nav className="site-nav" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="Repair Shop Manager home">
          <span className="brand-mark">
            <Icon name="wrench" />
          </span>
          <span>Repair Shop Manager</span>
        </a>
        <div className="nav-sections">
          <a href="#workspace">The workspace</a>
          <a href="#how-it-works">How it works</a>
        </div>
        <div className="nav-actions">
          <button className="text-button" onClick={() => onAction("sign-in")}>
            Sign in
          </button>
          <button
            className="button button-primary nav-create"
            onClick={() => onAction("create-shop")}
          >
            Create your shop
          </button>
        </div>
      </nav>
    </header>
  );
}
export { SiteHeader as default };
