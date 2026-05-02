import { Link } from "react-router-dom";

export default function SoftwareEngineering() {
  return (
    <section className="section">
      <div className="glass-box">
        <div className="service-icon">💻</div>

        <h1>Software Engineering</h1>

        <p>
          We build modern websites, web applications, and full business systems
          tailored to your needs.
        </p>

        <h2>What You Get</h2>
        <ul className="features-list">
          <li>✔ Business Websites</li>
          <li>✔ Web Applications</li>
          <li>✔ Booking Systems</li>
          <li>✔ Admin Dashboards</li>
          <li>✔ Custom Software Solutions</li>
        </ul>

        <h2>Pricing</h2>
        <p><strong>Basic Website:</strong> From R2,500</p>
        <p><strong>Business Website:</strong> From R5,000</p>
        <p><strong>Web App/System:</strong> From R10,000</p>

        <div style={{ marginTop: "20px" }}>
          <Link to="/#quote" className="btn primary">
            Request Software Quote
          </Link>
        </div>
      </div>
    </section>
  );
}