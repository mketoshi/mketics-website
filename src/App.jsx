import "./App.css";

function App() {
  const services = [
    {
      title: "WiFi Installation",
      text: "Reliable home and business WiFi setup from R1500.",
    },
    {
      title: "Network Setup",
      text: "Routers, switches, LAN cabling, access points, and configuration.",
    },
    {
      title: "CCTV & Monitoring",
      text: "Camera installation, remote viewing, and cloud-ready security.",
    },
    {
      title: "Software Development",
      text: "Websites, web apps, business systems, and custom software.",
    },
  ];

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

      <footer>
        © 2026 MKETICS | Smart Solutions. Stronger Future.
      </footer>
    </>
  );
}

export default App;