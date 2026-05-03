import { Link } from "react-router-dom";

export default function WiFi() {
  return (
    <section className="service-page">

      {/* HERO */}
      <div className="service-hero">
        <div className="service-icon">📶</div>
        <h1>WiFi Installation</h1>
        <p>
          Fast, reliable WiFi setup for homes and businesses.
          Get full coverage, stronger signal, and stable connectivity.
        </p>
      </div>

      {/* IMAGE */}
      <div className="service-image-wrapper">
        <img
          src="/images/services/wifi.png"
          alt="WiFi Installation"
        />
      </div>

      {/* CONTENT */}
      <div className="service-content">

        {/* FEATURES */}
        <div className="service-card">
          <h2>What You Get</h2>
          <ul className="features-list">
            <li>✔ Home WiFi installation</li>
            <li>✔ Business WiFi setup</li>
            <li>✔ Router configuration</li>
            <li>✔ Coverage optimization</li>
            <li>✔ Access point installation</li>
          </ul>
        </div>

        {/* PRICING */}
        <div className="service-card pricing-card">
          <h2>Pricing</h2>

          <div className="price-item">
            <span>Home Setup</span>
            <strong>From R1,500</strong>
          </div>

          <div className="price-item">
            <span>Business Setup</span>
            <strong>From R2,500</strong>
          </div>

          <div className="price-item">
            <span>Access Point</span>
            <strong>From R750</strong>
          </div>
        </div>

      </div>

      {/* CTA */}
      <div className="service-actions premium">
        <a
          href="https://wa.me/27722864367?text=Hi MKETICS, I need WiFi Installation"
          className="btn primary"
        >
          Chat on WhatsApp
        </a>

        <Link to="/#quote?service=WiFi Installation" className="btn secondary">
          Request Quote
        </Link>
      </div>

    </section>
  );
}