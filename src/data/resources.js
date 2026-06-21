import {
  BookOpen,
  Globe2,
  ShieldCheck,
  Mail,
  Store,
  Network,
  FileCheck2,
  LayoutDashboard,
} from "lucide-react";

export const resourceCategories = [
  "All",
  "Website Planning",
  "IT Support Tips",
  "Google Workspace",
  "Cybersecurity Basics",
  "Digital Business Tools",
  "Compliance Readiness",
  "Online Stores",
  "Smart Security",
];

export const resources = [
  {
    title: "Why Every Growing Business Needs a Professional Website",
    category: "Website Planning",
    icon: Globe2,
    type: "Guide",
    readTime: "5 min read",
    excerpt:
      "Learn why a clear, mobile-friendly website helps your business look credible, explain services and capture inquiries.",
  },
  {
    title: "What to Prepare Before Requesting a Website Quote",
    category: "Website Planning",
    icon: BookOpen,
    type: "Checklist",
    readTime: "4 min read",
    excerpt:
      "Prepare your logo, pages, service descriptions, images, domain details and contact information before starting.",
  },
  {
    title: "Basic Cybersecurity Tips for Small Businesses",
    category: "Cybersecurity Basics",
    icon: ShieldCheck,
    type: "Article",
    readTime: "6 min read",
    excerpt:
      "Simple security habits can reduce risk, protect client information and keep daily business operations safer.",
  },
  {
    title: "How Google Workspace Can Improve Business Communication",
    category: "Google Workspace",
    icon: Mail,
    type: "Guide",
    readTime: "5 min read",
    excerpt:
      "Use professional email, Drive, Calendar, Docs and Meet to organise communication and business documents.",
  },
  {
    title: "How to Prepare Your Business for an Online Store",
    category: "Online Stores",
    icon: Store,
    type: "Checklist",
    readTime: "5 min read",
    excerpt:
      "Before selling online, prepare products, pricing, delivery rules, payment options and customer policies.",
  },
  {
    title: "Why Network Planning Matters for Schools and Offices",
    category: "IT Support Tips",
    icon: Network,
    type: "Insight",
    readTime: "6 min read",
    excerpt:
      "Good network planning improves coverage, reduces downtime and helps teams use digital tools reliably.",
  },
  {
    title: "Business Compliance Readiness Basics",
    category: "Compliance Readiness",
    icon: FileCheck2,
    type: "Guide",
    readTime: "4 min read",
    excerpt:
      "A practical look at documents and readiness steps that help businesses present themselves professionally.",
  },
  {
    title: "How Client Portals Improve Trust and Project Communication",
    category: "Digital Business Tools",
    icon: LayoutDashboard,
    type: "Article",
    readTime: "5 min read",
    excerpt:
      "Client portals help centralise documents, project updates, invoices and communication in one organised place.",
  },
];

export const featuredGuides = [
  "Website planning checklist",
  "Google Workspace setup basics",
  "Small business cybersecurity tips",
  "Online store preparation guide",
];
