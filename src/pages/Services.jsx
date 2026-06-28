import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Code2,
  Cpu,
  FileCheck2,
  Globe2,
  Layers3,
  Megaphone,
  MessageCircle,
  Network,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import SEO from "../components/seo/SEO";
import Button from "../components/ui/Button";
import ConversionCTA from "../components/sections/ConversionCTA";
import ServiceLandingCTAs from "../components/sections/ServiceLandingCTAs";
import { createWhatsAppLink, whatsappMessages } from "../utils/whatsapp";
import { seoPages } from "../data/seo";

const servicePillars = [
  {
    title: "Software Engineering",
    whatsappKey: "system",
    description:
      "Custom websites, business systems, dashboards, portals and digital platforms built around real business processes.",
    icon: Code2,
    features: [
      "Business websites",
      "Client portals",
      "Admin dashboards",
      "Online stores",
      "Custom business systems",
    ],
  },
  {
    title: "IT Infrastructure",
    whatsappKey: "infrastructure",
    description:
      "Reliable IT, network, Wi-Fi and technical support services for businesses, schools, offices and growing teams.",
    icon: Network,
    features: [
      "Network planning",
      "Wi-Fi support",
      "IT troubleshooting",
      "Device and user support",
      "Infrastructure assessments",
    ],
  },
  {
    title: "Digital Business Solutions",
    whatsappKey: "digital",
    description:
      "Digital tools, documents, online presence, business readiness and operational support to help businesses work smarter.",
    icon: BriefcaseBusiness,
    features: [
      "Business documents",
      "Digital readiness",
      "Business registration assistance",
      "Google Workspace guidance",
      "Workflow improvement",
    ],
  },
  {
    title: "Security & Smart Technology",
    whatsappKey: "security",
    description:
      "Smart security planning, IP camera guidance, cloud surveillance concepts and technology solutions that improve visibility.",
    icon: ShieldCheck,
    features: [
      "IP camera planning",
      "Smart security guidance",
      "Cloud surveillance concepts",
      "Remote monitoring planning",
      "Security technology advice",
    ],
  },
];

const serviceFocus = [
  {
    title: "Websites & Online Presence",
    icon: Globe2,
    text: "Professional websites designed to present your business clearly, build trust and guide visitors to take action.",
  },
  {
    title: "Business Systems",
    icon: Layers3,
    text: "Custom digital systems that organise client records, invoices, projects, requests, reports and daily operations.",
  },
  {
    title: "IT & Network Support",
    icon: Cpu,
    text: "Practical technical support for devices, connectivity, networks, Wi-Fi, users and business technology environments.",
  },
  {
    title: "Business Readiness",
    icon: FileCheck2,
    text: "Support with professional documents, digital tools, service structure and readiness for clients, tenders or suppliers.",
  },
  {
    title: "Digital Marketing Support",
    icon: Megaphone,
    text: "Digital content, online visibility, brand communication and service presentation support for growing businesses.",
  },
  {
    title: "Smart Security Planning",
    icon: ShieldCheck,
    text: "Technology planning for monitoring, cameras, visibility, storage, remote access and safer digital environments.",
  },
];

const processSteps = [
  {
    title: "Understand",
    text: "We first understand your business, problem, users, environment and expected outcome.",
  },
  {
    title: "Scope",
    text: "We define the right service path, deliverables, timeline, risks, requirements and pricing direction.",
  },
  {
    title: "Build or Support",
    text: "We deliver the agreed solution through design, development, configuration, support or documentation.",
  },
  {
    title: "Improve",
    text: "We help you refine the solution so it remains useful, professional and ready for long-term value.",
  },
];

export default function Services() {
  return (
    <main className="bg-[#020B1F] text-white">
      <SEO {...seoPages.services} />

      <section className="relative isolate overflow-hidden px-5 py-16 lg:py-24">
        <div className="absolute inset-0 -z-10">
          <img
            src="/assets/mketics-bg1.png"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-center opacity-35"
          />
          <div className="absolute inset-0 bg-[#020B1F]/78" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020B1F] via-[#020B1F]/88 to-[#020B1F]/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020B1F]/20 via-transparent to-[#020B1F]" />
          <div className="absolute left-1/2 top-0 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-cyan-400/15 blur-[140px]" />
          <div className="absolute right-0 top-24 h-[430px] w-[430px] rounded-full bg-blue-600/15 blur-[120px]" />
        </div>

        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.82fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-cyan-200">
              <Sparkles size={16} />
              MKETICS Services
            </div>

            <h1 className="mt-7 max-w-5xl text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Build smarter systems, stronger infrastructure and{" "}
              <span className="bg-gradient-to-r from-cyan-200 via-white to-cyan-300 bg-clip-text text-transparent">
                future-ready digital operations.
              </span>
            </h1>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300">
              MKETICS helps businesses, institutions and individuals design,
              improve and manage technology through software development, IT
              infrastructure, digital business support and smart technology
              solutions.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Button to="/contact">
                Request a Quote
                <ArrowRight size={18} className="ml-2" />
              </Button>
              <Button to="/pricing" variant="secondary">
                View Starting Prices
              </Button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-cyan-300/20 bg-white/[0.05] p-6 backdrop-blur-xl">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
              Service Focus
            </p>

            <div className="mt-6 grid gap-4">
              {[
                "Websites, portals and custom systems",
                "Networks, Wi-Fi and IT support",
                "Business registration and compliance readiness",
                "Digital marketing and smart technology",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <CheckCircle2
                    className="mt-0.5 shrink-0 text-cyan-300"
                    size={18}
                  />
                  <p className="text-sm leading-6 text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#EAF6FF] px-5 py-16 text-[#061A33] lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
              Core Service Pillars
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Everything MKETICS offers is built around practical business
              value.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-700">
              The services are structured to help clients move from confusion to
              clarity, from manual work to digital systems, and from weak
              technology foundations to stronger operations.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {servicePillars.map((service) => (
              <ServicePillarCard key={service.title} service={service} />
            ))}
          </div>
        </div>
      </section>

      <ServiceLandingCTAs
        variant="dark"
        title="Pick the service path that matches your current challenge."
        description="Each option gives clients a quick way to request a quote or start a WhatsApp conversation with the right context already included."
      />

      <section className="bg-white px-5 py-16 text-[#061A33] lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 grid gap-6 lg:grid-cols-[0.85fr_1fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
                Service Areas
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
                Choose the solution that matches your current need.
              </h2>
            </div>
            <p className="text-lg leading-8 text-slate-700">
              Whether you need a website, system, IT support, digital business
              setup or smart security planning, MKETICS helps you define the
              right starting point before you spend money.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {serviceFocus.map((item) => (
              <FocusCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#020B1F] px-5 py-16 text-white lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
              How We Work
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              A clear process from idea to execution.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              MKETICS does not treat every client the same. We first understand
              the real problem, then recommend the most useful and realistic
              solution path.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {processSteps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-[2rem] border border-cyan-300/15 bg-white/[0.04] p-6"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-300/10 text-lg font-black text-cyan-200">
                  {index + 1}
                </div>
                <h3 className="mt-5 text-xl font-black text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#EAF6FF] px-5 py-16 text-[#061A33] lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
              Who We Help
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Built for businesses, schools, teams and individuals who need
              practical technology.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-700">
              MKETICS is suitable for clients who need professional support but
              also want clear communication, realistic pricing and technology
              that makes sense for their stage.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              "Small businesses that need websites, systems or digital readiness.",
              "Schools and institutions that need network, Wi-Fi or IT support.",
              "Entrepreneurs who need online stores, documents or business setup support.",
              "Organisations that need dashboards, client portals or structured digital tools.",
              "Clients who want smart technology planning before investing in equipment.",
            ].map((item) => (
              <div
                key={item}
                className="flex gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <CheckCircle2
                  className="mt-1 shrink-0 text-[#0B7CFF]"
                  size={20}
                />
                <p className="leading-7 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ConversionCTA
        eyebrow="Need a service?"
        title="Choose the right MKETICS solution for your business."
        description="Whether you need a website, business system, IT support, digital business setup or smart technology guidance, MKETICS can help you scope the right solution."
        primaryLabel="Request Service Quote"
        primaryHref="/contact"
      />
    </main>
  );
}

function ServicePillarCard({ service }) {
  const Icon = service.icon;

  return (
    <article className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl">
      <div className="flex items-start gap-5">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#061A33] text-cyan-300 shadow-[0_0_30px_rgba(0,174,239,0.18)]">
          <Icon size={28} />
        </div>

        <div>
          <h3 className="text-2xl font-black text-[#020B1F]">
            {service.title}
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {service.description}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {service.features.map((feature) => (
          <div key={feature} className="flex items-start gap-2">
            <CheckCircle2
              className="mt-0.5 shrink-0 text-[#0B7CFF]"
              size={18}
            />
            <p className="text-sm font-semibold text-slate-700">{feature}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Button to="/contact" className="justify-center">
          Request Quote
          <ArrowRight size={16} className="ml-2" />
        </Button>

        <a
          href={createWhatsAppLink(
            whatsappMessages[service.whatsappKey] || whatsappMessages.general
          )}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-300 bg-white px-5 py-3 text-sm font-black text-[#061A33] transition hover:bg-[#061A33] hover:text-cyan-200"
        >
          <MessageCircle size={16} />
          WhatsApp
        </a>
      </div>
    </article>
  );
}

function FocusCard({ item }) {
  const Icon = item.icon;

  return (
    <article className="rounded-[2rem] border border-slate-200 bg-[#F8FCFF] p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
        <Icon size={28} />
      </div>
      <h3 className="mt-5 text-xl font-black text-[#020B1F]">{item.title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
    </article>
  );
}