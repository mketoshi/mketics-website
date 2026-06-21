import {
  ArrowRight,
  Code2,
  Server,
  BriefcaseBusiness,
  ShieldCheck,
  Globe2,
  Store,
  LayoutDashboard,
  Network,
  Wifi,
  FileCheck2,
  Megaphone,
  Camera,
  Cpu,
  CheckCircle2,
} from "lucide-react";

import SEO from "../components/seo/SEO";

export default function Services() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#020817] text-white">
      <SEO
      title="MKETICS Services | Software, IT, Digital Business & Smart Security"
      description="Explore MKETICS services including software development, websites, IT infrastructure, digital business solutions, smart security technology and business readiness support."
      path="/services"
      />
      <section className="relative overflow-hidden bg-[#020B1F] px-5 py-9 text-white lg:py-16">
        <div className="mx-auto max-w-7xl">

          <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.32em] text-cyan-300">
                MKETICS Services
              </p>
              <h1 className="mt-5 max-w-4xl text-5xl font-black leading-tight tracking-tight md:text-7xl">
                Digital solutions for modern business operations.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
                MKETICS helps businesses, institutions and individuals build,
                improve and manage digital systems through software development,
                IT infrastructure, digital business support and smart technology.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-7 py-4 font-black text-slate-950 shadow-[0_0_45px_rgba(34,211,238,0.25)] transition hover:bg-cyan-300"
                >
                  Request a Quote <ArrowRight size={18} />
                </a>
                <a
                  href="#service-pillars"
                  className="inline-flex items-center justify-center rounded-full border border-slate-500/50 px-7 py-4 font-bold text-slate-100 transition hover:border-cyan-300 hover:text-cyan-200"
                >
                  View Service Pillars
                </a>
              </div>
            </div>

            <div className="rounded-[2rem] border border-cyan-300/20 bg-white/[0.05] p-6 backdrop-blur-xl">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
                Service Focus
              </p>
              <div className="mt-5 grid gap-4">
                <FocusItem text="Websites, portals and custom systems" />
                <FocusItem text="Networks, Wi-Fi and IT support" />
                <FocusItem text="Business registration and compliance readiness" />
                <FocusItem text="Digital marketing and smart technology" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="service-pillars" className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
            Core Service Pillars
          </p>
          <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
            Choose the support your business needs.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            Each pillar is designed to solve a practical business problem:
            visibility, automation, infrastructure, readiness, security or growth.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ServicePillar
            icon={<Code2 />}
            title="System Design & Development"
            description="For clients who need websites, portals, dashboards, online stores or custom business systems."
            items={[
              "Business websites and landing pages",
              "Online stores and product catalogues",
              "Client portals and admin dashboards",
              "Custom business systems and workflow tools",
              "System planning, scope documents and phased development",
            ]}
          />

          <ServicePillar
            icon={<Server />}
            title="IT & Network Infrastructure"
            description="For clients who need reliable technical support, network setup and digital infrastructure."
            items={[
              "Computer and device setup support",
              "Wi-Fi and network planning",
              "LAN support and troubleshooting",
              "Cloud tools and Microsoft 365 guidance",
              "Technical documentation and support planning",
            ]}
          />

          <ServicePillar
            icon={<BriefcaseBusiness />}
            title="Digital Hub"
            description="For entrepreneurs and businesses that need digital readiness, structure, branding and growth support."
            items={[
              "Business registration assistance",
              "Business compliance health check",
              "Digital documents and business profiles",
              "Digital marketing support",
              "Automation, forms and operational tools",
            ]}
          />

          <ServicePillar
            icon={<ShieldCheck />}
            title="Security & Smart Technology"
            description="For clients who need smarter security planning, IP camera concepts and connected technology."
            items={[
              "IP camera planning and consultation",
              "Cloud surveillance system concepts",
              "Smart security solution planning",
              "Remote monitoring concepts",
              "Technology risk and readiness advice",
            ]}
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-[2rem] border border-cyan-300/20 bg-white/[0.04] p-8 md:p-10">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
              Popular Solutions
            </p>
            <h2 className="mt-4 text-4xl font-black">
              Start with a clear solution.
            </h2>
            <p className="mt-5 leading-8 text-slate-300">
              These are common services clients can request directly from
              MKETICS.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <SolutionCard icon={<Globe2 />} title="Business Website" />
            <SolutionCard icon={<Store />} title="Online Store" />
            <SolutionCard icon={<LayoutDashboard />} title="Admin Dashboard" />
            <SolutionCard icon={<Network />} title="Network Support" />
            <SolutionCard icon={<Wifi />} title="Wi-Fi Planning" />
            <SolutionCard icon={<FileCheck2 />} title="Compliance Health Check" />
            <SolutionCard icon={<BriefcaseBusiness />} title="Business Registration Assistance" />
            <SolutionCard icon={<Megaphone />} title="Digital Marketing" />
            <SolutionCard icon={<Camera />} title="IP Camera Planning" />
            <SolutionCard icon={<Cpu />} title="Smart Technology Consultation" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
              How We Work
            </p>
            <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
              A simple process from idea to delivery.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              MKETICS uses a clear process so clients understand what will be
              delivered, how it will be delivered and what comes next.
            </p>
          </div>

          <div className="grid gap-5">
            <ProcessStep
              number="01"
              title="Understand the need"
              text="We clarify your problem, goal, budget, timeline and expected outcome."
            />
            <ProcessStep
              number="02"
              title="Define the scope"
              text="We prepare a clear service scope so both sides understand what is included."
            />
            <ProcessStep
              number="03"
              title="Design and build"
              text="We create the solution using a professional structure and practical delivery approach."
            />
            <ProcessStep
              number="04"
              title="Support and improve"
              text="We help you maintain, improve and grow the solution over time where required."
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-28">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-cyan-300/20 bg-cyan-400/10 p-10 md:p-14">
          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-cyan-300/20 blur-[100px]" />
          <div className="relative max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-200">
              Request a Service
            </p>
            <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
              Need a website, business system, IT support or digital solution?
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-200">
              Send MKETICS your idea or business need, and we will help you
              choose the right service path.
            </p>
            <a
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-cyan-300 px-7 py-4 font-black text-slate-950 transition hover:bg-white"
            >
              Start a Request <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

function ServicePillar({ icon, title, description, items }) {
  return (
    <article className="rounded-[2rem] border border-cyan-300/20 bg-white/[0.04] p-7 transition hover:-translate-y-1 hover:border-cyan-300/45 hover:bg-cyan-400/[0.06]">
      <div className="mb-6 inline-flex rounded-2xl border border-cyan-300/30 bg-cyan-400/10 p-4 text-cyan-200">
        {icon}
      </div>
      <h3 className="text-2xl font-black">{title}</h3>
      <p className="mt-4 leading-7 text-slate-300">{description}</p>

      <ul className="mt-6 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-slate-300">
            <CheckCircle2 className="mt-0.5 shrink-0 text-cyan-300" size={18} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function SolutionCard({ icon, title }) {
  return (
    <a
      href="/contact"
      className="flex items-center gap-4 rounded-3xl border border-white/10 bg-[#020817]/60 p-5 transition hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-cyan-400/10"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-400/10 text-cyan-200">
        {icon}
      </span>
      <span className="font-bold text-slate-100">{title}</span>
    </a>
  );
}

function ProcessStep({ number, title, text }) {
  return (
    <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:grid-cols-[80px_1fr]">
      <div className="text-3xl font-black text-cyan-300">{number}</div>
      <div>
        <h3 className="text-xl font-black">{title}</h3>
        <p className="mt-2 leading-7 text-slate-300">{text}</p>
      </div>
    </div>
  );
}

function FocusItem({ text }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <CheckCircle2 className="mt-0.5 shrink-0 text-cyan-300" size={18} />
      <p className="text-sm leading-6 text-slate-300">{text}</p>
    </div>
  );
}