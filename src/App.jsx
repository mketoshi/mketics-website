import { useState } from "react";
import "./App.css";

function App() {
const services = [
  {
    icon: "🛠️",
    title: "IT Support",
    link: "#it-support",
    text: "On-site and remote technical support for businesses and homes.",
  },
  {
    icon: "💻",
    title: "Software Engineering",
    link: "#software-engineering",
    text: "Modern websites, web apps, and full business systems.",
  },
  {
    icon: "☁️",
    title: "Cloud Systems",
    link: "#cloud-systems",
    text: "Cloud storage, hosting, and business system deployment.",
  },
  {
    icon: "🌐",
    title: "Network Infrastructure",
    link: "#networking",
    text: "Routers, switches, structured cabling, and enterprise network setup.",
  },
  {
    icon: "📹",
    title: "CCTV & Security",
    link: "#cctv",
    text: "Smart surveillance systems with remote monitoring and cloud backup.",
  },
  {
    icon: "📶",
    title: "WiFi Installation",
    link: "#wifi",
    text: "High-speed home and business WiFi setup with coverage optimization.",
  },
];

  const [wifiType, setWifiType] = useState("home");
  const [rooms, setRooms] = useState(1);
  const [cctvCameras, setCctvCameras] = useState(0);

  const wifiPrice = wifiType === "home" ? 1500 : 2500;
  const roomPrice = rooms * 500;
  const cctvPrice = cctvCameras * 650;
  const estimatedTotal = wifiPrice + roomPrice + cctvPrice;

  const handleQuoteSubmit = (e) => {
    e.preventDefault();
    alert("Quote request received. MKETICS will contact you shortly.");
  };

  return (
    <>
      <header className="navbar">
        <img src="/images/logo-clean.png" alt="MKETICS Logo" />

        <nav>
          <a href="#home">Home</a>
          <a href="#services">Services</a>
          <a href="#calculator">Pricing</a>
          <a href="#booking">Booking</a>
          <a href="#quote">Quote</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <section id="home" className="hero">
        <div className="hero-content">
          <div className="badge">Network • Cloud • Software Engineering</div>

          <img
            src="/images/logo-detailed.png"
            alt="MKETICS Detailed Logo"
            className="hero-logo"
          />

          <h1>Smart IT Solutions for a Stronger Digital Future</h1>

          <p>
            MKETICS delivers professional WiFi installation, networking, CCTV,
            cloud systems, IT support, and software development for homes and
            businesses.
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
        <p className="section-subtitle">
          Practical technology solutions built for reliability, speed, and growth.
        </p>

        <div className="services-grid">
          {services.map((service) => (
            <a href={service.link} className="card service-card" key={service.title}>
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
              <span className="learn-more">Learn more →</span>
            </a>
          ))}
        </div>
      </section>

      <section id="calculator" className="section">
        <h2>Pricing Calculator</h2>
        <p className="section-subtitle">
          Get a quick estimate before requesting a formal quote.
        </p>

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
            href={`https://wa.me/27722864367?text=Hi MKETICS, I need a quote. My estimated cost is R${estimatedTotal}`}
            className="btn primary"
          >
            Send Estimate on WhatsApp
          </a>
        </div>
      </section>

      <section id="booking" className="section">
        <h2>Book a Service</h2>

        <div className="booking-box">
          <p>Select your preferred service date and confirm on WhatsApp.</p>

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

        <form className="contact-form" onSubmit={handleQuoteSubmit}>
          <input type="text" placeholder="Full Name" required />
          <input type="tel" placeholder="Phone Number" required />
          <input type="email" placeholder="Email Address" required />

          <select required>
            <option value="">Select Service</option>
            <option>WiFi Installation</option>
            <option>Network Setup</option>
            <option>CCTV Installation</option>
            <option>Software Engineering</option>
            <option>Cloud Systems</option>
            <option>IT Support</option>
          </select>

          <textarea placeholder="Describe your request..." required />

          <button className="btn primary" type="submit">
            Submit Request
          </button>
        </form>
      </section>

      <section id="about" className="section about-section">
        <div className="glass-box">
          <h2>About MKETICS</h2>
          <p>
            MKETICS is a South African IT solutions company based in Ballito.
            We specialize in networking, cloud systems, CCTV, WiFi installations,
            IT support, and software engineering.
          </p>
        </div>
      </section>

      <section id="contact" className="section">
        <h2>Contact Us</h2>

        <div className="contact-box">
          <p>
            <strong>Phone:</strong> 072 286 4367
          </p>
          <p>
            <strong>Email:</strong> info@mketics.co.za
          </p>
          <p>
            <strong>Location:</strong> Ballito, South Africa
          </p>

          <a href="https://wa.me/27722864367" className="btn primary">
            Chat on WhatsApp
          </a>
        </div>
      </section>

      <a
        href="https://wa.me/27722864367"
        className="whatsapp-float"
        target="_blank"
        rel="noreferrer"
      >
        💬
      </a>

      <footer>© 2026 MKETICS | Smart Solutions. Stronger Future.</footer>
    </>
  );
}

export default App;