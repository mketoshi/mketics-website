import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "../components/layout/Layout";
import AnalyticsProvider from "../components/analytics/AnalyticsProvider";

const Home = lazy(() => import("../pages/Home"));
const About = lazy(() => import("../pages/About"));
const Services = lazy(() => import("../pages/Services"));
const Pricing = lazy(() => import("../pages/Pricing"));
const Projects = lazy(() => import("../pages/Projects"));
const Resources = lazy(() => import("../pages/Resources"));
const Contact = lazy(() => import("../pages/Contact"));

const LegalCompliance = lazy(() => import("../pages/LegalCompliance"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("../pages/TermsOfService"));
const PopiaNotice = lazy(() => import("../pages/PopiaNotice"));
const CookieNotice = lazy(() => import("../pages/CookieNotice"));
const PaymentTerms = lazy(() => import("../pages/PaymentTerms"));
const RefundCancellationPolicy = lazy(() =>
  import("../pages/RefundCancellationPolicy")
);
const WebsiteDisclaimer = lazy(() => import("../pages/WebsiteDisclaimer"));

export default function AppRoutes() {
  return (
    <BrowserRouter>
     <AnalyticsProvider />
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="/legal-compliance" element={<LegalCompliance />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/popia-notice" element={<PopiaNotice />} />
            <Route path="/cookie-notice" element={<CookieNotice />} />
            <Route path="/payment-terms" element={<PaymentTerms />} />
            <Route
              path="/refund-cancellation-policy"
              element={<RefundCancellationPolicy />}
            />
            <Route
              path="/website-disclaimer"
              element={<WebsiteDisclaimer />}
            />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}

function PageLoader() {
  return (
    <div className="grid min-h-[60vh] place-items-center bg-[#020B1F] px-5 text-white">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-cyan-300/20 border-t-cyan-300" />
        <p className="mt-5 text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
          Loading MKETICS
        </p>
      </div>
    </div>
  );
}