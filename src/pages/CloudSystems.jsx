import { Link } from "react-router-dom";

export default function CloudSystems() {
  const service = {
    icon: "☁️",
    title: "Cloud Systems",
    image: "/images/services/cloud-systems.png",
    alt: "Cloud Systems",
    description:
      "Secure cloud storage, hosting, backups, and scalable business systems for modern companies.",
    whatsappText: "Hi MKETICS, I need Cloud Systems services",
    quoteService: "Cloud Systems",
  };

  const features = [
    "Cloud storage setup",
    "Website & app hosting",
    "Business backups",
    "Remote access systems",
    "Cloud migration support",
  ];

  const pricing = [
    { name: "Cloud Setup", price: "From R1,500" },
    { name: "Website Hosting Setup", price: "From R950" },
    { name: "Business Cloud System", price: "From R3,500" },
  ];

  return (
    <section className="service-page">

      {/* HERO */}
      <div className="service-hero">
        <div className="service-icon">{service.icon}</div>

        <h1>
          Cloud <span>Systems</span>
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