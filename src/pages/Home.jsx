import { Link } from "react-router-dom";

export default function Home({ services, estimatedTotal, wifiType, setWifiType, rooms, setRooms, cctvCameras, setCctvCameras }) {
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <div className="badge">Network • Cloud • Software Engineering</div>

          <img src="/images/logo-detailed.png" className="hero-logo" />

          <h1>Smart IT Solutions for a Stronger Digital Future</h1>

          <p>
            MKETICS delivers professional IT services for homes and businesses.
          </p>
        </div>
      </section>

      <section className="section">
        <h2>Our Services</h2>

        <div className="services-grid">
          {services.map((service) => (
            <Link to={service.link} className="card service-card" key={service.title}>
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
              <span className="learn-more">Learn more →</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}