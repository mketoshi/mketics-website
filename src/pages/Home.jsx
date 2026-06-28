import {
  ArrowRight,
  CheckCircle2,
  Globe2,
  Layers3,
  Network,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import SEO from "../components/seo/SEO";
import { seoPages } from "../data/seo";
import Button from "../components/ui/Button";
import { servicePillars } from "../data/services";
import ServiceExplorerPreview from "../components/sections/ServiceExplorerPreview";
import LeadCaptureSection from "../components/sections/LeadCaptureSection";
import TrustCredibility from "../components/sections/TrustCredibility";
import ServiceLandingCTAs from "../components/sections/ServiceLandingCTAs";
import { siteConfig } from "../data/site";
import { createWhatsAppLink, whatsappMessages } from "../utils/whatsapp";

const stats = [
  {
    label: "Core Service Pillars",
    value: "4",
  },
  {
    label: "Business Technology Focus",
    value: "360°",
  },
  {
    label: "B-BBEE Contributor",
    value: "Level 1",
  },
];

const trustItems = [
  "Registered South African technology company",
  "Software, IT infrastructure and digital business support",
  "Professional quote and consultation flow",
  "Built around innovation, Ubuntu and long-term value",
];

const outcomes = [
  {
    title: "Build",
    text: "Websites, portals, systems and digital platforms that support real business operations.",
    icon: Layers3,
  },
  {
    title: "Strengthen",
    text: "IT infrastructure, networks, cloud tools and digital environments that help teams work better.",
    icon: Network,
  },
  {
    title: "Protect",
    text: "Smart security planning, safer digital practices and technology guidance before investment.",
    icon: ShieldCheck,
  },
  {
    title: "Grow",
    text: "Digital business support, documents, online presence and readiness services for serious growth.",
    icon: Zap,
  },
];

export default function Home() {
  return (
    <>
      <SEO {...seoPages.home} />

      <section className="relative isolate overflow-hidden bg-[#020B1F] px-5 py-16 text-white lg:py-24">
        <div className="absolute inset-0 -z-10">
          <img
            src="/assets/mketics-bg3.webp"
            alt=""
            aria-hidden="true"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="hidden h-full w-full object-cover opacity-45 lg:block"
          />
          <div className="absolute inset-0 bg-[#020B1F]/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020B1F] via-[#020B1F]/85 to-[#020B1F]/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020B1F]/20 via-transparent to-[#020B1F]" />
          <div className="absolute left-1/2 top-0 hidden h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-cyan-400/15 blur-[140px] lg:block" />
          <div className="absolute right-0 top-24 hidden h-[430px] w-[430px] rounded-full bg-blue-600/15 blur-[120px] lg:block" />
        </div>

        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-white/[0.05] px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-cyan-200 shadow-[0_0_22px_rgba(25,217,255,0.16)] lg:shadow-[0_0_40px_rgba(25,217,255,0.12)]">
              <Sparkles size={16} />
              {siteConfig.tagline}
            </div>

            <h1 className="mt-7 max-w-5xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-7xl">
              Smart digital systems for{" "}
              <span className="bg-gradient-to-r from-cyan-200 via-white to-cyan-300 bg-clip-text text-transparent">
                stronger businesses.
              </span>
            </h1>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300">
              MKETICS helps businesses, schools and organisations build modern
              websites, custom systems, IT infrastructure, digital business
              tools and smart technology solutions that improve operations and
              create long-term value.
            </p>

            <p className="mt-4 max-w-3xl text-base leading-7 text-cyan-100/90">
              Purpose-driven technology built with innovation, Ubuntu, clarity
              and professional execution.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Button to="/contact">
                Request a Quote
                <ArrowRight size={18} className="ml-2" />
              </Button>

              <Button to="/services" variant="secondary">
                Explore Services
              </Button>

              <a
                href={createWhatsAppLink(whatsappMessages.general)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-cyan-300/40 bg-white/[0.06] px-6 py-3 font-black text-white transition hover:border-cyan-300 hover:bg-cyan-300 hover:text-[#061A33]"
              >
                Chat on WhatsApp
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border border-cyan-300/15 bg-white/[0.05] p-5 backdrop-blur-xl"
                >
                  <p className="text-3xl font-black text-white">
                    {item.value}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 hidden rounded-[2.5rem] bg-gradient-to-br from-cyan-300/20 via-blue-500/10 to-transparent blur-2xl lg:block" />

            <div className="relative overflow-hidden rounded-[2.5rem] border border-cyan-300/20 bg-[#061A33]/75 p-6 shadow-lg backdrop-blur-xl lg:shadow-2xl">
              <div className="absolute -right-20 -top-20 hidden h-72 w-72 rounded-full bg-cyan-300/15 blur-[100px] lg:block" />

              <div className="relative flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
                    MKETICS Digital Hub
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-white">
                    Technology built around business value.
                  </h2>
                </div>

                <div className="grid h-14 w-14 place-items-center rounded-2xl border border-cyan-300/30 bg-cyan-400/10 text-cyan-200">
                  <Layers3 size={28} />
                </div>
              </div>

              <div className="relative mt-6 grid gap-4">
                <DashboardItem
                  icon={Globe2}
                  title="Websites & Portals"
                  text="Build a professional digital presence with useful client-facing systems."
                />
                <DashboardItem
                  icon={Network}
                  title="Infrastructure & Cloud"
                  text="Support connectivity, devices, business email and daily operations."
                />
                <DashboardItem
                  icon={Users}
                  title="Business Growth Tools"
                  text="Use documents, digital workflows and readiness services to improve operations."
                />
              </div>

              <div className="relative mt-6 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
                <p className="text-sm font-semibold text-cyan-100">
                  Recommended starting point
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  Request a guided consultation
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  We help you choose the right solution, scope, budget direction
                  and delivery path before serious work starts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-cyan-300/10 bg-[#061A33]">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-6 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item) => (
            <div key={item} className="flex items-start gap-3">
              <CheckCircle2
                className="mt-0.5 shrink-0 text-cyan-300"
                size={20}
              />
              <p className="text-sm leading-6 text-slate-200">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#EAF6FF] px-5 py-16 text-[#061A33] lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
                Core Services
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
                Technology services built around real business needs.
              </h2>
            </div>

            <p className="text-lg leading-8 text-slate-700">
              MKETICS focuses on practical digital solutions that support daily
              operations, improve visibility, strengthen communication and help
              organisations grow with confidence.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {servicePillars.map((service) => {
              const Icon = service.icon;

              return (
                <article
                  key={service.title}
                  className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl"
                >
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#061A33] text-cyan-300 shadow-[0_0_24px_rgba(0,174,239,0.16)] lg:shadow-[0_0_30px_rgba(0,174,239,0.18)]">
                    <Icon size={28} />
                  </div>

                  <h3 className="mt-6 text-xl font-black text-[#020B1F]">
                    {service.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {service.summary}
                  </p>

                  <p className="mt-4 rounded-2xl bg-[#EAF6FF] p-4 text-sm leading-6 text-slate-700">
                    {service.value}
                  </p>

                  <a
                    href={service.href}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#0B7CFF] transition group-hover:text-[#00AEEF]"
                  >
                    {service.cta}
                    <ArrowRight size={16} />
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <ServiceLandingCTAs
        variant="light"
        title="Start with the service you need most."
        description="Whether you need a website, business system, IT support, online store, digital readiness or smart security planning, MKETICS gives you a clear starting point."
      />

      <section className="relative isolate overflow-hidden bg-[#020B1F] px-5 py-16 text-white lg:py-24">
        <div className="absolute inset-0 -z-10">
          <img
            src="/assets/mketics-bg4.webp"
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="hidden h-full w-full object-cover object-center opacity-35 lg:block"
          />
          <div className="absolute inset-0 bg-[#020B1F]/75" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020B1F] via-[#020B1F]/80 to-[#020B1F]/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020B1F] via-transparent to-[#020B1F]" />
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
              What MKETICS helps you achieve
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              From idea to structured digital execution.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              The focus is not only design. The focus is better systems,
              stronger operations, clearer communication and useful technology.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {outcomes.map((item) => (
              <OutcomeCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      <ServiceExplorerPreview />

      <TrustCredibility
        variant="light"
        title="A technology partner with structure, purpose and credibility."
        description="MKETICS is built to support businesses, schools and organisations with professional technology services, clear communication and practical digital value."
      />

      <LeadCaptureSection />
    </>
  );
}

function DashboardItem({ icon: Icon, title, text }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-300">
          <Icon size={22} />
        </div>
        <div>
          <h3 className="font-bold text-white">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-300">{text}</p>
        </div>
      </div>
    </div>
  );
}

function OutcomeCard({ item }) {
  const Icon = item.icon;

  return (
    <article className="rounded-[2rem] border border-cyan-300/15 bg-white/[0.05] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/40">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-300">
        <Icon size={28} />
      </div>

      <h3 className="mt-5 text-xl font-black text-white">{item.title}</h3>

      <p className="mt-3 text-sm leading-7 text-slate-300">{item.text}</p>
    </article>
  );
}