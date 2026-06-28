import { lazy, Suspense, useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";

const FloatingContactCTA = lazy(() =>
  import("../sections/FloatingContactCTA")
);

export default function Layout({ children }) {
  const [showFloatingCta, setShowFloatingCta] = useState(false);

  useEffect(() => {
    if (showFloatingCta) return;

    const showCta = () => setShowFloatingCta(true);

    const timer = window.setTimeout(showCta, 7000);

    window.addEventListener("scroll", showCta, { once: true, passive: true });
    window.addEventListener("mousemove", showCta, { once: true });
    window.addEventListener("touchstart", showCta, { once: true, passive: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", showCta);
      window.removeEventListener("mousemove", showCta);
      window.removeEventListener("touchstart", showCta);
    };
  }, [showFloatingCta]);

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