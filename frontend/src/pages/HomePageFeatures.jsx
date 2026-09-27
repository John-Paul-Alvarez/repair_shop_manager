import "./HomePageFeatures.css";

function FeatureIcon({ name }) {
  const paths = {
    tools: <><path d="m4 3 4 4-2 2-4-4a5 5 0 0 0 6 7l8 9a2 2 0 0 0 3-3l-9-8a5 5 0 0 0-6-7Z" /><path d="m14 7 4-4 3 3-4 4M7 15l-5 5 2 2 5-5" /></>,
    team: <><circle cx="8" cy="6" r="3" /><circle cx="18" cy="8" r="2.5" /><path d="M2 20v-4a6 6 0 0 1 12 0v4H2Zm13-7a5 5 0 0 1 7 5v2h-5" /></>,
    notes: <path d="M21 11a9 8 0 0 1-9 8H8l-5 3 1-7a8 8 0 0 1-1-4 9 8 0 0 1 18 0Z" />,
    link: <><path d="m10 7 3-3a5 5 0 0 1 7 7l-3 3m-3 3-3 3a5 5 0 0 1-7-7l3-3m1 6 8-8" /></>,
    settings: <><path d="m9 3 1-2h4l1 2 3 2 3 1v4l-2 2 2 2v4l-3 1-3 2-1 2h-4l-1-2-3-2-3-1v-4l2-2-2-2V6l3-1 3-2Z" /><circle cx="12" cy="12" r="4" /></>,
    invite: <><rect x="2" y="5" width="20" height="15" rx="3" /><path d="m3 7 9 6 9-6M9 2h6" /></>,
    edit: <><path d="m15 3 6 6-11 11-7 1 1-7L15 3Zm-9 12 4 4M13 5l6 6" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v2" /></>,
    check: <path d="m6 12 4 4 8-9" />,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function CardHeading({ icon, title, children }) {
  return <div className="hf-card-heading"><span className="hf-icon"><FeatureIcon name={icon} /></span><div><h3>{title}</h3><p>{children}</p></div></div>;
}

function Avatar({ initials, tone = "clay" }) {
  return <span className={`hf-avatar hf-avatar-${tone}`}>{initials}</span>;
}

export default function HomePageFeatures() {
  return (
    <section className="hp-features" id="features" aria-labelledby="hf-title">
      <div className="hf-inner">
        <header className="hf-heading">
          <div><p className="hf-eyebrow">Powerful features</p><h2 id="hf-title">Everything you need to run a modern repair shop.</h2></div>
          <p>From intake to completion, Repair Shop Manager V2 keeps your work orders, team, and customer updates together.</p>
        </header>

        <div className="hf-top-row">
          <article className="hf-card hf-intake">
            <img src="/images/landing-feature-intake.png" alt="" width="1774" height="887" loading="lazy" />
            <CardHeading icon="tools" title={<>Create &amp; manage<br />work orders</>}>Quickly capture the customer, device, and problem. Keep every repair in one place.</CardHeading>
            <div className="hf-intake-form" aria-hidden="true">
              <strong>New work order</strong>
              <span className="hf-field-label">Customer</span><div className="hf-field"><Avatar initials="AC" /> Alex Carter</div>
              <span className="hf-field-label">Device</span><div className="hf-field">iPhone 14 Pro</div>
              <span className="hf-field-label">Reported problem</span><div className="hf-field">Cracked screen</div>
              <span className="hf-field-label">Technician</span><div className="hf-field">Unassigned <span>⌄</span></div>
              <span className="hf-form-action">Create work order</span>
            </div>
          </article>

          <article className="hf-card hf-assignment">
            <CardHeading icon="team" title={<>Assign technicians<br /> &amp; track progress</>}>Keep your team aligned with clear assignments and repair status updates.</CardHeading>
            <div className="hf-assignment-preview hf-preview" aria-hidden="true">
              <div className="hf-person-row"><Avatar initials="MC" /><div><strong>Mike Chen</strong><small>Screen replacement</small></div><span className="hf-badge hf-purple">In Progress</span></div>
              <div className="hf-person-row"><Avatar initials="SK" tone="sage" /><div><strong>Sarah Kim</strong><small>Diagnostics</small></div><span className="hf-badge hf-amber">Pending</span></div>
            </div>
          </article>

          <article className="hf-card hf-notes">
            <CardHeading icon="notes" title={<>Internal notes<br /> for every repair</>}>Keep repair details and technician updates together, visible only to your team.</CardHeading>
            <div className="hf-notes-preview hf-preview" aria-hidden="true">
              <div className="hf-notes-tabs"><strong>Repair notes <span>3</span></strong><span>Team only <FeatureIcon name="lock" /></span></div>
              <div className="hf-note"><span className="hf-note-sheet" /><p>Screen replaced. Touch response and display tested successfully.</p></div>
              <div className="hf-note-author"><Avatar initials="MC" /> Mike Chen · Just now</div>
            </div>
          </article>
        </div>

        <div className="hf-bottom-row">
          <article className="hf-card hf-tracking">
            <CardHeading icon="link" title="Customer tracking links">Give customers a private link to check their repair status anytime, without an account.</CardHeading>
            <div className="hf-tracking-preview hf-preview" aria-hidden="true">
              <div className="hf-browser-bar"><span className="hf-browser-dots">•••</span><div><FeatureIcon name="lock" /> Private repair link</div></div>
              <div className="hf-status-track">{["Received", "In Progress", "Completed"].map((label, i) => <div className={`hf-stage hf-stage-${i}`} key={label}><span><FeatureIcon name="check" /></span><strong>{label}</strong></div>)}</div>
            </div>
          </article>

          <article className="hf-card hf-settings">
            <CardHeading icon="settings" title="Shop settings & contact details">Make it easy to reach your shop. Add the name, phone, and email customers should see.</CardHeading>
            <div className="hf-settings-preview" aria-hidden="true">{[["Shop", "Joe’s Repairs"], ["Phone", "(202) 555-0142"], ["Email", "hello@example.com"]].map(([label, value]) => <div className="hf-setting-row" key={label}><div><span>{label}</span><strong>{value}</strong></div><FeatureIcon name="edit" /></div>)}</div>
          </article>

          <article className="hf-card hf-invitations">
            <CardHeading icon="invite" title="Bring your team together">Invite your front desk and technicians. Give each person the access they need.</CardHeading>
            <div className="hf-invite-preview" aria-hidden="true">{[["JD", "Joe Davis", "Manager", "clay"], ["AL", "Alex Lee", "Front desk", "sage"], ["MC", "Mike Chen", "Technician", "purple"]].map(([initials, name, role, tone]) => <div className="hf-invite-row" key={name}><Avatar initials={initials} tone={tone} /><strong>{name}</strong><span>{role}</span></div>)}</div>
          </article>
        </div>
        <p className="hf-preview-caption">Illustrative previews with sample data.</p>
      </div>
    </section>
  );
}
