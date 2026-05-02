import { Link } from "react-router-dom";

export default function ITSupport() {
  return (
    <section className="section">
      <div className="glass-box">
        <div className="service-icon">🛠️</div>

        <h1>IT Support</h1>

        <img
          src="/images/services/it-support.png"
          alt="IT Support"
          className="service-image"
        />

        <p>
          Professional on-site and remote IT support for homes and businesses.
          We help with troubleshooting, software setup, printer issues,
          networking, computer maintenance, and user support.
        </p>

        <h2>What You Get</h2>
        <ul className="features-list">
          <li>✔ Remote and on-site support</li>
          <li>✔ Printer and computer troubleshooting</li>
          <li>✔ Software installation</li>
          <li>✔ User support and maintenance</li>
          <li>✔ Business IT assistance</li>
        </ul>

        <h2>Pricing</h2>
        <p><strong>Remote Support:</strong> From R250</p>
        <p><strong>On-site Support:</strong> From R450</p>
        <p><strong>Business Support:</strong> From R850</p>

        <div className="service-actions">
          <a
            href="https://wa.me/27722864367?text=Hi MKETICS, I need IT Support"
            className="btn secondary"
          >
            Chat on WhatsApp
          </a>

<Link to="/#quote?service=IT Support" className="btn primary">
  Request IT Support Quote
</Link>
        </div>
      </div>
    </section>
  );
}