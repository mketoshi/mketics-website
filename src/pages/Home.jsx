import {
  ArrowRight,
  ShieldCheck,
  Code2,
  Server,
  BriefcaseBusiness,
  Sparkles,
  Globe2,
  Layers3,
  CheckCircle2,
  Cpu,
  Network,
  Store,
  FileCheck2,
  Megaphone,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#020817] text-white">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-cyan-400/15 bg-[#020817]/85 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="/" className="group flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-400/10 text-sm font-black text-cyan-200 shadow-[0_0_35px_rgba(34,211,238,0.18)]">
              M
            </span>
            <span className="text-xl font-black tracking-wide text-cyan-300">
              MKETICS
            </span>
          </a>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-200 md:flex">
            <a href="/about" className="transition hover:text-cyan-300">About</a>
            <a href="/services" className="transition hover:text-cyan-300">Services</a>
            <a href="/projects" className="transition hover:text-cyan-300">Projects</a>
            <a href="/resources" className="transition hover:text-cyan-300">Resources</a>
            <a href="/contact" className="transition hover:text-cyan-300">Contact</a>
          </div>

          <a
            href="/contact"
            className="rounded-full border border-cyan-300/40 bg-cyan-400/10 px-5 py-2 text-sm font-bold text-cyan-100 transition hover:bg-cyan-400/20"
          >
            Request Quote
          </a>
        </nav>
      </header>

      <section className="relative px-6 pb-28 pt-36">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[130px]" />
          <div className="absolute right-0 top-28 h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-[120px]" />
          <div className="absolute left-0 top-64 h-[360px] w-[360px] rounded-full bg-cyan-300/5 blur-[120px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.04)_1px,transparent_1px)] bg-[size:72px_72px]" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">
              <Sparkles size={16} />
              Speak Innovation. Deliver Value.
            </div>

            <h1 className="max-w-5xl text-5xl font-black leading-[1.03] tracking-tight md:text-7xl">
              Digital Systems Built for{" "}
              <span className="bg-gradient-to-r from-cyan-200 via-white to-cyan-300 bg-clip-text text-transparent">
                Smarter Business Growth
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
              MKETICS designs and develops modern websites, business systems,
              IT infrastructure, digital tools and smart technology solutions
              that help businesses, institutions and individuals operate with
              confidence, clarity and long-term value.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-7 py-4 font-black text-slate-950 shadow-[0_0_45px_rgba(34,211,238,0.25)] transition hover:bg-cyan-300"
              >
                Request a Quote <ArrowRight size={18} />
              </a>
              <a
                href="/services"
                className="inline-flex items-center justify-center rounded-full border border-slate-500/50 px-7 py-4 font-bold text-slate-100 transition hover:border-cyan-300 hover:text-cyan-200"
              >
                Explore Services
              </a>
            </div>

            <div className="mt-12 grid max-w-2xl gap-4 sm:grid-cols-3">
              <Stat value="4+" label="Core service pillars" />
              <Stat value="24/7" label="Digital-first thinking" />
              <Stat value="Ubuntu" label="People-centred innovation" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[3rem] bg-cyan-400/10 blur-3xl" />

            <div className="relative rounded-[2rem] border border-cyan-300/20 bg-white/[0.05] p-5 shadow-2xl backdrop-blur-xl">
              <div className="rounded-[1.6rem] border border-white/10 bg-[#030b1d]/90 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
                      MKETICS System Core
                    </p>
                    <h2 className="mt-2 text-2xl font-black">
                      One digital partner. Multiple solutions.
                    </h2>
                  </div>
                  <div className="rounded-2xl border border-cyan-300/30 bg-cyan-400/10 p-3 text-cyan-200">
                    <Cpu size={28} />
                  </div>
                </div>

                <div className="grid gap-4">
                  <HeroModule
                    icon={<Code2 />}
                    title="Software Engineering"
                    text="Websites, portals, dashboards and custom systems."
                  />
                  <HeroModule
                    icon={<Server />}
                    title="IT Infrastructure"
                    text="Networks, support, cloud tools and technical setup."
                  />
                  <HeroModule
                    icon={<BriefcaseBusiness />}
                    title="Digital Business Solutions"
                    text="Business registration, compliance readiness and digital tools."
                  />
                  <HeroModule
                    icon={<ShieldCheck />}
                    title="Security & Smart Technology"
                    text="IP camera planning, smart systems and cloud surveillance concepts."
                  />
                </div>

                <div className="mt-6 rounded-3xl border border-cyan-300/20 bg-cyan-400/10 p-5">
                  <p className="text-sm font-bold text-cyan-100">
                    Built around clarity, reliability, innovation and long-term
                    operational value.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
            Core Service Pillars
          </p>
          <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
            Practical technology solutions built for real operations.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            From websites and business systems to infrastructure, digital
            readiness and smart technology, MKETICS helps clients move from
            ideas to working solutions.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <ServiceCard
            icon={<Code2 />}
            title="System Design & Development"
            text="Modern websites, portals, dashboards, online stores and custom business systems."
          />
          <ServiceCard
            icon={<Server />}
            title="IT & Network Infrastructure"
            text="Network support, Wi-Fi planning, device setup, cloud tools and technical assistance."
          />
          <ServiceCard
            icon={<BriefcaseBusiness />}
            title="Digital Hub"
            text="Digital marketing, business registration assistance, documents, automation and business tools."
          />
          <ServiceCard
            icon={<ShieldCheck />}
            title="Security & Smart Technology"
            text="IP camera planning, cloud surveillance concepts and smart security consultation."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-[2rem] border border-cyan-300/20 bg-white/[0.04] p-8 md:p-10">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
                Service Explorer
              </p>
              <h2 className="mt-4 text-4xl font-black">
                Not sure what you need first?
              </h2>
              <p className="mt-5 leading-8 text-slate-300">
                Start with the outcome you want. MKETICS can guide you toward
                the right digital solution, whether you need visibility,
                automation, infrastructure, compliance readiness or a complete
                platform.
              </p>
              <a
                href="/services"
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-cyan-300/40 px-6 py-3 font-bold text-cyan-100 transition hover:bg-cyan-400/10"
              >
                View all services <ArrowRight size={17} />
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ExplorerCard icon={<Globe2 />} title="I need a website" />
              <ExplorerCard icon={<Layers3 />} title="I need a business system" />
              <ExplorerCard icon={<Network />} title="I need IT or network support" />
              <ExplorerCard icon={<Store />} title="I need an online store" />
              <ExplorerCard icon={<FileCheck2 />} title="I need compliance readiness" />
              <ExplorerCard icon={<Megaphone />} title="I need digital marketing" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
              Why MKETICS
            </p>
            <h2 className="mt-4 text-4xl font-black">
              Built with technology, guided by Ubuntu.
            </h2>
          </div>

          <div className="grid gap-5 lg:col-span-2">
            <Reason text="We build solutions that are practical, understandable and useful for real business operations." />
            <Reason text="We combine software, infrastructure, digital business support and smart technology under one brand." />
            <Reason text="We focus on long-term value, not just once-off design or temporary fixes." />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-28">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-cyan-300/20 bg-cyan-400/10 p-10 md:p-14">
          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-cyan-300/20 blur-[100px]" />
          <div className="relative max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-200">
              Build with MKETICS
            </p>
            <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
              Ready to turn your idea into a smart digital system?
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-200">
              Let’s plan the right solution for your business, institution or
              personal project with a clear scope, professional structure and
              long-term value.
            </p>
            <a
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-cyan-300 px-7 py-4 font-black text-slate-950 transition hover:bg-white"
            >
              Request a Quote <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

function HeroModule({ icon, title, text }) {
  return (
    <div className="flex gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-cyan-300/40">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-400/10 text-cyan-200">
        {icon}
      </div>
      <div>
        <h3 className="font-black text-white">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-300">{text}</p>
      </div>
    </div>
  );
}

function ServiceCard({ icon, title, text }) {
  return (
    <article className="group rounded-3xl border border-cyan-300/20 bg-white/[0.04] p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/50 hover:bg-cyan-400/[0.06]">
      <div className="mb-5 inline-flex rounded-2xl border border-cyan-300/30 bg-cyan-400/10 p-4 text-cyan-200 transition group-hover:shadow-[0_0_35px_rgba(34,211,238,0.18)]">
        {icon}
      </div>
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-300">{text}</p>
    </article>
  );
}

function ExplorerCard({ icon, title }) {
  return (
    <a
      href="/services"
      className="flex items-center gap-4 rounded-3xl border border-white/10 bg-[#020817]/60 p-5 transition hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-cyan-400/10"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-400/10 text-cyan-200">
        {icon}
      </span>
      <span className="font-bold text-slate-100">{title}</span>
    </a>
  );
}

function Reason({ text }) {
  return (
    <div className="flex gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <CheckCircle2 className="mt-1 shrink-0 text-cyan-300" size={22} />
      <p className="leading-7 text-slate-300">{text}</p>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="rounded-3xl border border-cyan-300/20 bg-white/[0.04] p-5">
      <p className="text-2xl font-black text-cyan-200">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{label}</p>
    </div>
  );
}