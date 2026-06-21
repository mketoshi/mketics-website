import LegalPage from "../components/sections/LegalPage";

export default function WebsiteDisclaimer() {
  return (
    <LegalPage
      eyebrow="Disclaimer"
      title="Website Disclaimer"
      intro="This Website Disclaimer applies to information published on the MKETICS website, including service descriptions, articles, resources, pricing references, portfolio items, graphics, downloads and general guidance."
      sections={[
        {
          title: "General information only",
          text: "Website content is intended to help visitors understand MKETICS services and general technology topics. It should not be treated as legal, financial, regulatory, tax, cybersecurity or professional advice unless a specific written agreement states otherwise.",
        },
        {
          title: "No automatic service agreement",
          text: "Using the website, reading content, submitting a form or requesting information does not automatically create a service agreement. A formal service relationship begins only when MKETICS and the client agree to scope, pricing and terms in writing.",
        },
        {
          title: "Pricing and service availability",
          text: "Prices, offers, service packages and availability may change. Starting prices are estimates and may depend on project scope, requirements, third-party costs and timelines.",
        },
      ]}
    />
  );
}