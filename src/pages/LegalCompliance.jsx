import LegalPage from "../components/sections/LegalPage";
import { siteConfig } from "../data/site";

export default function LegalCompliance() {
  return (
    <LegalPage
      eyebrow="Legal & Compliance"
      title="Legal & Compliance"
      intro="MKETICS (PTY) LTD is a registered South African private company providing technology-related services, digital systems, IT infrastructure solutions and commercial innovation services."
      sections={[
        {
          title: "Company registration details",
          items: [
            `Registered Company Name: ${siteConfig.legalName}.`,
            "Company Type: Private Company.",
            `Registration Number: ${siteConfig.registrationNumber}.`,
            `Enterprise Number: ${siteConfig.enterpriseNumber}.`,
            "Registration Date: 09 April 2026.",
            "Enterprise Status: In Business.",
            `Website: ${siteConfig.website}.`,
            `Contact Number: ${siteConfig.phone}.`,
          ],
        },
        {
          title: "B-BBEE status",
          items: [
            "B-BBEE Status: Level 1 Contributor.",
            "Procurement Recognition: 135%.",
            "Certificate Number: 9456290375.",
            "Issue Date: 08 April 2026.",
            "Expiry Date: 07 April 2027.",
          ],
        },
        {
          title: "Company meaning",
          text: "MKETICS stands for Modern Knowledge Engineering, Technology & Innovative Commercial Solutions. The company is built as a purpose-driven technology business focused on creating smart digital systems, strengthening businesses, connecting people and inspiring unity through innovation, Ubuntu and long-term value.",
        },
        {
          title: "Nature of business",
          items: [
            "Software engineering.",
            "Website design and development.",
            "Business systems development.",
            "Client portals and admin dashboards.",
            "IT infrastructure support.",
            "Network and Wi-Fi solutions.",
            "Cloud setup and digital tools.",
            "Digital business solutions.",
            "Security and smart technology consultation.",
          ],
        },
      ]}
    />
  );
}