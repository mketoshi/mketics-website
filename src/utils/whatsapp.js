import { siteConfig } from "../data/site";

export function createWhatsAppLink(message) {
  const encodedMessage = encodeURIComponent(message);
  return `${siteConfig.whatsapp}?text=${encodedMessage}`;
}

export const whatsappMessages = {
  website:
    "Hello MKETICS, I would like to request a quote for a professional business website. Please guide me on the next steps.",

  system:
    "Hello MKETICS, I would like to discuss a custom business system, portal or dashboard. Please guide me on the next steps.",

  ecommerce:
    "Hello MKETICS, I would like to request a quote for an online store / e-commerce website. Please guide me on the next steps.",

  infrastructure:
    "Hello MKETICS, I need help with IT support, network support, Wi-Fi or infrastructure planning. Please guide me on the next steps.",

  digital:
    "Hello MKETICS, I need digital business support, business readiness support or digital tools setup. Please guide me on the next steps.",

  marketing:
    "Hello MKETICS, I would like to discuss digital marketing support for my business. Please guide me on the next steps.",

  security:
    "Hello MKETICS, I would like to discuss smart security, IP camera planning or cloud surveillance guidance. Please guide me on the next steps.",

  general:
    "Hello MKETICS, I would like to request a quote or consultation. Please guide me on the next steps.",
};