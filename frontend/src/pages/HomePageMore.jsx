import { Link } from "react-router";
import "./HomePageMore.css";

function Icon({ name }) {
  const shapes = {
    crown: <><path d="m3 7 5 4 4-7 4 7 5-4-2 12H5L3 7Zm2 15h14" /><circle cx="3" cy="5" r="1" /><circle cx="12" cy="2" r="1" /><circle cx="21" cy="5" r="1" /></>,
    user: <><circle cx="12" cy="7" r="4" fill="currentColor" stroke="none" /><path d="M3 22v-3a9 9 0 0 1 18 0v3" fill="currentColor" stroke="none" /></>,
    wrench: <path d="m15 2-3 4 5 5 4-3a6 6 0 0 1-8 7l-6 6a3 3 0 0 1-4-4l6-6a6 6 0 0 1 6-9Z" />,
    people: <><circle cx="8" cy="7" r="4" fill="currentColor" stroke="none" /><circle cx="18" cy="8" r="3" fill="currentColor" stroke="none" /><path d="M1 22v-4a7 7 0 0 1 14 0v4Zm15-9a6 6 0 0 1 7 6v3h-6v-4" fill="currentColor" stroke="none" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    arrow: <path d="M3 12h17m-6-6 6 6-6 6" />,
    lock: <><rect x="4" y="10" width="16" height="12" rx="2" /><path d="M7 10V6a5 5 0 0 1 10 0v4m-5 5v3" /></>,
    database: <><ellipse cx="12" cy="5" rx="9" ry="4" /><path d="M3 5v14c0 5 18 5 18 0V5M3 12c0 5 18 5 18 0" /></>,
    fingerprint: <><path d="M2 12a10 10 0 0 1 20 0M5 13a7 7 0 0 1 14 0c0 4 1 6 3 8M8 14a4 4 0 0 1 8 0c0 4 1 7 3 9M12 12c2 3-2 7 2 11M4 17l-2 5m5-6c0 3-1 5-2 7m5-4-1 4" /></>,
    shield: <><path d="m12 2 9 4v6c0 5-5 9-9 11-4-2-9-6-9-11V6l9-4Z" /><path d="m7 12 4 4 6-7" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name]}</svg>;
}

const roles = [
  { key: "manager", title: "Manager", icon: "crown", tasks: ["Oversee the repair queue", "Manage staff and shop settings", "Assign repairs to technicians"] },
  { key: "frontdesk", title: "Front Desk", icon: "user", tasks: ["Create and manage work orders", "Answer customer inquiries", "Share private tracking links"] },
  { key: "technician", title: "Technician", icon: "wrench", tasks: ["View assigned repairs", "Update status and add notes", "Mark repairs completed"] },
  { key: "customer", title: "Customer", icon: "people", tasks: ["Check their own repair status", "No account required", "Contact the repair shop"] },
];

const security = [
  { icon: "lock", title: "Secure sessions", text: "Server-side staff sessions with HttpOnly cookie protection." },
  { icon: "database", title: "Scrypt password hashing", text: "Staff passwords are hashed using scrypt for protection." },
  { icon: "fingerprint", title: "Hashed tracking tokens", text: "Private, expiring repair links. Only token hashes are stored." },
  { icon: "shield", title: "Shop isolation", text: "The API checks shop membership and access to each repair." },
];

function MiniQueue() {
  return <div className="hm-mini-queue" aria-hidden="true">
    <div className="hm-mini-brand"><span>↗</span> Repair Shop Manager <small>Work orders</small></div>
    <div className="hm-mini-filters">All orders <span>Pending</span><span>In Progress</span><span>Completed</span></div>
    <div className="hm-queue-row hm-queue-head"><span>Order</span><span>Customer</span><span>Device</span><span>Status</span></div>
    {[["1043", "Maya Chen", "iPhone 14 Pro", "In Progress"], ["1042", "Daniel Brooks", "MacBook Air", "Pending"], ["1041", "Jordan Lee", "Galaxy S23", "Completed"]].map(([id, name, device, status]) => <div className="hm-queue-row" key={id}><span>WO-{id}</span><span>{name}</span><span>{device}</span><span className={`hm-pill hm-pill-${status.replace(" ", "").toLowerCase()}`}>{status}</span></div>)}
  </div>;
}

function TrackingPreview({ phone = false }) {
  return <div className={phone ? "hm-phone" : "hm-tracking-screen"} aria-hidden="true">
    {phone && <span className="hm-phone-notch" />}
    <div className="hm-preview-brand"><span><Icon name="wrench" /></span> Joe’s Repairs</div>
    <strong className="hm-track-title">Your repair update</strong>
    <span className="hm-track-order">Order WO-1043</span>
    <span className="hm-completed"><Icon name="check" /></span>
    <strong className="hm-track-status">Completed</strong>
    <p>Repair work is complete.<br />Contact the shop about next steps.</p>
    <span className="hm-static-action">Contact the shop</span>
  </div>;
}

function TechnicianPreview() {
  return <div className="hm-technician-screen" aria-hidden="true">
    <div className="hm-preview-brand"><span><Icon name="wrench" /></span> Repair Shop Manager <small>My repairs</small></div>
    <div className="hm-technician-body">
      <span className="hm-back">← Back to my repairs</span>
      <div className="hm-repair-title"><strong>WO-1043 · iPhone 14 Pro</strong><span className="hm-pill hm-pill-inprogress">In Progress</span></div>
      <p className="hm-issue-title">Screen replacement</p>
      <div className="hm-repair-columns"><div><small>Reported problem</small><p>Cracked screen after a drop.</p><small>Assigned technician</small><strong>Mike Chen</strong></div><img src="/images/landing-technician.png" alt="" loading="lazy" width="1536" height="1024" /></div>
      <div className="hm-repair-note"><strong>Internal repair notes</strong><p>Replacement screen fitted. Checking touch response.</p></div>
    </div>
  </div>;
}

export default function HomePageMore({ onExploreDemo }) {
  return <div className="hp-more">
    <section className="hm-roles" id="roles" aria-labelledby="hm-roles-title">
      <header className="hm-roles-heading"><div><p className="hm-eyebrow">Built for every role</p><h2 id="hm-roles-title">A better workflow<br />for everyone in your shop.</h2></div><p>Different roles. A connected workflow. Everyone has the tools they need to do their best work.</p></header>
      <div className="hm-role-grid">
        {roles.map(({ key, title, icon, tasks }) => <article className={`hm-role-card hm-role-${key}`} key={key}>
          <div className="hm-role-copy"><span className="hm-role-icon"><Icon name={icon} /></span><div><h3>{title}</h3><ul>{tasks.map(task => <li key={task}><Icon name="check" />{task}</li>)}</ul></div></div>
          <div className="hm-role-visual" aria-hidden="true">
            {key === "manager" && <div className="hm-manager-scene" />}
            {key === "frontdesk" && <MiniQueue />}
            {key === "technician" && <img src="/images/landing-technician.png" alt="" width="1536" height="1024" loading="lazy" />}
            {key === "customer" && <TrackingPreview phone />}
          </div>
          {key !== "customer" && <span className="hm-role-connector"><Icon name="arrow" /></span>}
        </article>)}
      </div>
    </section>

    <section className="hm-security" id="security" aria-labelledby="hm-security-title">
      <div className="hm-section-intro"><p className="hm-eyebrow">Serious about security</p><h2 id="hm-security-title">Your shop’s data.<br />Protected by design.</h2><p>Access controls help keep your shop’s repair records and customer information private.</p></div>
      <div className="hm-security-grid">{security.map(({ icon, title, text }) => <article className="hm-security-tile" key={title}><Icon name={icon} /><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
    </section>

    <section className="hm-experience" id="demo" aria-labelledby="hm-experience-title">
      <div className="hm-section-intro"><p className="hm-eyebrow">See it in action</p><h2 id="hm-experience-title">A closer look at the experience.</h2><p>One clear view for each part of the repair.</p><button className="hm-button hm-button-orange" onClick={onExploreDemo}>Explore sample <Icon name="arrow" /></button></div>
      <figure className="hm-experience-card"><figcaption><h3>Customer Tracking Page</h3><p>A private link to check a repair and contact the shop.</p></figcaption><div className="hm-tracking-scene"><TrackingPreview /></div></figure>
      <figure className="hm-experience-card"><figcaption><h3>Technician Workspace</h3><p>Assigned repairs, status updates, and internal notes.</p></figcaption><TechnicianPreview /></figure>
      <p className="hm-sample-caption">Illustrative previews with sample data.</p>
    </section>

    <section className="hm-final" aria-labelledby="hm-final-title">
      <div className="hm-final-copy"><p className="hm-eyebrow">Ready to organize your repair shop?</p><h2 id="hm-final-title">Get started with Repair Shop Manager V2.</h2><p>Bring your work orders, team, and customer updates<br />together in one shared workspace.</p></div>
      <div className="hm-final-actions"><div><Link className="hm-button hm-button-orange" to="/create-account">Start free <Icon name="arrow" /></Link><Link className="hm-button hm-button-light" to="/sign-in"><Icon name="lock" /> Sign in</Link></div><p>Create your shop · Invite your team · Get to work</p></div>
    </section>
  </div>;
}
