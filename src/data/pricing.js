import {
  Globe2,
  ShoppingCart,
  Mail,
  Wifi,
  Headphones,
  FileCheck2,
  ShieldCheck,
  ReceiptText,
  LayoutDashboard,
} from "lucide-react";

export const pricingPackages = [
  {
    name: "Website Starter Package",
    price: "From R2 500",
    description:
      "1-5 page professional website, mobile-friendly layout and contact form.",
    icon: Globe2,
    timeline: "3-7 working days",
    bestFor: "Small businesses, startups and service brands",
    features: [
      "Responsive website layout",
      "Home, about, services and contact sections",
      "Basic SEO structure",
      "Contact or WhatsApp CTA",
      "Launch support",
    ],
  },
  {
    name: "Online Store Package",
    price: "From R6 500",
    description:
      "Product catalogue, online payments and order management structure.",
    icon: ShoppingCart,
    timeline: "7-14 working days",
    bestFor: "Businesses that want to sell products online",
    features: [
      "Product catalogue structure",
      "Cart or order flow",
      "Payment gateway guidance",
      "Delivery information setup",
      "Order management guidance",
    ],
  },
  {
    name: "Google Workspace Setup",
    price: "From R1 500",
    description:
      "Professional email, Drive, Docs, Calendar and collaboration setup support.",
    icon: Mail,
    timeline: "1-3 working days",
    bestFor: "Teams that need professional email and organisation",
    features: [
      "Business email setup guidance",
      "Google Drive folder structure",
      "Calendar appointment support",
      "Email signature setup",
      "Basic handover guidance",
    ],
  },
  {
    name: "Network & Wi-Fi Assessment",
    price: "From R1 200",
    description:
      "Coverage review, performance check and improvement recommendations.",
    icon: Wifi,
    timeline: "1-3 working days",
    bestFor: "Offices, schools and businesses with connectivity issues",
    features: [
      "Connectivity review",
      "Wi-Fi coverage assessment",
      "Basic performance checks",
      "Improvement recommendations",
      "Technical summary",
    ],
  },
  {
    name: "Remote IT Support",
    price: "From R1 999/month",
    description:
      "Ongoing technical assistance for devices, users and day-to-day operations.",
    icon: Headphones,
    timeline: "Monthly",
    bestFor: "Businesses needing ongoing technical help",
    features: [
      "Remote troubleshooting",
      "User support",
      "Device and software guidance",
      "Maintenance advice",
      "Monthly support structure",
    ],
  },
  {
    name: "Compliance Support Package",
    price: "From R750",
    description:
      "Practical digital support for business readiness and documentation.",
    icon: FileCheck2,
    timeline: "1-3 working days",
    bestFor: "Businesses preparing documents or compliance readiness",
    features: [
      "Business readiness guidance",
      "B-BBEE assistance guidance",
      "Tax compliance support guidance",
      "Document preparation support",
      "Digital readiness check",
    ],
  },
  {
    name: "Smart Security Consultation",
    price: "From R1 500",
    description:
      "IP camera, cloud surveillance and security planning support.",
    icon: ShieldCheck,
    timeline: "2-5 working days",
    bestFor: "Clients planning smarter visibility and monitoring",
    features: [
      "Security needs discussion",
      "Camera point planning",
      "Cloud surveillance concept",
      "Remote monitoring guidance",
      "Technical recommendation summary",
    ],
  },
  {
    name: "Invoice & Business System",
    price: "From R3 500",
    description:
      "Professional digital tools for billing, records and operations.",
    icon: ReceiptText,
    timeline: "7-14 working days",
    bestFor: "Businesses needing better admin and billing control",
    features: [
      "Invoice structure",
      "Customer records",
      "Payment tracking concept",
      "Basic dashboard planning",
      "Handover guidance",
    ],
  },
  {
    name: "Client Portal & Dashboard",
    price: "From R8 500",
    description:
      "Secure login, project updates, document access and dashboard planning.",
    icon: LayoutDashboard,
    timeline: "14-30 working days",
    bestFor: "Businesses needing client self-service or project visibility",
    features: [
      "Client login planning",
      "Project update dashboard",
      "Document access structure",
      "Admin dashboard concept",
      "Secure access guidance",
    ],
  },
];

export const pricingNotes = [
  "Prices are starting prices and may change based on project requirements.",
  "A deposit may be required before work begins.",
  "Final files, access or delivery may be subject to full payment.",
  "Urgent work, extra features, additional revisions or third-party costs may be quoted separately.",
  "Hosting, domains, software subscriptions and third-party platform fees are not included unless stated in writing.",
];