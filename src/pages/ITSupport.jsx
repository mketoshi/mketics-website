import { Link } from "react-router-dom";

export default function ITSupport() {
  return (
    <section className="service-page">

      {/* HERO */}
      <div className="service-hero">
        <div className="service-icon">🛠️</div>
        <h1>IT Support</h1>
        <p>
          Fast, reliable IT support for homes and businesses.
          Fix issues quickly and keep your systems running smoothly.
        </p>
      </div>

      {/* IMAGE */}
      <div className="service-image-wrapper">
        <img
          src="/images/services/it-support.png"
          alt="IT Support"
        />
      </div>

      {/* CONTENT */}
      <div className="service-content">

        <div className="service-card">
          <h2>What You Get</h2>
          <ul className="features-list">
            <li>✔ Remote and on-site support</li>
            <li>✔ Printer and computer troubleshooting</li>
            <li>✔ Software installation</li>
            <li>✔ User support and maintenance</li>
            <li>✔ Business IT assistance</li>
          </ul>
        </div>

        <div className="service-card">
          <h2>Pricing</h2>
          <p><strong>Remote Support:</strong> From R250</p>
          <p><strong>On-site Support:</strong> From R450</p>
          <p><strong>Business Support:</strong> From R850</p>
        </div>

      </div>

      {/* CTA */}
      <div className="service-actions premium">
        <a
          href="https://wa.me/27722864367?text=Hi MKETICS, I need IT Support"
          className="btn primary"
        >
          Chat on WhatsApp
        </a>

        <Link to="/#quote?service=IT Support" className="btn secondary">
          Request Quote
        </Link>
      </div>

    </section>
  );
}