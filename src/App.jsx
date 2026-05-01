import { useState } from "react";
import "./App.css";

function App( ) {
const services = [
  {
    title: "WiFi Installation",
    text: "High-speed home and business WiFi setup with coverage optimization.",
  },
  {
    title: "Network Infrastructure",
    text: "Routers, switches, structured cabling, and enterprise network setup.",
  },
  {
    title: "CCTV & Security",
    text: "Smart surveillance systems with remote monitoring and cloud backup.",
  },
  {
    title: "Web & App Development",
    text: "Modern websites, web apps, and full business systems.",
  },
  {
    title: "Cloud Solutions",
    text: "Cloud storage, hosting, and business system deployment.",
  },
  {
    title: "IT Support",
    text: "On-site and remote technical support for businesses and homes.",
  },
];

const [wifiType, setWifiType] = useState("home");
const [cctvCameras, setCctvCameras] = useState(2);

const wifiPrice = wifiType === "home" ? 1500 : 2500;
const cctvPrice = cctvCameras * 650;
const estimatedTotal = wifiPrice + cctvPrice;

  return (
    <>
      <header className="navbar">
        <img src="/images/logo-clean.png" alt="MKETICS Logo" />

        <nav>
          <a href="#home">Home</a>
          <a href="#services">Services</a>
          <a href="#about">About</a>
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
            cloud systems, and software development for homes and businesses.
          </p>

          <div className="hero-buttons">
            <a href="https://wa.me/27722864367" className="btn primary">
              Chat on WhatsApp
            </a>
            <a href="#services" className="btn secondary">
              View Services
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
            <div className="card" key={service.title}>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </div>
          ))}
        </div>
      </section>

<section className="section">
  <h2>Estimate Your Cost</h2>

  <div className="calculator">
    <label>Number of Rooms</label>
    <input type="number" id="rooms" defaultValue={1} />

    <label>Include CCTV?</label>
    <select id="cctv">
      <option value="0">No</option>
      <option value="2000">Yes (+R2000)</option>
    </select>

    <button
      className="btn primary"
      onClick={() => {
        const rooms = document.getElementById("rooms").value;
        const cctv = document.getElementById("cctv").value;

        const total = rooms * 500 + parseInt(cctv);

        alert("Estimated Cost: R" + total);
      }}
    >
      Calculate
    </button>
  </div>
</section>

<section className="section">
  <h2>Book a Service</h2>

  <p>Select a date and we will confirm your booking.</p>

  <input type="date" />

  <a href="https://wa.me/27722864367" className="btn primary">
    Confirm Booking on WhatsApp
  </a>
</section>

      <section id="about" className="section about-section">
        <div className="glass-box">
          <h2>About MKETICS</h2>
          <p>
            MKETICS is a South African IT solutions company based in Ballito.
            We specialize in networking, cloud systems, CCTV, WiFi installations,
            and software engineering. Our mission is to deliver smart, reliable,
            and scalable technology solutions.
          </p>
        </div>
      </section>

      <section id="contact" className="section">
        <h2>Contact Us</h2>

        <div className="contact-box">
          <p><strong>Phone:</strong> 072 286 4367</p>
          <p><strong>Email:</strong> info@mketics.co.za</p>
          <p><strong>Location:</strong> Ballito, South Africa</p>

          <a href="https://wa.me/27722864367" className="btn primary">
            Chat on WhatsApp
          </a>
        </div>
      </section>

<section className="section">
  <h2>Request a Quote</h2>

  <form
    className="contact-form"
    onSubmit={(e) => {
      e.preventDefault();
      alert("Quote request sent! We will contact you.");
    }}
  >
    <input type="text" placeholder="Full Name" required />
    <input type="tel" placeholder="Phone Number" required />
    <input type="email" placeholder="Email Address" required />

    <select required>
      <option value="">Select Service</option>
      <option>WiFi Installation</option>
      <option>Network Setup</option>
      <option>CCTV Installation</option>
      <option>Website / App Development</option>
    </select>

    <textarea placeholder="Describe your request..." />

    <button className="btn primary">Submit Request</button>
  </form>
</section>

<a
  href="https://wa.me/27722864367"
  className="whatsapp-float"
  target="_blank"
>
  💬
</a>
      <footer>
        © 2026 MKETICS | Smart Solutions. Stronger Future.
      </footer>
    </>
  );
}

export default App;
