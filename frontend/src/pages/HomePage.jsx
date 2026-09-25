import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import RepairQueuePreview from "../components/RepairQueuePreview";
import "./HomePage.css";

function HeroIcon({ name, ...props }) {
  const paths = {
    wrench: <path d="m14 6 4 4m-3-7a6 6 0 0 0-7 8L3 17a2.8 2.8 0 0 0 4 4l6-6a6 6 0 0 0 8-7l-4 4-5-5 3-4Z" />,
    arrow: <><path d="M4 12h15m-5-5 5 5-5 5" /></>,
    play: <><circle cx="12" cy="12" r="10" fill="currentColor" stroke="none" /><path d="m10 8 6 4-6 4Z" fill="white" stroke="none" /></>,
    people: <><circle cx="12" cy="6" r="3" /><circle cx="4" cy="10" r="2.5" /><circle cx="20" cy="10" r="2.5" /><path d="M7 22v-6a5 5 0 0 1 10 0v6H7Zm-1-8a4 4 0 0 0-5 4v4h4m13-8a4 4 0 0 1 5 4v4h-4" /></>,
    link: <><path d="m10 7 3-3a5 5 0 0 1 7 7l-3 3m-3 3-3 3a5 5 0 0 1-7-7l3-3m1 6 8-8" /></>,
    shield: <><path d="m12 2 8 3v6c0 5-4 9-8 11-4-2-8-6-8-11V5l8-3Z" /><path d="m8 12 3 3 5-6" /></>,
    shop: <><path d="M4 10v11h16V10M3 9l2-6h14l2 6M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0H3Zm6 12v-6h6v6M6 1h12" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 22v-3a8 8 0 0 1 16 0v3" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}

const benefits = [
  { icon: "people", title: "Role-based workflows", text: "Built for managers, front desk, technicians, and customers." },
  { icon: "link", title: "Private customer tracking", text: "Keep customers informed with secure, private links." },
  { icon: "shield", title: "Secure & private", text: "Session-based authentication and hashed tracking tokens." },
  { icon: "shop", title: "Shop-scoped data", text: "Your data, your shop. Records stay separate." },
];

const information = {
  Features: [
    ["Receive a device", "Record the customer, device, and reported problem in a work order."],
    ["Organize the repair", "Assign a technician, search the queue, and update the repair status."],
    ["Keep everyone informed", "Save internal repair notes and share a private customer tracking link."],
  ],
  Roles: [
    ["Shop manager", "Set up the shop, invite staff, assign repairs, and manage shop contact details."],
    ["Front desk", "Create work orders and find the latest repair status to answer customer inquiries."],
    ["Technician", "Work on assigned repairs, save internal notes, and update progress."],
    ["Customer", "Open a private tracking link to check one repair and contact the shop."],
  ],
  Security: [
    ["Private staff sessions", "Passwords are hashed with scrypt. Staff access requires an authenticated server-side session."],
    ["Separate shop records", "The API checks shop membership and role before allowing access to repair records."],
    ["Expiring tracking links", "Customer links expire after 30 days. Replacing a link disables the previous one. Only token hashes are stored."],
  ],
};

export default function HomePage() {
  const [panel, setPanel] = useState(null);
  const dialog = useRef(null);
  const menu = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (panel && !dialog.current.open) dialog.current.showModal();
    if (!panel && dialog.current.open) dialog.current.close();
  }, [panel]);

  function openPanel(name) {
    if (menu.current) menu.current.open = false;
    setPanel(name);
  }

  return (
    <div className="hp" id="top">
      <a className="skip-link" href="#main">Skip to content</a>
      <main id="main">
        <section className="hp-hero" aria-labelledby="hp-title">
          <img className="hp-scene" src="/images/landing-top-workshop.png" alt="Illustrative repair queue on a laptop and private repair tracking on a phone, on a sunlit workshop bench." width="1880" height="836" fetchPriority="high" />
          <header className="hp-header">
            <Link className="hp-brand" to="/" aria-label="Repair Shop Manager V2 home">
              <span className="hp-brand-icon"><HeroIcon name="wrench" /></span>
              <span>Repair Shop Manager <b>V2</b></span>
            </Link>
            <nav className="hp-nav" aria-label="Main navigation">
              {["Features", "Roles", "Security", "Demo"].map((name) => <button key={name} onClick={() => openPanel(name)}>{name}</button>)}
            </nav>
            <div className="hp-account">
              <Link className="hp-signin" to="/sign-in">Sign in</Link>
              <Link className="hp-start hp-start-small" to="/create-account">Start free <HeroIcon name="arrow" /></Link>
            </div>
            <details className="hp-mobile-menu" ref={menu}>
              <summary aria-label="Open navigation"><HeroIcon name="menu" /></summary>
              <nav aria-label="Mobile navigation">{["Features", "Roles", "Security", "Demo"].map((name) => <button key={name} onClick={() => openPanel(name)}>{name}</button>)}</nav>
            </details>
          </header>
          <div className="hp-copy">
            <p className="hp-eyebrow">Built for independent repair shops</p>
            <h1 id="hp-title"><span>Manage every repair</span><span>from <em>drop-off to done.</em></span></h1>
            <p className="hp-description">A clear, all-in-one repair workflow for phones,<br className="hp-desktop-break" /> laptops, game consoles, and more. Keep your shop organized,<br className="hp-desktop-break" /> your customers informed, and your team working together.</p>
            <div className="hp-actions">
              <Link className="hp-start" to="/create-account">Start free <HeroIcon name="arrow" /></Link>
              <button className="hp-demo" onClick={() => openPanel("Demo")}><HeroIcon name="play" /> Explore demo</button>
            </div>
            <div className="hp-team">
              <div className="hp-role-icons" aria-hidden="true">{["shop", "user", "wrench", "user"].map((name, i) => <span key={i}><HeroIcon name={name} /></span>)}</div>
              <div><strong><HeroIcon name="check" /> One workspace. Four connected roles.</strong><p>Built for the people behind every repair.</p></div>
            </div>
          </div>
        </section>
        <section className="hp-benefits" aria-label="Why Repair Shop Manager">
          {benefits.map(({ icon, title, text }) => <article key={title}><span className={`hp-benefit-icon hp-benefit-${icon}`}><HeroIcon name={icon} /></span><div><h2>{title}</h2><p>{text}</p></div></article>)}
        </section>
      </main>
      <dialog className="hp-dialog" ref={dialog} onCancel={() => setPanel(null)} onClose={() => setPanel(null)} aria-labelledby="hp-dialog-title">
        <div className="hp-dialog-header"><div><p className="hp-eyebrow">Repair Shop Manager</p><h2 id="hp-dialog-title">{panel === "Demo" ? "Explore the sample workspace" : panel}</h2></div><button onClick={() => setPanel(null)} aria-label="Close"><HeroIcon name="close" /></button></div>
        {panel === "Demo" ? <><p className="hp-dialog-intro">Try searching these fictional orders. This sample does not save any data.</p><RepairQueuePreview onNewOrder={() => { setPanel(null); navigate("/create-account"); }} /></> : <div className="hp-info">{information[panel]?.map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div>}
      </dialog>
    </div>
  );
}
