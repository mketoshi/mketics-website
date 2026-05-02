import { Link } from "react-router-dom";

export default function WiFi() {
  return (
    <section className="section">
      <div className="glass-box">
        <div className="service-icon">📶</div>

        <h1>WiFi Installation
            <img
  src="/images/services/wifi.png"
  alt="WiFi Installation"
  className="service-image"
/>
        </h1>

        <p>
          Reliable high-speed WiFi installation for homes, offices, shops, and
          small businesses with coverage optimization.
        </p>

        <h2>What You Get</h2>
        <ul className="features-list">
          <li>✔ Home WiFi installation</li>
          <li>✔ Business WiFi setup</li>
          <li>✔ Router configuration</li>
          <li>✔ Coverage improvement</li>
          <li>✔ Access point installation</li>
        </ul>

        <h2>Pricing</h2>
        <p><strong>Home WiFi Setup:</strong> From R1,500</p>
        <p><strong>Business WiFi Setup:</strong> From R2,500</p>
        <p><strong>Access Point Setup:</strong> From R750</p>

        <div style={{ marginTop: "20px" }}>
          <Link to="/#quote" className="btn primary">
            Request WiFi Quote
          </Link>
        </div>
      </div>
    </section>
  );
}