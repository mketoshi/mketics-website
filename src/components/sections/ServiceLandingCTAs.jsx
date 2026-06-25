import {
  ArrowRight,
  BriefcaseBusiness,
  Code2,
  Globe2,
  MessageCircle,
  Network,
  ShieldCheck,
  Store,
} from "lucide-react";
import Button from "../ui/Button";
import { createWhatsAppLink, whatsappMessages } from "../../utils/whatsapp";

const serviceCtas = [
  {
    title: "Need a professional website?",
    description:
      "Build a clean, mobile-friendly website that presents your business, services, contact details and value clearly.",
    icon: Globe2,
    whatsappKey: "website",
    tag: "Website",
  },
  {
    title: "Need a custom business system?",
    description:
      "Plan a portal, dashboard, admin system or digital workflow that helps you manage operations better.",
    icon: Code2,
    whatsappKey: "system",
    tag: "System",
  },
  {
    title: "Need an online store?",
    description:
      "Start selling products online with a structured catalogue, payment guidance, delivery flow and order process.",
    icon: Store,
    whatsappKey: "ecommerce",
    tag: "E-commerce",
  },
  {
    title: "Need IT or network support?",
    description:
      "Get help with Wi-Fi, connectivity, devices, users, infrastructure planning or technical support.",
    icon: Network,
    whatsappKey: "infrastructure",
    tag: "IT Support",
  },
  {
    title: "Need digital business support?",
    description:
      "Improve documents, business readiness, Google Workspace, online presence and operational structure.",
    icon: BriefcaseBusiness,
    whatsappKey: "digital",
    tag: "Digital Business",
  },
  {
    title: "Need smart security planning?",
    description:
      "Plan IP cameras, monitoring, remote access, cloud surveillance concepts and smart security direction.",
    icon: ShieldCheck,
    whatsappKey: "security",
    tag: "Smart Security",
  },
];

export default function ServiceLandingCTAs({
  variant = "light",
  title = "Choose the service path that fits your need.",
  description = "Start with the area that matches your current business challenge. MKETICS will help you scope the right solution and next step.",
}) {
  const isDark = variant === "dark";

  return (
    <section
      className={`px-5 py-16 lg:py-24 ${
        isDark ? "bg-[#020B1F] text-white" : "bg-white text-[#061A33]"
      }`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p
              className={`text-sm font-black uppercase tracking-[0.25em] ${
                isDark ? "text-cyan-300" : "text-[#0B7CFF]"
              }`}
            >
              Service Starting Points
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              {title}
            </h2>
          </div>

          <p
            className={`text-lg leading-8 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            {description}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {serviceCtas.map((item) => (
            <ServiceCtaCard key={item.title} item={item} isDark={isDark} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCtaCard({ item, isDark }) {
  const Icon = item.icon;
  const message = whatsappMessages[item.whatsappKey] || whatsappMessages.general;

  return (
    <article
      className={`group flex h-full flex-col rounded-[2rem] border p-6 transition duration-300 hover:-translate-y-1 ${
        isDark
          ? "border-cyan-300/15 bg-white/[0.04] hover:border-cyan-300/40"
          : "border-slate-200 bg-[#F8FCFF] hover:border-cyan-300 hover:shadow-xl"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${
            isDark
              ? "bg-cyan-300/10 text-cyan-300"
              : "bg-[#061A33] text-cyan-300"
          }`}
        >
          <Icon size={28} />
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-black ${
            isDark
              ? "bg-cyan-300/10 text-cyan-200"
              : "bg-[#EAF6FF] text-[#0B7CFF]"
          }`}
        >
          {item.tag}
        </span>
      </div>

      <h3 className="mt-6 text-2xl font-black">{item.title}</h3>

      <p
        className={`mt-3 text-sm leading-7 ${
          isDark ? "text-slate-300" : "text-slate-600"
        }`}
      >
        {item.description}
      </p>

      <div className="mt-auto pt-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <Button to="/contact" className="justify-center">
            Start Request
            <ArrowRight size={16} className="ml-2" />
          </Button>

          <a
            href={createWhatsAppLink(message)}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-black transition ${
              isDark
                ? "border-cyan-300/40 bg-white text-[#061A33] hover:bg-cyan-300"
                : "border-cyan-300 bg-white text-[#061A33] hover:bg-[#061A33] hover:text-cyan-200"
            }`}
          >
            <MessageCircle size={16} />
            WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}