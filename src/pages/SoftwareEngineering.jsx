import { Link } from "react-router-dom";

export default function SoftwareEngineering() {
  return (
    <section className="section">
      <div className="glass-box">
        <div className="service-icon">💻</div>

        <h1>Software Engineering</h1>

        <img
          src="/images/services/software-engineering.png"
          alt="Software Engineering"
          className="service-image"
        />

        <p>
          We build modern websites, web applications, and full business systems
          tailored to your business needs.
        </p>

        <h2>What You Get</h2>
        <ul className="features-list">
          <li>✔ Business websites</li>
          <li>✔ Web applications</li>
          <li>✔ Booking systems</li>
          <li>✔ Admin dashboards</li>
          <li>✔ Custom software solutions</li>
        </ul>

        <h2>Pricing</h2>
        <p><strong>Basic Website:</strong> From R2,500</p>
        <p><strong>Business Website:</strong> From R5,000</p>
        <p><strong>Web App/System:</strong> From R10,000</p>

        <div className="service-actions">
          <a
            href="https://wa.me/27722864367?text=Hi MKETICS, I need Software Engineering services"
            className="btn secondary"
          >
            Chat on WhatsApp
          </a>

<Link to="/#quote?service=Software Engineering" className="btn primary">
  Request Software Quote
</Link>
        </div>
      </div>
    </section>
  );
}