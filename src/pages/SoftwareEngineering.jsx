import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function SoftwareEngineering() {
  const service = {
    icon: "💻",
    title: "Software Engineering",
    image: "/images/services/software-engineering.png",
    alt: "Software Engineering",
    description:
      "We build modern websites, web applications, and full business systems tailored to your business growth.",
    whatsappText: "Hi MKETICS, I need Software Engineering services",
    quoteService: "Software Engineering",
  };

  const typingWords = [
    "Websites",
    "Web Apps",
    "Business Systems",
    "Admin Dashboards",
    "Automation Tools",
  ];

  const features = [
    "Business websites",
    "Web applications",
    "Booking systems",
    "Admin dashboards",
    "Custom software solutions",
  ];

  const pricing = [
    { name: "Basic Website", price: "From R2,500" },
    { name: "Business Website", price: "From R5,000" },
    { name: "Web App/System", price: "From R10,000" },
  ];

  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const currentWord = typingWords[wordIndex];
    const typingSpeed = deleting ? 45 : 90;

    const timeout = setTimeout(() => {
      if (!deleting) {
        setText(currentWord.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);

        if (charIndex + 1 === currentWord.length) {
          setTimeout(() => setDeleting(true), 900);
        }
      } else {
        setText(currentWord.slice(0, charIndex - 1));
        setCharIndex(charIndex - 1);

        if (charIndex - 1 === 0) {
          setDeleting(false);
          setWordIndex((wordIndex + 1) % typingWords.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, deleting, wordIndex, typingWords]);

  return (
    <section className="service-page software-page">
      {/* HERO */}
      <div className="service-hero animated-hero">
        <div className="service-icon floating-icon">{service.icon}</div>

        <h1>
          Software <span>Engineering</span>
        </h1>

       <div className="typing-container">
  <p className="typing-effect">
    We build <span>{text}</span>
  </p>
</div>
        <p className="service-description">{service.description}</p>
      </div>

      {/* IMAGE */}
      <div className="service-image-wrapper animated-image">
        <img src={service.image} alt={service.alt} />
      </div>

      {/* CONTENT */}
      <div className="service-content animated-grid">
        <div className="service-card premium-service-card">
          <h2>What You Get</h2>

          <ul className="features-list">
            {features.map((feature) => (
              <li key={feature}>✔ {feature}</li>
            ))}
          </ul>
        </div>

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
      <div className="service-actions premium animated-actions">
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