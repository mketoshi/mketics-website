import LegalPage from "../components/sections/LegalPage";
import SEO from "../components/seo/SEO";

export default function PopiaNotice() {
  return (
    <>
      <SEO
        title="POPIA Notice | MKETICS"
        description="Read the MKETICS POPIA notice explaining how personal information is collected, used, protected and handled in line with privacy principles."
        path="/popia-notice"
      />

      <LegalPage
        title="POPIA Notice"
        updated="2026"
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
    </>
  );
}