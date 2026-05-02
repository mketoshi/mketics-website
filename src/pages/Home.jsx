import { Link } from "react-router-dom";

export default function Home({
  services,
  estimatedTotal,
  wifiType,
  setWifiType,
  rooms,
  setRooms,
  cctvCameras,
  setCctvCameras,
}) {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="badge">Network • Cloud • Software Engineering</div>

          <img
            src="/images/logo-detailed.png"
            alt="MKETICS Logo"
            className="hero-logo"
          />

          <h1>Smart IT Solutions for a Stronger Digital Future</h1>

          <p>
            MKETICS delivers professional IT services for homes and businesses.
          </p>

          <div className="hero-buttons">
            <a href="https://wa.me/27722864367" className="btn primary">
              Chat on WhatsApp
            </a>
            <a href="#quote" className="btn secondary">
              Request a Quote
            </a>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section">
        <h2>Our Services</h2>

        <div className="services-grid">
          {services.map((service) => (
            <Link
              to={service.link}
              className="card service-card"
              key={service.title}
            >
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
              <span className="learn-more">Learn more →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* CALCULATOR */}
      <section className="section">
        <h2>Pricing Calculator</h2>

        <div className="calculator">
          <label>WiFi Installation Type</label>
          <select
            value={wifiType}
            onChange={(e) => setWifiType(e.target.value)}
          >
            <option value="home">Home WiFi - R1500</option>
            <option value="business">Business WiFi - R2500</option>
          </select>

          <label>Number of Rooms</label>
          <input
            type="number"
            min="1"
            value={rooms}
            onChange={(e) => setRooms(Number(e.target.value))}
          />

          <label>Number of CCTV Cameras</label>
          <input
            type="number"
            min="0"
            value={cctvCameras}
            onChange={(e) => setCctvCameras(Number(e.target.value))}
          />

          <h3>Estimated Total: R{estimatedTotal}</h3>

          <a
            href={`https://wa.me/27722864367?text=Hi MKETICS, my estimate is R${estimatedTotal}`}
            className="btn primary"
          >
            Send on WhatsApp
          </a>
        </div>
      </section>

      {/* QUOTE FORM */}
      <section id="quote" className="section">
        <h2>Request a Quote</h2>

        <form
          className="contact-form"
          action="https://formsubmit.co/info@mketics.co.za"
          method="POST"
        >
          <input type="text" name="name" placeholder="Full Name" required />
          <input type="tel" name="phone" placeholder="Phone Number" required />
          <input type="email" name="email" placeholder="Email Address" required />

          <select name="service" required>
            <option value="">Select Service</option>
            <option>IT Support</option>
            <option>Software Engineering</option>
            <option>Cloud Systems</option>
            <option>Network Infrastructure</option>
            <option>CCTV Installation</option>
            <option>WiFi Installation</option>
          </select>

          <textarea name="message" placeholder="Describe your request..." required />

          <input
            type="hidden"
            name="_subject"
            value="New MKETICS Quote Request"
          />
          <input type="hidden" name="_captcha" value="false" />

          <button className="btn primary" type="submit">
            Submit Request
          </button>
        </form>
      </section>
    </>
  );
}