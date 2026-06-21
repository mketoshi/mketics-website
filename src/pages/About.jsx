import {
  ArrowRight,
  Sparkles,
  Target,
  Eye,
  HeartHandshake,
  Lightbulb,
  ShieldCheck,
  Users,
  Cpu,
  CheckCircle2,
  Building2,
  Globe2,
} from "lucide-react";

export default function About() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#020817] text-white">
      <header className="border-b border-cyan-400/15 bg-[#020817]/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-400/10 text-sm font-black text-cyan-200">
              M
            </span>
            <span className="text-xl font-black tracking-wide text-cyan-300">
              MKETICS
            </span>
          </a>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-200 md:flex">
            <a href="/" className="transition hover:text-cyan-300">Home</a>
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

      <section className="relative px-6 pb-20 pt-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[130px]" />
          <div className="absolute right-0 top-32 h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-[120px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.04)_1px,transparent_1px)] bg-[size:72px_72px]" />
        </div>

        <div className="mx-auto max-w-7xl">
          <a
            href="/"
            className="inline-flex items-center text-sm font-bold text-cyan-300 transition hover:text-cyan-100"
          >
            ← Back to Home
          </a>

          <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-center">
            <div>
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">
                <Sparkles size={16} />
                About MKETICS
              </div>

              <h1 className="max-w-5xl text-5xl font-black leading-tight tracking-tight md:text-7xl">
                Technology built with{" "}
                <span className="bg-gradient-to-r from-cyan-200 via-white to-cyan-300 bg-clip-text text-transparent">
                  purpose, Ubuntu and value.
                </span>
              </h1>

              <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300">
                MKETICS is a digital technology company focused on creating
                smart systems, strengthening businesses, connecting people and
                delivering long-term value through innovation, practical
                engineering and people-centred thinking.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a
                  href="/services"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-7 py-4 font-black text-slate-950 shadow-[0_0_45px_rgba(34,211,238,0.25)] transition hover:bg-cyan-300"
                >
                  Explore Services <ArrowRight size={18} />
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-slate-500/50 px-7 py-4 font-bold text-slate-100 transition hover:border-cyan-300 hover:text-cyan-200"
                >
                  Contact MKETICS
                </a>
              </div>
            </div>

            <div className="rounded-[2rem] border border-cyan-300/20 bg-white/[0.05] p-6 backdrop-blur-xl">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
                Company Meaning
              </p>
              <h2 className="mt-4 text-3xl font-black leading-tight">
                Modern Knowledge Engineering, Technology & Innovative
                Commercial Solutions
              </h2>
              <p className="mt-5 leading-8 text-slate-300">
                The name MKETICS reflects a company built around knowledge,
                engineering, technology, innovation and commercial value.
              </p>

              <div className="mt-6 grid gap-4">
                <MeaningItem icon={<Cpu />} text="Modern digital systems" />
                <MeaningItem icon={<Lightbulb />} text="Knowledge-driven innovation" />
                <MeaningItem icon={<Globe2 />} text="Commercial solutions for growth" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-6 lg:grid-cols-3">
          <PurposeCard
            icon={<Target />}
            title="Our Purpose"
            text="To create smart digital systems, strengthen businesses, connect people and inspire unity through innovation, Ubuntu and long-term value."
          />
          <PurposeCard
            icon={<Eye />}
            title="Our Vision"
            text="To become a trusted technology partner for businesses, institutions and individuals who need practical digital solutions that improve operations and unlock growth."
          />
          <PurposeCard
            icon={<HeartHandshake />}
            title="Our Philosophy"
            text="MKETICS believes technology should serve people. Every solution should be useful, clear, reliable and connected to real-world value."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
              What We Stand For
            </p>
            <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
              A serious digital company with a people-first foundation.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              MKETICS combines technical skill, business understanding and
              Ubuntu-inspired thinking to help clients move from ideas to
              working digital solutions.
            </p>
          </div>

          <div className="grid gap-5">
            <ValueRow
              icon={<Lightbulb />}
              title="Innovation"
              text="We design solutions that help clients operate smarter, faster and more confidently."
            />
            <ValueRow
              icon={<Users />}
              title="Ubuntu"
              text="We believe technology should connect people, support communities and create shared value."
            />
            <ValueRow
              icon={<ShieldCheck />}
              title="Reliability"
              text="We aim to deliver practical systems that are structured, secure and maintainable."
            />
            <ValueRow
              icon={<Building2 />}
              title="Commercial Value"
              text="We focus on solutions that support business growth, operations and long-term sustainability."
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-[2rem] border border-cyan-300/20 bg-white/[0.04] p-8 md:p-10">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
              How MKETICS Helps
            </p>
            <h2 className="mt-4 text-4xl font-black">
              From digital presence to full business systems.
            </h2>
            <p className="mt-5 leading-8 text-slate-300">
              MKETICS supports clients across different stages of their digital
              journey, whether they are starting, improving, automating or
              scaling.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <HelpItem text="Helping businesses build professional websites and online stores." />
            <HelpItem text="Designing custom systems, portals, dashboards and workflow tools." />
            <HelpItem text="Supporting IT infrastructure, networks, devices and cloud tools." />
            <HelpItem text="Assisting businesses with digital readiness, registration support and compliance health checks." />
            <HelpItem text="Planning smart security and IP camera technology concepts." />
            <HelpItem text="Supporting growth through digital marketing and business-focused digital tools." />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-28">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-cyan-300/20 bg-cyan-400/10 p-10 md:p-14">
          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-cyan-300/20 blur-[100px]" />
          <div className="relative max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-200">
              Work With MKETICS
            </p>
            <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
              Let’s build technology that supports real growth.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-200">
              Whether you need a website, business system, infrastructure
              support or digital business solution, MKETICS can help you plan
              and build with clarity.
            </p>
            <a
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-cyan-300 px-7 py-4 font-black text-slate-950 transition hover:bg-white"
            >
              Start a Conversation <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

function MeaningItem({ icon, text }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-400/10 text-cyan-200">
        {icon}
      </span>
      <span className="font-bold text-slate-100">{text}</span>
    </div>
  );
}

function PurposeCard({ icon, title, text }) {
  return (
    <article className="rounded-[2rem] border border-cyan-300/20 bg-white/[0.04] p-7 transition hover:-translate-y-1 hover:border-cyan-300/45 hover:bg-cyan-400/[0.06]">
      <div className="mb-6 inline-flex rounded-2xl border border-cyan-300/30 bg-cyan-400/10 p-4 text-cyan-200">
        {icon}
      </div>
      <h3 className="text-2xl font-black">{title}</h3>
      <p className="mt-4 leading-7 text-slate-300">{text}</p>
    </article>
  );
}

function ValueRow({ icon, title, text }) {
  return (
    <div className="flex gap-5 rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-cyan-300/35">
      <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-400/10 p-3 text-cyan-200">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-black">{title}</h3>
        <p className="mt-2 leading-7 text-slate-300">{text}</p>
      </div>
    </div>
  );
}

function HelpItem({ text }) {
  return (
    <div className="flex gap-4 rounded-3xl border border-white/10 bg-[#020817]/60 p-5">
      <CheckCircle2 className="mt-1 shrink-0 text-cyan-300" size={20} />
      <p className="leading-7 text-slate-300">{text}</p>
    </div>
  );
}