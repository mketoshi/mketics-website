import { useState } from "react";
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
      const params = new URLSearchParams(window.location.hash.split("?")[1]);
      const selectedService = params.get("service");
      
      const defaultMessage = selectedService
      ? `Hi MKETICS, I need a quote for ${selectedService}. Please contact me with more details.`
      : "Hi MKETICS, I need a quote. Please contact me.";
      const [quoteSent, setQuoteSent] = useState(false);
  return (
    <>
      <section id="home" className="hero">
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

      <section id="services" className="section">
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

      <section id="calculator" className="section">
        <h2>Pricing Calculator</h2>

        <div className="calculator">
          <label>WiFi Installation Type</label>
          <select value={wifiType} onChange={(e) => setWifiType(e.target.value)}>
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

      <section id="booking" className="section">
        <h2>Book a Service</h2>

        <div className="booking-box">
          <p>Select your preferred date and confirm your booking on WhatsApp.</p>

          <input type="date" />

          <a
            href="https://wa.me/27722864367?text=Hi MKETICS, I would like to book a service."
            className="btn primary"
          >
            Confirm Booking on WhatsApp
          </a>
        </div>
      </section>

      <section id="quote" className="section">
        <h2>Request a Quote</h2>
{quoteSent && (
  <div className="success-message">
    ✅ Quote request sent successfully. MKETICS will contact you shortly.
  </div>
)}

<form
  className="contact-form"
action="https://formsubmit.co/msanesphesihle968@gmail.com"
  method="POST"
  onSubmit={() => setQuoteSent(true)}
>
          <input type="hidden" name="_next" value="https://mketics-website.pages.dev/#quote" />
          <input type="text" name="name" placeholder="Full Name" required />
          <input type="tel" name="phone" placeholder="Phone Number" required />
          <input type="email" name="email" placeholder="Email Address" required />

<select name="service" defaultValue={selectedService || ""} required>

  <option value="">Select Service</option>
  <option value="IT Support">IT Support</option>
  <option value="Software Engineering">Software Engineering</option>
  <option value="Cloud Systems">Cloud Systems</option>
  <option value="Network Infrastructure">Network Infrastructure</option>
  <option value="CCTV Installation">CCTV Installation</option>
  <option value="WiFi Installation">WiFi Installation</option>
</select>

<textarea
  name="message"
  placeholder="Describe your request..."
  defaultValue={defaultMessage}
  required
  onFocus={(e) => {
    if (!e.target.value) {
      e.target.value = defaultMessage;
    }
  }}
/>

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

      <section id="contact" className="section">
        <h2>Contact Us</h2>

        <div className="contact-box">
          <p><strong>Phone:</strong> 072 286 4367</p>
          <p><strong>Email:</strong> msanesphesihle968@gmail.com</p>
          <p><strong>Location:</strong> Ballito, South Africa</p>

          <a href="https://wa.me/27722864367" className="btn primary">
            Chat on WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}