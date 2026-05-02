import { Link } from "react-router-dom";

export default function Networking() {
  return (
    <section className="section">
      <div className="glass-box">
        <div className="service-icon">🌐</div>

        <h1>Network Infrastructure
            <img
  src="/images/services/networking.png"
  alt="Network Infrastructure"
  className="service-image"
/>
        </h1>

        <p>
          Professional network design, structured cabling, routers, switches,
          access points, and business connectivity solutions.
        </p>

        <h2>What You Get</h2>
        <ul className="features-list">
          <li>✔ Network planning and setup</li>
          <li>✔ LAN cabling</li>
          <li>✔ Router and switch configuration</li>
          <li>✔ Access point setup</li>
          <li>✔ Troubleshooting and optimization</li>
        </ul>

        <h2>Pricing</h2>
        <p><strong>Basic Network Setup:</strong> From R1,200</p>
        <p><strong>LAN Cabling:</strong> From R450 per point</p>
        <p><strong>Business Network Setup:</strong> From R3,000</p>

        <div style={{ marginTop: "20px" }}>
          <Link to="/#quote" className="btn primary">
            Request Networking Quote
          </Link>
        </div>
      </div>
    </section>
  );
}