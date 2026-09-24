import { Link } from "react-router";

const orders = [
  ["WO-1043", "Maya Chen", "iPhone 14 Pro", "In Progress"],
  ["WO-1042", "Daniel Brooks", "MacBook Air", "Pending"],
  ["WO-1039", "Sofia Martinez", "iPad Air", "Completed"],
];

const features = [
  ["✦", "Create and manage work orders", "Capture the customer, device, and reported problem in one clear intake flow.", "form"],
  ["⌘", "Assign technicians and track progress", "Keep repair ownership clear and see the current status from one queue.", "assignment"],
  ["▤", "Internal repair notes", "Technicians save repair context without exposing it to customers.", "notes"],
  ["↗", "Secure customer tracking links", "Share a private, expiring link so customers can check their repair.", "tracking"],
  ["⚙", "Public shop settings", "Choose the shop name, phone, and email customers can use.", "settings"],
  ["⌂", "Shop-scoped records", "Every work order and staff role stays isolated to the right shop.", "isolation"],
];

function CTA({ to = "/create-account", children, dark = false }) {
  return (
    <Link className={`button ${dark ? "button-dark" : "button-primary"}`} to={to}>
      {children} <span aria-hidden="true">→</span>
    </Link>
  );
}

function Status({ children }) {
  return <span className={`landing-status ${children.toLowerCase().replace(" ", "-")}`}>{children}</span>;
}

function WorkspacePreview({ compact = false }) {
  return (
    <div className={`landing-workspace ${compact ? "compact" : ""}`}>
      <aside>
        <b>⌕ Repair Shop Manager</b>
        <strong>▦ &nbsp; Dashboard</strong>
        <span>☷ &nbsp; Work orders</span>
        <span>◉ &nbsp; Technicians</span>
        <span>⚙ &nbsp; Shop settings</span>
      </aside>
      <div className="landing-workspace-main">
        <div className="landing-search">⌕ &nbsp; Search customers, devices, or work orders… <b>JP</b></div>
        <div className="landing-workspace-title"><h3>Work Orders</h3><button>+ New work order</button></div>
        <div className="landing-tabs">All (3) <span>Pending (1)</span><span>In Progress (1)</span><span>Completed (1)</span></div>
        <div className="landing-order-list">
          {orders.map(([number, customer, device, status]) => <div key={number}><b>{number}</b><span>{customer}</span><span>{device}</span><i>●</i><Status>{status}</Status></div>)}
        </div>
      </div>
    </div>
  );
}

function PhonePreview() {
  return (
    <div className="landing-phone">
      <i className="landing-speaker" />
      <small>Repair Shop Manager</small><h3>Track your repair</h3>
      <p>Use your private tracking link to view repair progress.</p>
      <div>WO-1043</div><button>View repair</button>
      <ol><li><i /> <b>Received</b><span>Sep 12, 10:45 AM</span></li><li><i /> <b>In Progress</b><span>Screen replacement started</span></li><li><i /> <b>Completed</b><span>Your repair is complete</span></li></ol>
    </div>
  );
}

function FeatureVisual({ kind }) {
  if (kind === "form") return <div className="landing-form"><b>New work order</b><label>Customer <span>Maya Chen</span></label><label>Device <span>iPhone 14 Pro</span></label><label>Reported problem <span>Cracked screen</span></label><button>Create work order</button></div>;
  if (kind === "assignment") return <div className="landing-assignment"><div><i>MC</i><p><b>Maya Chen</b><span>Screen replacement</span></p><Status>In Progress</Status></div><div><i>SB</i><p><b>Sam Brooks</b><span>Charging port</span></p><Status>Pending</Status></div></div>;
  if (kind === "notes") return <div className="landing-notes"><b>Notes <span>3</span></b><em>Activity</em><p>Screen heavily cracked. Customer approved replacement.</p><small>Alex · Just now</small></div>;
  if (kind === "tracking") return <div className="landing-track"><small>yourshop.com/track/WO-1043</small><div><i /><i /><i /><i /></div><span>Received</span><span>In Progress</span><span>Completed</span></div>;
  if (kind === "settings") return <div className="landing-settings"><p>Northside Repairs <b>Public name</b></p><p>555-0100 <b>Public phone</b></p><p>hello@northside.example <b>Public email</b></p></div>;
  return <div className="landing-isolation"><b>Shop A</b><span>Work orders · staff · customers</span><hr /><b>Shop B</b><span>Separate and protected</span></div>;
}

function HomePage() {
  return (
    <div className="landing-page" id="top">
      <a className="skip-link" href="#main">Skip to content</a>
      <section className="landing-hero">
        <img className="landing-hero-photo" src="/images/repair-shop-hero.png" alt="Technician repairing a smartphone at a workshop bench." fetchPriority="high" />
        <header className="landing-header">
          <Link className="landing-brand" to="/"><span>⌕</span> Repair Shop Manager <b>V2</b></Link>
          <nav aria-label="Main navigation"><a href="#features">Features</a><a href="#roles">Roles</a><a href="#security">Security</a><a href="#demo">Demo</a></nav>
          <div><Link className="landing-sign-in" to="/sign-in">Sign in</Link><CTA>Create your shop</CTA></div>
        </header>
        <main id="main" className="landing-hero-content">
          <div className="landing-hero-copy"><p>Built for independent repair shops</p><h1>Manage every repair from <em>drop-off to done.</em></h1><h2>A clear repair workflow for phones, laptops, tablets, and consoles. Keep your shop organized and your customers informed.</h2><div><CTA>Create your shop</CTA><a className="landing-watch" href="#demo">● &nbsp; See how it works</a></div><small><b>★★★★★</b> Built for the people behind every repair.</small></div>
          <div className="landing-hero-product"><WorkspacePreview /><PhonePreview /></div>
        </main>
      </section>
      <section className="landing-value-strip">{[["♧","Role-based workflows","Built for managers, front desk, technicians, and customers."],["↗","Private customer tracking","Keep customers informed with secure, expiring links."],["♜","Secure and private","Session-based authentication and hashed tracking tokens."],["⌂","Shop-scoped data","Your data stays in your shop, fully isolated and secure."]].map(([icon,title,text]) => <div key={title}><i>{icon}</i><p><b>{title}</b><span>{text}</span></p></div>)}</section>
      <section className="landing-section landing-features" id="features"><div className="landing-section-heading"><div><p>Powerful features</p><h2>Everything you need to run a modern repair shop.</h2></div><span>From intake to completion, Repair Shop Manager gives you the tools to stay organized, work faster, and deliver a better customer experience.</span></div><div className="landing-feature-grid">{features.map(([icon,title,text,kind]) => <article key={title}><div><i>{icon}</i><h3>{title}</h3><p>{text}</p></div><FeatureVisual kind={kind} /></article>)}</div></section>
      <section className="landing-roles" id="roles"><div className="landing-section"><div className="landing-section-heading"><div><p>Built for every role</p><h2>A better workflow for everyone in your shop.</h2></div><span>Different roles. One connected workflow. Everyone has the tools they need to do their best work.</span></div><div className="landing-role-grid">{[["♛","Manager",["Oversee shop activity","Assign technicians","Manage shop settings"]],["▣","Front desk",["Create work orders","Find repair updates","Handle device drop-off"]],["⌁","Technician",["View assigned repairs","Save internal notes","Complete repair work"]],["●","Customer",["Track one repair","See safe status updates","Contact the shop"]]].map(([icon,title,points]) => <article key={title}><i>{icon}</i><h3>{title}</h3><ul>{points.map((point) => <li key={point}>✓ {point}</li>)}</ul></article>)}</div></div></section>
      <section className="landing-section landing-security" id="security"><div className="landing-security-copy"><p>Serious about security</p><h2>Your data stays in your hands.</h2><span>We built the app so shop operations and customer information remain protected and isolated.</span></div><div className="landing-security-grid">{[["▣","Secure sessions","Server-side sessions with secure cookie handling."],["◌","Scrypt password hashing","Passwords are securely hashed before storage."],["◉","Hashed tracking tokens","Customer tracking secrets are never stored as plain text."],["♜","Shop isolation","Work orders and customer data stay inside the right shop."]].map(([icon,title,text]) => <article key={title}><i>{icon}</i><div><b>{title}</b><span>{text}</span></div></article>)}</div></section>
      <section className="landing-section landing-demo" id="demo"><div className="landing-demo-copy"><p>See it in action</p><h2>A closer look at the experience.</h2><span>Designed for real repair shops and everyday work.</span><a className="button button-primary" href="#top">Back to top <b>↑</b></a></div><div className="landing-demo-cards"><article><small>Customer tracking page</small><h3>Track your repair</h3><PhonePreview /></article><article><small>Technician workspace</small><h3>Assigned repair details</h3><WorkspacePreview compact /></article></div></section>
      <footer className="landing-footer"><img src="/images/repair-shop-hero.png" alt="" /><div><p>Ready to streamline your repair shop?</p><h2>Get started with Repair Shop Manager V2.</h2><span>Set up your shop and keep repairs moving with confidence.</span></div><div><CTA>Create your shop</CTA><Link to="/sign-in">Already have an account? Sign in</Link></div></footer>
    </div>
  );
}
export default HomePage;
