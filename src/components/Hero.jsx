import { motion } from "framer-motion";

import {
  ArrowRight,
  CheckCircle2,
  Cloud,
  Code2,
  Network,
  ShieldCheck,
  Sparkles,
  MessageCircle,
  MapPin,
  Wrench,
  Download,
} from "lucide-react";

const highlights = [
  {
    title: "Build",
    subtitle: "Websites • Portals • Business systems",
    icon: Code2,
  },
  {
    title: "Connect",
    subtitle: "Networks • Wi-Fi • Cloud setup",
    icon: Network,
  },
  {
    title: "Protect",
    subtitle: "CCTV • Access • Secure operations",
    icon: ShieldCheck,
  },
];

const trustItems = [
  "Founder-led service",
  "Practical South African support",
  "Clear proposals and documentation",
  "Built for long-term relationships",
];

const workflow = [
  ["01", "Understand", "We listen to the real problem before recommending technology."],
  ["02", "Design", "We map the right system, network, cloud or security solution."],
  ["03", "Deliver", "We build, install, document and support the solution."],
];

export default function Hero() {
  const whatsappText = encodeURIComponent(
    "Hi MKETICS, I would like to discuss a technology project."
  );

  return (
    <section className="relative overflow-hidden app-bg brand-grid-bg">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-16 top-10 h-[360px] w-[360px] rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[320px] w-[320px] rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:min-h-[calc(100svh-76px)] lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-sky-400/25 bg-sky-500/10 px-4 py-2 text-xs font-black text-sky-700 dark:text-sky-300 sm:px-5 sm:text-sm">
            <MapPin className="h-4 w-4" />
            South African IT • Software • Infrastructure Partner
          </div>

          <h1 className="mt-5 max-w-5xl text-[2.2rem] font-black leading-[1.02] tracking-tight text-slate-950 dark:text-white min-[380px]:text-[2.45rem] sm:mt-7 sm:text-5xl lg:text-7xl">
            Technology that supports your business, protects your assets and improves how you work.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 app-muted sm:mt-7 sm:text-lg sm:leading-8">
            MKETICS provides software development, IT infrastructure, cloud solutions, CCTV systems, websites and digital support for businesses, schools and individuals.
          </p>

          <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2">
            {trustItems.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl brand-outline-card p-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-sky-500" />
                <span className="text-sm font-bold app-muted">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:gap-4">
            <a
              href="/quote"
              className="mobile-full-button mketics-button-primary inline-flex items-center justify-center gap-3 rounded-full px-7 py-4 font-black transition sm:w-auto sm:px-8"
            >
              Request Quote
              <ArrowRight className="h-5 w-5" />
            </a>

            <a
              href="/services"
              className="mobile-full-button mketics-button-ghost inline-flex items-center justify-center gap-3 rounded-full px-7 py-4 font-black transition sm:w-auto sm:px-8"
            >
              Explore Services
              <ArrowRight className="h-5 w-5" />
            </a>

            <a
              href="/docs/MKETICS_Service_Catalogue.pdf"
              download
              className="mobile-full-button inline-flex items-center justify-center gap-3 rounded-full border border-sky-400/30 bg-sky-500/10 px-7 py-4 font-black text-sky-700 transition hover:bg-sky-500/20 dark:text-sky-200 sm:w-auto sm:px-8"
            >
              <Download className="h-5 w-5" />
              Download Catalogue
            </a>

            <a
              href={`https://wa.me/27722864367?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-full-button inline-flex items-center justify-center gap-3 rounded-full border border-green-400/25 bg-green-500/10 px-7 py-4 font-black text-green-700 transition hover:bg-green-500/20 dark:text-green-300 sm:w-auto sm:px-8"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp
            </a>
          </div>

          <div className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-3">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="mketics-card-pro mobile-card-padding rounded-[2rem] p-5 transition duration-300 hover:-translate-y-1 hover:border-sky-400/40"
                >
                  <span className="mketics-icon-box h-12 w-12"><Icon className="h-6 w-6" /></span>

                  <div className="mt-4 text-lg font-black text-slate-950 dark:text-white">
                    {item.title}
                  </div>

                  <div className="mt-1 text-sm app-subtle">
                    {item.subtitle}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9 }}
          className="relative hidden items-center justify-center lg:flex lg:min-w-0"
        >
          <div className="brand-dashboard-card relative w-full max-w-2xl overflow-hidden rounded-[3rem] p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-sky-500">
                  MKETICS Method
                </p>

                <h2 className="mt-3 text-3xl font-black">
                  Understand. Build. Support.
                </h2>
              </div>

              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-sky-500/10 text-sky-500">
                <Cloud className="h-7 w-7" />
              </div>
            </div>

            <div className="mt-8 rounded-[2rem] bg-slate-950 p-6 text-white dark:bg-white/5">
              <div className="flex items-center gap-4">
                <img
                  src="/images/logo-icon.webp?v=2"
                  alt="MKETICS"
                  className="h-16 w-16 object-contain drop-shadow-[0_0_35px_rgba(14,165,233,0.35)]"
                />
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-300">
                    Speak Innovation. Deliver Value.
                  </p>
                  <p className="mt-2 text-2xl font-black">Real systems for real work</p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {workflow.map(([number, title, text]) => (
                <div key={number} className="grid grid-cols-[56px_1fr] gap-4 rounded-2xl app-surface p-4">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-500 text-sm font-black text-white">
                    {number}
                  </div>
                  <div>
                    <p className="font-black text-slate-950 dark:text-white">{title}</p>
                    <p className="mt-1 text-sm leading-6 app-muted">{text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                [Wrench, "Support", "After delivery"],
                [Network, "Sites", "Remote & onsite"],
                [ShieldCheck, "Security", "Built in"],
              ].map(([Icon, label, value]) => (
                <div key={label} className="rounded-2xl border border-sky-400/20 bg-sky-500/10 p-4">
                  <Icon className="h-6 w-6 text-sky-500" />
                  <p className="mt-3 text-sm font-black">{label}</p>
                  <p className="mt-1 text-xs app-subtle">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
