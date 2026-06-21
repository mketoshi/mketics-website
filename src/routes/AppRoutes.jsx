import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Home from "../pages/Home";
import About from "../pages/About";
import Services from "../pages/Services";
import Pricing from "../pages/Pricing";
import Projects from "../pages/Projects";
import Resources from "../pages/Resources";
import Contact from "../pages/Contact";
import LegalCompliance from "../pages/LegalCompliance";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import TermsOfService from "../pages/TermsOfService";
import PopiaNotice from "../pages/PopiaNotice";
import CookieNotice from "../pages/CookieNotice";
import PaymentTerms from "../pages/PaymentTerms";
import RefundCancellationPolicy from "../pages/RefundCancellationPolicy";
import WebsiteDisclaimer from "../pages/WebsiteDisclaimer";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/legal-compliance" element={<LegalCompliance />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/popia-notice" element={<PopiaNotice />} />
          <Route path="/cookie-notice" element={<CookieNotice />} />
          <Route path="/payment-terms" element={<PaymentTerms />} />
          <Route
                path="/refund-cancellation-policy"
                element={<RefundCancellationPolicy />}
            />
          <Route path="/website-disclaimer" element={<WebsiteDisclaimer />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}