import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Code2,
  FileCheck2,
  Globe2,
  Headphones,
  Layers3,
  Mail,
  Megaphone,
  MessageCircle,
  Network,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Store,
  Wifi,
  Wrench,
} from "lucide-react";
import SEO from "../components/seo/SEO";
import Button from "../components/ui/Button";
import ConversionCTA from "../components/sections/ConversionCTA";
import { createWhatsAppLink, whatsappMessages } from "../utils/whatsapp";
import { seoPages } from "../data/seo";

const serviceCategories = [
  {
    key: "websites",
    title: "Websites & Online Presence",
    shortTitle: "Websites",
    subtitle: "Launch or improve your business online.",
    description:
      "For businesses that need a professional website, online store, landing page, product catalogue or booking-focused online presence.",
    icon: Globe2,
    whatsappKey: "system",
    bestFor: [
      "Small businesses launching online",
      "Companies that need a more professional website",
      "Entrepreneurs selling products or services",
    ],
    services: [
      "Business website",
      "Landing page",
      "Online store",
      "Product catalogue",
      "Booking website",
      "Website maintenance",
    ],
    outcomes: [
      "Clear business presentation",
      "Better trust with clients",
      "More enquiry opportunities",
      "A professional online foundation",
    ],
  },
  {
    key: "systems",
    title: "Custom Systems & Portals",
    shortTitle: "Systems",
    subtitle: "Turn manual work into structured digital tools.",
    description:
      "For clients that need dashboards, portals, booking tools, invoice systems, ticketing systems or custom business applications.",
    icon: Layers3,
    whatsappKey: "system",
    bestFor: [
      "Businesses managing many clients or requests",
      "Organisations that need internal tools",
      "Teams tired of manual spreadsheets and scattered processes",
    ],
    services: [
      "Client portal",
      "Admin dashboard",
      "Invoice system",
      "Booking system",
      "Help desk / ticketing system",
      "Custom web application",
    ],
    outcomes: [
      "Better workflow control",
      "Clearer reporting",
      "Less manual admin",
      "Systems designed around your operations",
    ],
  },
  {
    key: "infrastructure",
    title: "IT Support & Networks",
    shortTitle: "IT & Networks",
    subtitle: "Support the technology your business depends on.",
    description:
      "For offices, schools, teams and businesses that need technical support, Wi-Fi planning, email setup, cloud tools or device support.",
    icon: Wifi,
    whatsappKey: "infrastructure",
    bestFor: [
      "Offices with recurring IT issues",
      "Schools or institutions needing network support",
      "Small teams needing email and cloud setup",
    ],
    services: [
      "IT support",
      "Network and Wi-Fi assessment",
      "Router and switch support",
      "Business email setup",
      "Google Workspace guidance",
      "Microsoft 365 guidance",
    ],
    outcomes: [
      "More stable daily operations",
      "Better connectivity planning",
      "Professional business communication",
      "Cleaner digital work environment",
    ],
  },
  {
    key: "digital-business",
    title: "Digital Business Solutions",
    shortTitle: "Digital Business",
    subtitle: "Improve how your business presents and operates.",
    description:
      "For businesses that need digital marketing, business profiles, professional documents, business registration assistance or digital readiness support.",
    icon: Megaphone,
    whatsappKey: "digital",
    bestFor: [
      "Startups preparing to serve clients",
      "Businesses that need better presentation",
      "Companies that want better online visibility",
    ],
    services: [
      "Digital marketing strategy",
      "Google Business Profile setup",
      "SEO and visibility support",
      "Company profile design",
      "Business proposal design",
      "Business registration assistance",
    ],
    outcomes: [
      "Stronger business image",
      "Better client communication",
      "Improved online visibility",
      "More professional documentation",
    ],
  },
  {
    key: "security",
    title: "Security & Smart Technology",
    shortTitle: "Smart Security",
    subtitle: "Plan smarter monitoring and security technology.",
    description:
      "For clients who need guidance around CCTV, IP cameras, cloud storage, remote monitoring and smart technology planning.",
    icon: ShieldCheck,
    whatsappKey: "security",
    bestFor: [
      "Businesses planning CCTV or IP cameras",
      "Schools or sites needing monitoring direction",
      "Clients who need a technology plan before buying equipment",
    ],
    services: [
      "Security consultation",
      "CCTV / IP camera planning",
      "Cloud storage planning",
      "Remote monitoring guidance",
      "Smart business technology planning",
    ],
    outcomes: [
      "Better security planning",
      "Smarter equipment decisions",
      "Remote monitoring direction",
      "Clearer implementation scope",
    ],
  },
  {
    key: "support",
    title: "Maintenance & Monthly Support",
    shortTitle: "Support",
    subtitle: "Keep your digital systems useful after launch.",
    description:
      "For clients who need ongoing updates, support, maintenance, improvements and technical assistance after the initial project.",
    icon: Headphones,
    whatsappKey: "general",
    bestFor: [
      "Businesses that need ongoing website updates",
      "Clients with systems that must remain maintained",
      "Teams that need reliable technical assistance",
    ],
    services: [
      "Website maintenance",
      "System maintenance",
      "Monthly IT support",
      "Content updates",
      "Technical assistance",
      "Digital improvement planning",
    ],
    outcomes: [
      "Less stress after launch",
      "Better long-term reliability",
      "Continuous improvement",
      "A support path for future changes",
    ],
  },
];

const quickRequests = [
  {
    title: "I need a website",
    text: "Start with Websites & Online Presence.",
    icon: Globe2,
    category: "websites",
  },
  {
    title: "I need a system",
    text: "Start with Custom Systems & Portals.",
    icon: Code2,
    category: "systems",
  },
  {
    title: "I need IT support",
    text: "Start with IT Support & Networks.",
    icon: Wrench,
    category: "infrastructure",
  },
  {
    title: "I need marketing",
    text: "Start with Digital Business Solutions.",
    icon: Store,
    category: "digital-business",
  },
];

const processSteps = [
  {
    title: "Choose",
    text: "Select the service area closest to your need.",
  },
  {
    title: "Scope",
    text: "MKETICS clarifies your goals, budget, users, timeline and requirements.",
  },
  {
    title: "Quote",
    text: "You receive pricing direction or a formal quotation based on the scope.",
  },
  {
    title: "Deliver",
    text: "The work moves into setup, design, development, support or implementation.",
  },
];

export default function Services() {
  const [selectedKey, setSelectedKey] = useState("websites");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    const exists = serviceCategories.some((item) => item.key === hash);

    if (exists) {
      setSelectedKey(hash);
    }
  }, []);

  const selectedService = useMemo(
    () =>
      serviceCategories.find((item) => item.key === selectedKey) ||
      serviceCategories[0],
    [selectedKey]
  );

  return (
    <main className="bg-white text-[#061A33]">
      <SEO {...seoPages.services} />

      <section className="relative isolate overflow-hidden bg-[#EAF6FF] px-5 py-14 lg:py-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-[-12rem] top-[-12rem] h-[34rem] w-[34rem] rounded-full bg-cyan-300/40 blur-[140px]" />
          <div className="absolute right-[-14rem] top-10 h-[36rem] w-[36rem] rounded-full bg-blue-500/20 blur-[150px]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white/80 to-transparent" />
        </div>

        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#0B7CFF] shadow-sm">
              <Sparkles size={16} />
              MKETICS Services
            </div>

            <h1 className="mt-7 max-w-5xl text-4xl font-black leading-[1.05] tracking-tight text-[#020B1F] sm:text-5xl lg:text-7xl">
              Choose the digital service that matches your{" "}
              <span className="bg-gradient-to-r from-[#0B7CFF] via-[#00AEEF] to-[#061A33] bg-clip-text text-transparent">
                next business move.
              </span>
            </h1>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-700">
              MKETICS helps with websites, systems, IT support, digital
              business solutions, smart technology planning and ongoing support.
              Start with one clear service path.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button to="/contact">
                Request a Quote
                <ArrowRight size={18} className="ml-2" />
              </Button>

              <a
                href={createWhatsAppLink(whatsappMessages.general)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/20 bg-white px-6 py-3 font-black text-[#061A33] shadow-sm transition hover:border-cyan-300 hover:bg-cyan-300"
              >
                <MessageCircle size={18} className="mr-2" />
                WhatsApp
              </a>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-white bg-white p-5 shadow-2xl">
            <div className="rounded-[2rem] bg-[#020B1F] p-6 text-white">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
                Quick Choice
              </p>

              <h2 className="mt-3 text-3xl font-black">
                What do you need?
              </h2>

              <div className="mt-6 grid gap-3">
                {quickRequests.map((request) => (
                  <QuickRequest
                    key={request.title}
                    request={request}
                    active={selectedKey === request.category}
                    onClick={() => setSelectedKey(request.category)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
                Service Categories
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
                Browse by the result you want.
              </h2>
            </div>

            <p className="text-lg leading-8 text-slate-700">
              Instead of showing everything at once, choose one category and see
              the services, best fit and expected outcomes.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {serviceCategories.map((service) => (
              <CategoryCard
                key={service.key}
                service={service}
                active={selectedKey === service.key}
                onClick={() => setSelectedKey(service.key)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#EAF6FF] px-5 py-14 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
              Selected Service Path
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              {selectedService.title}
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-700">
              {selectedService.description}
            </p>

            <div className="mt-7 flex flex-col gap-4 sm:flex-row">
              <Button to="/contact">
                Request This Service
                <ArrowRight size={18} className="ml-2" />
              </Button>

              <a
                href={createWhatsAppLink(
                  whatsappMessages[selectedService.whatsappKey] ||
                    whatsappMessages.general
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/20 bg-white px-6 py-3 font-black text-[#061A33] shadow-sm transition hover:border-cyan-300 hover:bg-cyan-300"
              >
                <MessageCircle size={18} className="mr-2" />
                Ask on WhatsApp
              </a>
            </div>
          </div>

          <div className="grid gap-5">
            <DetailPanel
              title="Best For"
              icon={SearchCheck}
              items={selectedService.bestFor}
            />

            <DetailPanel
              title="Services Included"
              icon={ClipboardList}
              items={selectedService.services}
            />

            <DetailPanel
              title="Expected Outcomes"
              icon={FileCheck2}
              items={selectedService.outcomes}
            />
          </div>
        </div>
      </section>

      <section className="bg-[#020B1F] px-5 py-14 text-white lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
                How It Works
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
                A simple process from enquiry to delivery.
              </h2>

              <p className="mt-5 text-lg leading-8 text-slate-300">
                MKETICS keeps the service journey clear so clients do not feel
                lost before requesting a quote.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {processSteps.map((step, index) => (
                <ProcessCard
                  key={step.title}
                  number={`0${index + 1}`}
                  step={step}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-14 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-[2.5rem] border border-slate-200 bg-[#EAF6FF] p-6 shadow-sm lg:grid-cols-[0.85fr_1.15fr] lg:p-10">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
              Not Sure Yet?
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Send the problem. MKETICS will guide the service.
            </h2>
          </div>

          <div>
            <p className="text-lg leading-8 text-slate-700">
              You do not need to know the technical name of the solution. Tell
              MKETICS what you want to fix, improve, build or launch, and we can
              recommend the right service path.
            </p>

            <div className="mt-7 flex flex-col gap-4 sm:flex-row">
              <Button to="/contact">
                Start Request
                <ArrowRight size={18} className="ml-2" />
              </Button>

              <a
                href={`mailto:services@mketics.co.za`}
                className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/20 bg-white px-6 py-3 font-black text-[#061A33] shadow-sm transition hover:border-cyan-300 hover:bg-cyan-300"
              >
                <Mail size={18} className="mr-2" />
                Email MKETICS
              </a>
            </div>
          </div>
        </div>
      </section>

      <ConversionCTA
        eyebrow="Need a service?"
        title="Choose the right MKETICS solution for your business."
        description="Whether you need a website, system, IT support, digital business setup or smart technology guidance, MKETICS can help you scope the right solution."
        primaryLabel="Request Service Quote"
        primaryHref="/contact"
      />
    </main>
  );
}

function QuickRequest({ request, active, onClick }) {
  const Icon = request.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition ${
        active
          ? "border-cyan-300 bg-cyan-300/15"
          : "border-white/10 bg-white/[0.05] hover:border-cyan-300/40 hover:bg-white/[0.08]"
      }`}
    >
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-300">
        <Icon size={22} />
      </div>

      <div>
        <p className="font-black text-white">{request.title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-300">
          {request.text}
        </p>
      </div>
    </button>
  );
}

function CategoryCard({ service, active, onClick }) {
  const Icon = service.icon;

  return (
    <article
      id={service.key}
      className={`rounded-[2rem] border p-6 shadow-sm transition duration-300 ${
        active
          ? "border-cyan-300 bg-[#EAF6FF] shadow-xl"
          : "border-slate-200 bg-white hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl"
      }`}
    >
      <button type="button" onClick={onClick} className="block w-full text-left">
        <div className="flex items-start justify-between gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
            <Icon size={28} />
          </div>

          {active && (
            <span className="rounded-full bg-[#061A33] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-cyan-300">
              Selected
            </span>
          )}
        </div>

        <h3 className="mt-6 text-2xl font-black text-[#020B1F]">
          {service.shortTitle}
        </h3>

        <p className="mt-2 text-sm font-black uppercase tracking-[0.18em] text-[#0B7CFF]">
          {service.subtitle}
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          {service.description}
        </p>

        <div className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#0B7CFF]">
          View this service path
          <ArrowRight size={16} />
        </div>
      </button>
    </article>
  );
}

function DetailPanel({ title, icon: Icon, items }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
          <Icon size={22} />
        </div>

        <h3 className="text-xl font-black text-[#020B1F]">{title}</h3>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3">
            <CheckCircle2
              className="mt-0.5 shrink-0 text-[#0B7CFF]"
              size={18}
            />
            <p className="text-sm font-semibold leading-6 text-slate-700">
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProcessCard({ number, step }) {
  return (
    <article className="rounded-[2rem] border border-cyan-300/15 bg-white/[0.05] p-6">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-300 text-lg font-black text-[#061A33]">
        {number}
      </div>

      <h3 className="mt-5 text-xl font-black text-white">{step.title}</h3>

      <p className="mt-3 text-sm leading-7 text-slate-300">{step.text}</p>
    </article>
  );
}