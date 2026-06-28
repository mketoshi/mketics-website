import { lazy, Suspense, useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";

const FloatingContactCTA = lazy(() =>
  import("../sections/FloatingContactCTA")
);

export default function Layout({ children }) {
  const [showFloatingCta, setShowFloatingCta] = useState(false);

  useEffect(() => {
    const loadFloatingCta = () => setShowFloatingCta(true);

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(loadFloatingCta, {
        timeout: 2500,
      });

      return () => window.cancelIdleCallback(idleId);
    }

    const timer = window.setTimeout(loadFloatingCta, 1800);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#020B1F] pb-20 text-white sm:pb-0">
      <Header />
      <main>{children}</main>
      <Footer />

      {showFloatingCta && (
        <Suspense fallback={null}>
          <FloatingContactCTA />
        </Suspense>
      )}
    </div>
  );
}