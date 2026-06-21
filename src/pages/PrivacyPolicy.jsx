import LegalPage from "../components/sections/LegalPage";

export default function PrivacyPolicy() {
  return (
    <LegalPage
      eyebrow="Privacy"
      title="Privacy Policy"
      intro="This Privacy Policy explains how MKETICS (PTY) LTD collects, uses, stores and protects personal information when visitors, prospects and clients use the MKETICS website, forms, communication channels and related services."
      sections={[
        {
          title: "Information we may collect",
          items: [
            "Name and surname.",
            "Company or organisation name.",
            "Email address and contact number.",
            "Service interests or project requirements.",
            "Messages submitted through contact, quote, support or assessment forms.",
            "Booking and meeting information.",
            "Technical website information such as device, browser, analytics and cookie data.",
          ],
        },
        {
          title: "How we use information",
          items: [
            "To respond to inquiries, quote requests and support messages.",
            "To prepare proposals, quotations, invoices and service documents.",
            "To schedule consultations, meetings and project reviews.",
            "To deliver agreed technology, website, IT, digital business or security-related services.",
            "To improve website performance, service quality and user experience.",
          ],
        },
        {
          title: "Information security",
          items: [
            "Client information should be accessed only by authorised MKETICS users or service-related personnel.",
            "Private client documents should not be published publicly.",
            "System credentials and sensitive access details should be handled carefully.",
            "Website and portal systems should use appropriate authentication and secure configuration where implemented.",
          ],
        },
      ]}
    />
  );
}