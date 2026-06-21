import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers3,
  Users,
  Globe2,
  Network,
} from "lucide-react";
import Button from "../components/ui/Button";
import { servicePillars } from "../data/services";
import ServiceExplorerPreview from "../components/sections/ServiceExplorerPreview";
import LeadCaptureSection from "../components/sections/LeadCaptureSection";
import { siteConfig } from "../data/site";
import SEO from "../components/seo/SEO";

const trustItems = [
  "Registered South African technology company",
  "Level 1 B-BBEE Contributor",
  "Software, IT infrastructure and digital business support",
  "Google Workspace-enabled business operations",
];

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
    label: "Brand Promise",
    value: "Value",
  },
];

export default function Home() {
  return (
    
    <>
    <SEO
      title="MKETICS | Software, IT Infrastructure & Digital Business Solutions"
      description="MKETICS builds smart digital systems, strengthens IT infrastructure and supports businesses with software, websites, digital tools and smart technology solutions."
        path="/"
    />
      <section className="relative isolate overflow-hidden bg-[#020B1F]">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-400/20 blur-[120px]" />
          <div className="absolute right-0 top-28 h-[420px] w-[420px] rounded-full bg-blue-600/20 blur-[130px]" />
          <div className="absolute bottom-0 left-0 h-[380px] w-[380px] rounded-full bg-sky-300/10 blur-[120px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(25,217,255,0.12),transparent_35%),linear-gradient(180deg,rgba(2,11,31,0.2),#020B1F_90%)]" />
        </div>

        <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-24 lg:pt-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-white/5 px-4 py-2 text-sm text-cyan-100 shadow-[0_0_40px_rgba(25,217,255,0.12)]">
              <Sparkles size={16} />
              {siteConfig.tagline}
            </div>

            <h1 className="mt-7 max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-7xl">
              Smart Digital Systems for{" "}
              <span className="bg-gradient-to-r from-cyan-200 via-[#19D9FF] to-[#0B7CFF] bg-clip-text text-transparent">
                Stronger Businesses
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              MKETICS builds modern websites, business systems, IT
              infrastructure, digital business tools and smart technology
              solutions that help organisations operate better, connect people
              and grow with confidence.
            </p>

            <p className="mt-4 max-w-2xl text-base leading-7 text-cyan-100/90">
              Purpose-driven technology built with innovation, Ubuntu and
              long-term value.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button to="/contact">Request a Quote</Button>
              <Button to="/services" variant="secondary">
                Explore Services
              </Button>
              <Button href={siteConfig.whatsapp} variant="secondary">
                Book a Consultation
              </Button>
            </div>

            <p className="mt-4 text-sm text-slate-400">
              Tell us what you need. We will review your request and guide you
              on the best next step.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur"
                >
                  <p className="text-3xl font-black text-white">{item.value}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-cyan-300/20 via-blue-500/10 to-transparent blur-2xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#061A33]/80 p-6 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
                    MKETICS System
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-white">
                    Digital Business Hub
                  </h2>
                </div>
                <div className="grid h-14 w-14 place-items-center rounded-2xl border border-cyan-300/30 bg-cyan-400/10 text-cyan-200">
                  <Layers3 size={28} />
                </div>
              </div>

              <div className="mt-6 grid gap-4">
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
                  text="Use documents, automation and digital workflows to improve readiness."
                />
              </div>

              <div className="mt-6 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
                <p className="text-sm font-semibold text-cyan-100">
                  Recommended starting point
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  Request a guided consultation
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  We help you choose the right solution, scope and development
                  path before work starts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#061A33]">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-6 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item) => (
            <div key={item} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 shrink-0 text-cyan-300" size={20} />
              <p className="text-sm leading-6 text-slate-200">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#EAF6FF] px-5 py-16 text-[#061A33] lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
              Core Services
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Technology Services Built Around Real Business Needs
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-700">
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
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#061A33] text-cyan-300 shadow-[0_0_30px_rgba(0,174,239,0.18)]">
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

        <ServiceExplorerPreview />
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