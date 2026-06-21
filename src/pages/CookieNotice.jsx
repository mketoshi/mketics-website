import LegalPage from "../components/sections/LegalPage";

export default function CookieNotice() {
  return (
    <LegalPage
      eyebrow="Cookies"
      title="Cookie Notice"
      intro="This Cookie Notice explains how the MKETICS website may use cookies and similar technologies to support website functionality, performance, analytics and user experience."
      sections={[
        {
          title: "Types of cookies we may use",
          items: [
            "Essential cookies that support website functionality, security, form operation or session handling.",
            "Analytics cookies that help MKETICS understand visitor behaviour, popular pages and website performance.",
            "Preference cookies that remember user choices where implemented.",
            "Marketing or tracking cookies only where implemented and appropriate.",
          ],
        },
        {
          title: "Managing cookies",
          items: [
            "Visitors can control or delete cookies through browser settings.",
            "Blocking some cookies may affect website features, forms, login sessions, embedded content or analytics accuracy.",
            "Where a cookie consent banner is implemented, visitors can follow the options provided on the website.",
          ],
        },
      ]}
    />
  );
}
