import LegalPage from "../components/sections/LegalPage";

export default function PopiaNotice() {
  return (
    <LegalPage
      eyebrow="POPIA"
      title="POPIA Notice"
      intro="This POPIA Notice explains how MKETICS (PTY) LTD approaches personal information in line with South African privacy principles and the Protection of Personal Information Act where applicable."
      sections={[
        {
          title: "Purpose of processing",
          items: [
            "Responding to website inquiries, quote requests and support messages.",
            "Scheduling consultations and project meetings.",
            "Preparing quotations, invoices, proposals and service documentation.",
            "Delivering website, software, IT infrastructure, digital business, Google Workspace, compliance support or security-related services.",
            "Maintaining lawful business, accounting and operational records.",
          ],
        },
        {
          title: "Categories of personal information",
          items: [
            "Contact details such as name, email and phone number.",
            "Business or organisation information voluntarily provided.",
            "Project requirements, service needs and messages.",
            "Billing and payment-related records.",
            "Website usage and analytics information where enabled.",
          ],
        },
        {
          title: "Data subject requests",
          text: "A person may contact MKETICS to request reasonable access, correction or deletion of personal information, subject to legal, accounting and legitimate business retention requirements.",
        },
      ]}
    />
  );
}