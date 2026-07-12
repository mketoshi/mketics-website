import { lazy, Suspense, useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";

const FloatingContactCTA = lazy(() => import("../sections/FloatingContactCTA"));

export default function Layout({ children }) {
  const [showFloatingCta, setShowFloatingCta] = useState(false);
  const [allowFloatingCta, setAllowFloatingCta] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    function updateFloatingState(event) {
      setAllowFloatingCta(event.matches);
    }

    setAllowFloatingCta(mediaQuery.matches);

    mediaQuery.addEventListener("change", updateFloatingState);

    return () => {
      mediaQuery.removeEventListener("change", updateFloatingState);
    };
  }, []);

  useEffect(() => {
    if (!allowFloatingCta || showFloatingCta) return;

    const showCta = () => setShowFloatingCta(true);

    const timer = window.setTimeout(showCta, 7000);

    window.addEventListener("scroll", showCta, { once: true, passive: true });
    window.addEventListener("mousemove", showCta, { once: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", showCta);
      window.removeEventListener("mousemove", showCta);
    };
  }, [allowFloatingCta, showFloatingCta]);

  return (
    <div className="min-h-screen bg-[#020B1F] text-white">
      <Header />
      <main>{children}</main>
      <Footer />

      {allowFloatingCta && showFloatingCta && (
        <Suspense fallback={null}>
          <FloatingContactCTA />
        </Suspense>
      )}
    </div>
  );
}