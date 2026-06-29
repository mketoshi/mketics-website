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
    label: "Service Explorer Options",
    value: "54",
  },
  {
    label: "B-BBEE Contributor",
    value: "Level 1",
  },
];

const trustItems = [
  "Registered South African technology company",
  "Premium blue, silver and water-inspired digital brand",
  "Software, IT infrastructure and digital business support",
  "Built around innovation, Ubuntu and long-term value",
];

const outcomes = [
  {
    title: "Build",
    text: "Websites, portals, online stores, dashboards and business systems that support real operations.",
    icon: Layers3,
  },
  {
    title: "Strengthen",
    text: "IT support, cloud tools, networks, business email and office technology support for daily productivity.",
    icon: Network,
  },
  {
    title: "Protect",
    text: "Smart security planning, basic cybersecurity awareness and safer technology decisions before investment.",
    icon: ShieldCheck,
  },
  {
    title: "Grow",
    text: "Digital marketing, business documents, online visibility and readiness support for serious growth.",
    icon: Zap,
  },
];

const solutionPaths = [
  {
    title: "Digital Launch",
    subtitle: "For startups and growing businesses",
    text: "Start with a professional website, business email, company profile, Google visibility and a clean digital foundation.",
    icon: Globe2,
    points: [
      "Starter or Business Website",
      "Professional Business Email",
      "Company Profile Design",
      "Google Business Profile Setup",
    ],
  },
  {
    title: "Business Systems",
    subtitle: "For operations that need structure",
    text: "Move from manual work to dashboards, portals, booking tools, invoice tracking or custom business systems.",
    icon: Layers3,
    points: [
      "Custom Web Application",
      "Client Portal",
      "Admin Dashboard",
      "Business Management System",
    ],
  },
  {
    title: "Infrastructure Support",
    subtitle: "For offices, schools and teams",
    text: "Improve office technology, Wi-Fi, networks, cloud storage, devices and support processes with practical IT guidance.",
    icon: Network,
    points: [
      "Network & Wi-Fi Assessment",
      "IT Support",
      "Google Workspace Setup",
      "Monthly IT Support",
    ],
  },
];

const processSteps = [
  {
    number: "01",
    title: "Discover",
    text: "We understand your business, current challenge, goals, budget direction and urgency.",
  },
  {
    number: "02",
    title: "Recommend",
    text: "We guide you to the best starting service using the MKETICS Service Explorer and consultation flow.",
  },
  {
    number: "03",
    title: "Plan",
    text: "We define scope, deliverables, timeline, responsibilities and professional pricing before work begins.",
  },
  {
    number: "04",
    title: "Deliver",
    text: "We implement with clear communication, practical execution, testing and handover support.",
  },
];

const clientSegments = [
  "Small businesses that need a professional online presence",
  "Schools, colleges and institutions that need digital communication tools",
  "Private companies that need systems, dashboards or IT support",
  "Startups and individuals who need business readiness support",
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
          <div className="absolute inset-0 bg-[#020B1F]/72" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020B1F] via-[#020B1F]/88 to-[#020B1F]/45" />
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
              Premium digital systems for{" "}
              <span className="bg-gradient-to-r from-cyan-200 via-white to-cyan-300 bg-clip-text text-transparent">
                serious business growth.
              </span>
            </h1>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300">
              MKETICS helps businesses, schools, organisations and individuals
              build modern websites, custom systems, IT infrastructure, digital
              business tools, marketing support and smart technology solutions
              that improve operations and create long-term value.
            </p>

            <p className="mt-4 max-w-3xl text-base leading-7 text-cyan-100/90">
              Modern Knowledge Engineering, Technology & Innovative Commercial
              Solutions — built with innovation, Ubuntu, clarity and execution.
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
                    One brand. Multiple technology solutions.
                  </h2>
                </div>

                <div className="grid h-14 w-14 place-items-center rounded-2xl border border-cyan-300/30 bg-cyan-400/10 text-cyan-200">
                  <Layers3 size={28} />
                </div>
              </div>

              <div className="relative mt-6 grid gap-4">
                <DashboardItem
                  icon={Globe2}
                  title="Websites & Online Presence"
                  text="Starter websites, business websites, online stores, landing pages and catalogue websites."
                />
                <DashboardItem
                  icon={Layers3}
                  title="Systems & Portals"
                  text="Client portals, dashboards, invoice systems, booking systems and business management tools."
                />
                <DashboardItem
                  icon={Network}
                  title="IT, Cloud & Infrastructure"
                  text="IT support, networks, Wi-Fi, Google Workspace, Microsoft 365 and business email setup."
                />
                <DashboardItem
                  icon={Zap}
                  title="Marketing & Business Readiness"
                  text="Digital marketing, company profiles, business registration guidance and compliance readiness."
                />
              </div>

              <div className="relative mt-6 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
                <p className="text-sm font-semibold text-cyan-100">
                  Flagship website feature
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  Guided Service Explorer
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Visitors answer simple questions and receive a recommended
                  MKETICS service with a quote and WhatsApp action.
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
                Core Service Pillars
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
        description="Whether you need a website, system, IT support, online store, digital marketing, business readiness or smart security planning, MKETICS gives you a clear starting point."
      />

      <section
        className="bg-white px-5 py-16 text-[#061A33] lg:py-24"
        style={{
          contentVisibility: "auto",
          containIntrinsicSize: "900px",
        }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
              Solution Paths
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Choose a path that matches where your business is going.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-700">
              MKETICS does not only build isolated products. We help clients
              connect the right services into a practical digital growth path.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {solutionPaths.map((path) => (
              <SolutionPathCard key={path.title} path={path} />
            ))}
          </div>
        </div>
      </section>

      <section
        className="relative isolate overflow-hidden bg-[#020B1F] px-5 py-16 text-white lg:py-24"
        style={{
          contentVisibility: "auto",
          containIntrinsicSize: "900px",
        }}
      >
        <div className="absolute inset-0 -z-10">
          <img
            src="/assets/mketics-bg4.webp"
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="hidden h-full w-full object-cover object-center opacity-35 lg:block"
          />
          <div className="absolute inset-0 bg-[#020B1F]/78" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020B1F] via-[#020B1F]/82 to-[#020B1F]/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020B1F] via-transparent to-[#020B1F]" />
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
              What MKETICS Helps You Achieve
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              From idea to structured digital execution.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              The focus is not only design. The focus is better systems,
              stronger operations, clearer communication, safer decisions and
              useful technology.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {outcomes.map((item) => (
              <OutcomeCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section
        className="bg-[#EAF6FF] px-5 py-16 text-[#061A33] lg:py-24"
        style={{
          contentVisibility: "auto",
          containIntrinsicSize: "800px",
        }}
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
              Delivery Approach
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Clear process. Professional communication. Practical delivery.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-700">
              MKETICS follows a structured approach so clients understand what
              is being built, why it matters, what it includes, and how the work
              will move from idea to delivery.
            </p>

            <div className="mt-8 rounded-[2rem] border border-cyan-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#0B7CFF]">
                Best starting point
              </p>
              <p className="mt-3 text-2xl font-black text-[#020B1F]">
                Use the Service Explorer before requesting a quote.
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                The Service Explorer helps identify your recommended service,
                supporting services, readiness level and next step.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {processSteps.map((step) => (
              <article
                key={step.number}
                className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:border-cyan-300 hover:shadow-lg"
              >
                <div className="flex gap-5">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#061A33] text-lg font-black text-cyan-300">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#020B1F]">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {step.text}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ServiceExplorerPreview />

      <section
        className="bg-white px-5 py-16 text-[#061A33] lg:py-24"
        style={{
          contentVisibility: "auto",
          containIntrinsicSize: "700px",
        }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
                Who We Serve
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
                Built for clients who want technology with direction.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-700">
                MKETICS supports clients who want practical solutions, better
                structure, stronger presentation and long-term technology value.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {clientSegments.map((segment) => (
                <div
                  key={segment}
                  className="flex items-start gap-3 rounded-[1.5rem] border border-slate-200 bg-[#EAF6FF] p-5"
                >
                  <CheckCircle2
                    className="mt-0.5 shrink-0 text-[#0B7CFF]"
                    size={20}
                  />
                  <p className="text-sm font-semibold leading-7 text-slate-700">
                    {segment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

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

function SolutionPathCard({ path }) {
  const Icon = path.icon;

  return (
    <article className="group rounded-[2rem] border border-slate-200 bg-[#F8FCFF] p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:bg-white hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
          <Icon size={28} />
        </div>

        <span className="rounded-full border border-cyan-200 bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#0B7CFF]">
          Path
        </span>
      </div>

      <p className="mt-6 text-sm font-black uppercase tracking-[0.22em] text-[#0B7CFF]">
        {path.subtitle}
      </p>

      <h3 className="mt-3 text-2xl font-black text-[#020B1F]">
        {path.title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-600">{path.text}</p>

      <div className="mt-5 grid gap-3">
        {path.points.map((point) => (
          <div key={point} className="flex items-start gap-3">
            <CheckCircle2
              className="mt-0.5 shrink-0 text-[#0B7CFF]"
              size={18}
            />
            <p className="text-sm leading-6 text-slate-700">{point}</p>
          </div>
        ))}
      </div>

      <Button to="/contact" className="mt-6">
        Request This Path
        <ArrowRight size={16} className="ml-2" />
      </Button>
    </article>
  );
}