import { Link } from "react-router-dom";

export default function Networking() {
  const service = {
    icon: "🌐",
    title: "Network Infrastructure",
    image: "/images/services/networking.png",
    alt: "Network Infrastructure",
    description:
      "Professional network design, structured cabling, routers, switches, access points, and business connectivity solutions.",
    whatsappText: "Hi MKETICS, I need Network Infrastructure services",
    quoteService: "Network Infrastructure",
  };

  const features = [
    "Network planning and setup",
    "LAN cabling",
    "Router and switch configuration",
    "Access point setup",
    "Troubleshooting and optimization",
  ];

  const pricing = [
    { name: "Basic Network Setup", price: "From R1,200" },
    { name: "LAN Cabling", price: "From R450 per point" },
    { name: "Business Network Setup", price: "From R3,000" },
  ];

  return (
    <section className="service-page">

      {/* HERO */}
      <div className="service-hero">
        <div className="service-icon">{service.icon}</div>

        <h1>
          Network <span>Infrastructure</span>
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