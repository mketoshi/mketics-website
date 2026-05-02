import { Link } from "react-router-dom";

export default function ITSupport() {
  return (
    <section className="section">
      <div className="glass-box">
        <div className="service-icon">🛠️</div>

        <h1>IT Support</h1>

        <p>
          Professional on-site and remote IT support for homes and businesses.
          We help with troubleshooting, software setup, printer issues,
          networking, computer maintenance, and user support.
        </p>

        <h2>Pricing</h2>
        <p><strong>Remote Support:</strong> From R250</p>
        <p><strong>On-site Support:</strong> From R450</p>
        <p><strong>Business Support:</strong> From R850</p>

        <Link to="/#quote" className="btn primary">
          Request IT Support Quote
        </Link>
      </div>
    </section>
  );
}