import { Link } from "react-router-dom";

export default function CCTV() {
  const service = {
    icon: "📹",
    title: "CCTV & Security",
    image: "/images/services/cctv.png",
    alt: "CCTV and Security",
    description:
      "Smart surveillance systems with camera installation, remote viewing, monitoring setup, and cloud-ready security options.",
    whatsappText: "Hi MKETICS, I need CCTV and Security services",
    quoteService: "CCTV Installation",
  };

  const features = [
    "CCTV camera installation",
    "Remote viewing setup",
    "DVR/NVR configuration",
    "Mobile app connection",
    "Maintenance and troubleshooting",
  ];

  const pricing = [
    { name: "Camera Installation", price: "From R650 per camera" },
    { name: "Remote Viewing Setup", price: "From R450" },
    { name: "Full CCTV Setup", price: "From R3,500" },
  ];

  return (
    <section className="service-page">

      {/* HERO */}
      <div className="service-hero">
        <div className="service-icon">{service.icon}</div>

        <h1>
          CCTV & <span>Security</span>
        </h1>

        <p className="service-description">{service.description}</p>
      </div>

      {/* IMAGE */}
      <div className="service-image-wrapper">
        <img src={service.image} alt={service.alt} />
      </div>

      {/* CONTENT */}
      <div className="service-content">

        {/* FEATURES */}
        <div className="service-card premium-service-card">
          <h2>What You Get</h2>

          <ul className="features-list">
            {features.map((feature) => (
              <li key={feature}>✔ {feature}</li>
            ))}
          </ul>
        </div>

        {/* PRICING */}
        <div className="service-card pricing-card premium-service-card">
          <h2>Pricing</h2>

          {pricing.map((item) => (
            <div className="price-item" key={item.name}>
              <span>{item.name}</span>
              <strong>{item.price}</strong>
            </div>
          ))}
        </div>

      </div>

      {/* CTA */}
      <div className="service-actions premium">
        <a
          href={`https://wa.me/27722864367?text=${encodeURIComponent(
            service.whatsappText
          )}`}
          className="btn primary"
          target="_blank"
          rel="noreferrer"
        >
          Chat on WhatsApp
        </a>

        <Link
          to={`/#quote?service=${encodeURIComponent(service.quoteService)}`}
          className="btn secondary"
        >
          Request Quote
        </Link>
      </div>

    </section>
  );
}