import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { loadGoogleAnalytics, trackPageView } from "../../utils/analytics";

export default function AnalyticsProvider() {
  const location = useLocation();

  useEffect(() => {
    loadGoogleAnalytics();
  }, []);

  useEffect(() => {
    const path = `${location.pathname}${location.search}${location.hash}`;

    const timer = window.setTimeout(() => {
      trackPageView(path, document.title);
    }, 150);

    return () => window.clearTimeout(timer);
  }, [location.pathname, location.search, location.hash]);

  return null;
}