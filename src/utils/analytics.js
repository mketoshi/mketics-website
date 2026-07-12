const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

let analyticsLoaded = false;

function canUseAnalytics() {
  return Boolean(GA_MEASUREMENT_ID) && typeof window !== "undefined";
}

export function loadGoogleAnalytics() {
  if (!canUseAnalytics() || analyticsLoaded) return;

  window.dataLayer = window.dataLayer || [];

  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.gtag("js", new Date());

  window.gtag("config", GA_MEASUREMENT_ID, {
    send_page_view: false,
  });

  analyticsLoaded = true;
}

export function trackPageView(path, title) {
  if (!canUseAnalytics() || !window.gtag) return;

  window.gtag("event", "page_view", {
    page_title: title || document.title,
    page_location: `${window.location.origin}${path}`,
    page_path: path,
  });
}

export function trackEvent(eventName, params = {}) {
  if (!canUseAnalytics() || !window.gtag) return;

  window.gtag("event", eventName, {
    website: "mketics.co.za",
    ...sanitizeAnalyticsParams(params),
  });
}

export function trackLead(params = {}) {
  trackEvent("generate_lead", {
    currency: "ZAR",
    value: 1,
    ...params,
  });
}

function sanitizeAnalyticsParams(params) {
  const blockedKeys = [
    "name",
    "full_name",
    "fullName",
    "email",
    "phone",
    "telephone",
    "cellphone",
    "mobile",
    "organisation",
    "projectDetails",
    "project_details",
    "message",
    "body",
  ];

  return Object.fromEntries(
    Object.entries(params).filter(([key, value]) => {
      if (blockedKeys.includes(key)) return false;

      if (typeof value !== "string") return true;

      const looksLikeEmail = /\S+@\S+\.\S+/.test(value);
      const looksLikePhone = /(\+?\d[\d\s().-]{7,})/.test(value);

      return !looksLikeEmail && !looksLikePhone;
    })
  );
}