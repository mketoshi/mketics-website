import { ArrowRight, ShieldCheck, Code2, Server, BriefcaseBusiness } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen text-white">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-cyan-400/20 bg-[#020817]/85 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="/" className="text-xl font-black tracking-wide text-cyan-300">MKETICS</a>
          <div className="hidden items-center gap-8 text-sm text-slate-200 md:flex">
            <a href="/about" className="hover:text-cyan-300">About</a>
            <a href="/services" className="hover:text-cyan-300">Services</a>
            <a href="/projects" className="hover:text-cyan-300">Projects</a>
            <a href="/resources" className="hover:text-cyan-300">Resources</a>
            <a href="/contact" className="hover:text-cyan-300">Contact</a>
          </div>
          <a href="/contact" className="rounded-full border border-cyan-300/40 bg-cyan-400/10 px-5 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-400/20">Request Quote</a>
        </nav>
      </header>

      <section className="relative overflow-hidden px-6 pb-24 pt-36">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300">Speak Innovation. Deliver Value.</p>
          <h1 className="max-w-5xl text-5xl font-black leading-tight tracking-tight md:text-7xl">Smart Digital Systems for Businesses, Institutions and Growth</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">MKETICS builds modern websites, business systems, IT infrastructure solutions, digital tools and smart technology services designed to strengthen operations through innovation, Ubuntu and long-term value.</p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a href="/contact" className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-7 py-4 font-bold text-slate-950 hover:bg-cyan-300">Request a Quote <ArrowRight size={18} /></a>
            <a href="/services" className="inline-flex items-center justify-center rounded-full border border-slate-500/50 px-7 py-4 font-bold text-slate-100 hover:border-cyan-300 hover:text-cyan-200">Explore Services</a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Core Service Pillars</p>
        <h2 className="mt-3 text-4xl font-black">Technology solutions built for real operations.</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <ServiceCard icon={<Code2 />} title="Software Engineering" text="Websites, portals, dashboards, online stores and custom business systems." />
          <ServiceCard icon={<Server />} title="IT Infrastructure" text="Network support, Wi-Fi, device setup, cloud tools and technical assistance." />
          <ServiceCard icon={<BriefcaseBusiness />} title="Digital Business Solutions" text="Business documents, digital tools, automation, branding and operational systems." />
          <ServiceCard icon={<ShieldCheck />} title="Security & Smart Technology" text="IP camera planning, cloud surveillance concepts and smart security consultation." />
        </div>
      </section>
    </main>
  );
}

function ServiceCard({ icon, title, text }) {
  return (
    <article className="rounded-3xl border border-cyan-300/20 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-cyan-300/50">
      <div className="mb-5 inline-flex rounded-2xl border border-cyan-300/30 bg-cyan-400/10 p-4 text-cyan-200">{icon}</div>
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-300">{text}</p>
    </article>
  );
}
