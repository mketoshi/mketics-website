import LegalPage from "../components/sections/LegalPage";

export default function TermsOfService() {
  return (
    <LegalPage
      eyebrow="Website Terms"
      title="Terms of Service"
      intro="These Terms of Service govern use of the MKETICS website and the general terms under which visitors and clients interact with MKETICS (PTY) LTD online."
      sections={[
        {
          title: "Website use",
          items: [
            "The website is provided for information, marketing, service inquiry and client communication purposes.",
            "Visitors must not misuse the website, interfere with its security or submit false, harmful or unauthorised information.",
            "Website content may be updated, removed or changed as MKETICS improves its services.",
          ],
        },
        {
          title: "Services are subject to written scope",
          text: "Information on the website does not automatically create a binding service agreement. Formal work begins when MKETICS and the client agree on the scope, quotation, payment terms and delivery requirements in writing.",
        },
        {
          title: "Quotations and pricing",
          items: [
            "Prices shown on the website are starting prices or estimates unless clearly stated otherwise.",
            "Final pricing depends on project scope, complexity, urgency, integrations, content availability, third-party costs and client requirements.",
            "Additional requests outside the agreed scope may require a revised quotation or change request.",
          ],
        },
      ]}
    />
  );
}