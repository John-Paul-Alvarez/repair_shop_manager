import { Link } from "react-router";
import "./HomePageMore.css";

function Icon({ name }) {
  const shapes = {
    arrow: <path d="M3 12h17m-6-6 6 6-6 6" />,
    lock: <><rect x="4" y="10" width="16" height="12" rx="2" /><path d="M7 10V6a5 5 0 0 1 10 0v4m-5 5v3" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name]}</svg>;
}

export default function HomePageMore() {
  return <div className="hp-more">
    <section className="hm-final" aria-labelledby="hm-final-title">
      <div className="hm-final-copy"><p className="hm-eyebrow">Ready to organize your repair shop?</p><h2 id="hm-final-title">Get started with Repair Shop Manager V2.</h2><p>Bring your work orders, team, and customer updates<br />together in one shared workspace.</p></div>
      <div className="hm-final-actions"><div><Link className="hm-button hm-button-orange" to="/create-account">Start free <Icon name="arrow" /></Link><Link className="hm-button hm-button-light" to="/sign-in"><Icon name="lock" /> Sign in</Link></div><p>Create your shop · Invite your team · Get to work</p></div>
    </section>
  </div>;
}
