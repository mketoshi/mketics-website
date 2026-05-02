import { Link } from "react-router-dom";

export default function CCTV() {
  return (
    <section className="section">
      <div className="glass-box">
        <div className="service-icon">📹</div>

        <h1>CCTV & Security</h1>

        <p>
          Smart surveillance systems with camera installation, remote viewing,
          monitoring setup, and cloud-ready security options.
        </p>

        <h2>What You Get</h2>
        <ul className="features-list">
          <li>✔ CCTV camera installation</li>
          <li>✔ Remote viewing setup</li>
          <li>✔ DVR/NVR configuration</li>
          <li>✔ Mobile app connection</li>
          <li>✔ Maintenance and troubleshooting</li>
        </ul>

        <h2>Pricing</h2>
        <p><strong>Camera Installation:</strong> From R650 per camera</p>
        <p><strong>Remote Viewing Setup:</strong> From R450</p>
        <p><strong>Full CCTV Setup:</strong> From R3,500</p>

        <div style={{ marginTop: "20px" }}>
          <Link to="/#quote" className="btn primary">
            Request CCTV Quote
          </Link>
        </div>
      </div>
    </section>
  );
}