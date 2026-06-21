import LegalPage from "../components/sections/LegalPage";

export default function PaymentTerms() {
  return (
    <LegalPage
      eyebrow="Payments"
      title="Payment Terms"
      intro="These Payment Terms explain how MKETICS handles quotations, invoices, deposits, payment confirmation, outstanding balances and final delivery."
      sections={[
        {
          title: "Quotations",
          items: [
            "Quotations are based on the information provided by the client.",
            "Starting prices shown on the website are not final quotes unless confirmed in writing.",
            "Changes to scope, urgency, integrations or client requirements may change the price.",
          ],
        },
        {
          title: "Deposits and project start",
          text: "MKETICS may require upfront payment or a deposit before work begins. Work may only start after payment confirmation, unless MKETICS agrees otherwise in writing.",
        },
        {
          title: "Late or non-payment",
          text: "Where payment is delayed, MKETICS may pause services, delay delivery, withhold project files, withhold system access, suspend maintenance or require settlement before continuing work.",
        },
      ]}
    />
  );
}