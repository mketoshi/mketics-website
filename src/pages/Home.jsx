import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import emailjs from "@emailjs/browser";

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

  const [selectedServiceState, setSelectedService] = useState(
    selectedService || ""
  );
  const [lastQuote, setLastQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quoteSent, setQuoteSent] = useState(false);

  const defaultMessage = selectedServiceState
    ? `Hi MKETICS, I need a quote for ${selectedServiceState}. Please contact me with more details.`
    : "Hi MKETICS, I need a quote. Please contact me.";

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target;

    const data = {
      name: form.name.value,
      phone: form.phone.value,
      email: form.email.value,
      service: form.service.value,
      message: form.message.value,
    };

    // ✅ Save to Supabase
    const { error } = await supabase.from("quotes").insert([data]);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    // ✅ Send Email
    try {
      await emailjs.send(
        "service_j54ayfr",
        "template_4weiuia",
        data,
        "py8cRBCVu5UZFjux1"
      );
    } catch (err) {
      console.error("Email error:", err);
    }

    // ✅ Save last quote for WhatsApp button
    setLastQuote(data);

    // ✅ Show success UI
    setQuoteSent(true);
    form.reset();
    setSelectedService("");
    setLoading(false);
  };

  return (
    <>
      {/* HERO */}
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

      {/* SERVICES */}
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

      {/* CALCULATOR */}
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

      {/* QUOTE FORM */}
      <section id="quote" className="section">
        <h2>Request a Quote</h2>

        {quoteSent && (
          <div className="success-message">
            ✅ Quote request sent successfully. MKETICS will contact you shortly.

            <br />
            <br />

            <a
              href={`https://wa.me/27722864367?text=${encodeURIComponent(
                `Hi MKETICS, I just submitted a quote request.

Name: ${lastQuote?.name}
Phone: ${lastQuote?.phone}
Service: ${lastQuote?.service}`
              )}`}
              className="btn primary"
              target="_blank"
              rel="noreferrer"
            >
              Continue to WhatsApp
            </a>
          </div>
        )}

        <form className="contact-form" onSubmit={handleQuoteSubmit}>
          <input type="text" name="name" placeholder="Full Name" required />
          <input type="tel" name="phone" placeholder="Phone Number" required />
          <input type="email" name="email" placeholder="Email Address" required />

          <select
            name="service"
            value={selectedServiceState}
            onChange={(e) => setSelectedService(e.target.value)}
            required
          >
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
          />

          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Submit Request"}
          </button>
        </form>
      </section>
    </>
  );
}