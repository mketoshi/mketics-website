import { siteConfig } from "./site";

export const primaryCta = {
  label: "Request a Quote",
  href: "/contact",
};

export const whatsappCta = {
  label: "Chat on WhatsApp",
  href: siteConfig.whatsapp,
};

export const consultationCta = {
  label: "Book a Consultation",
  href: "/contact",
};

export const serviceCtas = {
  website: {
    title: "Need a professional website?",
    description:
      "Tell MKETICS what your business does, what pages you need and whether you already have content, a logo and domain.",
    button: "Request Website Quote",
    href: "/contact",
  },
  system: {
    title: "Need a custom business system?",
    description:
      "Share the problem you want to solve, the users involved, the process you want to manage and the reports you need.",
    button: "Discuss System Project",
    href: "/contact",
  },
  infrastructure: {
    title: "Need IT or network support?",
    description:
      "Describe your environment, number of users, devices, network issue, location and urgency so MKETICS can guide the next step.",
    button: "Request IT Support",
    href: "/contact",
  },
  digital: {
    title: "Need digital business support?",
    description:
      "Get help with business documents, digital tools, compliance readiness guidance, online presence and operational setup.",
    button: "Start Digital Readiness",
    href: "/contact",
  },
};