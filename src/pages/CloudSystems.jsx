import { Link } from "react-router-dom";

export default function CloudSystems() {
  return (
    <section className="section">
      <div className="glass-box">
        <div className="service-icon">☁️</div>

        <h1>Cloud Systems
            <img
  src="/images/services/cloud-systems.png"
  alt="Cloud Systems"
  className="service-image"
/>
        </h1>

        <p>
          Secure cloud storage, hosting, backups, and scalable business systems
          for modern companies.
        </p>

        <h2>What You Get</h2>
        <ul className="features-list">
          <li>✔ Cloud storage setup</li>
          <li>✔ Website and app hosting</li>
          <li>✔ Business backups</li>
          <li>✔ Remote access systems</li>
          <li>✔ Cloud migration support</li>
        </ul>

        <h2>Pricing</h2>
        <p><strong>Cloud Setup:</strong> From R1,500</p>
        <p><strong>Website Hosting Setup:</strong> From R950</p>
        <p><strong>Business Cloud System:</strong> From R3,500</p>

        <div style={{ marginTop: "20px" }}>
          <Link to="/#quote" className="btn primary">
            Request Cloud Quote
          </Link>
        </div>
      </div>
    </section>
  );
}