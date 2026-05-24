import { motion } from "framer-motion";

import {
  ArrowRight,
  CheckCircle2,
  Cloud,
  Code2,
  Network,
  ShieldCheck,
  Sparkles,
  Rocket,
  MessageCircle,
} from "lucide-react";

const highlights = [
  {
    title: "Software Systems",
    subtitle: "Platforms • Portals • Automation",
    icon: Code2,
  },
  {
    title: "Infrastructure",
    subtitle: "Networking • CCTV • Cloud",
    icon: Network,
  },
  {
    title: "Digital Innovation",
    subtitle: "Web • Branding • Growth",
    icon: Sparkles,
  },
];

const trustItems = [
  "Enterprise-ready systems",
  "South African registered business",
  "Cloud & infrastructure solutions",
  "Professional support",
];

export default function Hero() {
  const whatsappText = encodeURIComponent(
    "Hi MKETICS, I would like to discuss a technology project."
  );

  return (
    <section className="relative overflow-hidden app-bg">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[720px] w-[720px] -translate-x-1/2 rounded-full bg-sky-500/15 blur-3xl dark:bg-sky-500/20" />
        <div className="absolute bottom-10 right-0 h-[360px] w-[360px] rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100svh-76px)] max-w-7xl items-center gap-12 px-4 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-5 py-2 text-sm font-black text-sky-600 dark:text-sky-300">
            <ShieldCheck className="h-4 w-4" />
            Enterprise IT • SaaS • Digital Systems
          </div>

          <h1 className="mt-7 max-w-5xl text-4xl font-black leading-[1.05] text-slate-950 dark:text-white sm:text-5xl lg:text-7xl">
            Build smarter business systems with{" "}
            <span className="bg-gradient-to-r from-sky-500 to-cyan-400 bg-clip-text text-transparent">
              MKETICS
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 app-muted">
            MKETICS helps businesses launch professional software systems,
            client portals, IT infrastructure, cloud workflows, SaaS automation,
            websites and digital platforms built for growth.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {trustItems.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                <span className="text-sm font-bold app-muted">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <a
              href="/#quote"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-sky-500 px-8 py-4 font-black text-white shadow-xl transition hover:bg-sky-400"
            >
              Request Quote
              <ArrowRight className="h-5 w-5" />
            </a>

            <a
              href="/start-trial"
              className="inline-flex items-center justify-center gap-3 rounded-full border border-sky-400/20 bg-sky-500/10 px-8 py-4 font-black text-sky-600 transition hover:bg-sky-500/20 dark:text-sky-200"
            >
              <Rocket className="h-5 w-5" />
              Start SaaS Trial
            </a>

            <a
              href={`https://wa.me/27722864367?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 rounded-full border border-green-400/20 bg-green-500/10 px-8 py-4 font-black text-green-600 transition hover:bg-green-500/20 dark:text-green-300"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp
            </a>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="glass-card rounded-[2rem] p-5 transition duration-300 hover:-translate-y-1 hover:border-sky-400/40"
                >
                  <Icon className="h-7 w-7 text-sky-500 dark:text-sky-300" />

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
          className="relative flex items-center justify-center"
        >
          <div className="absolute h-[420px] w-[420px] rounded-full bg-sky-500/20 blur-3xl" />

          <div className="glass-card relative w-full max-w-2xl overflow-hidden rounded-[3rem] p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-500">
                  MKETICS Platform
                </p>

                <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                  Enterprise Command Center
                </h2>
              </div>

              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-sky-500/10 text-sky-500">
                <Cloud className="h-7 w-7" />
              </div>
            </div>

            <div className="mt-8 rounded-[2rem] bg-white/5 p-5">
              <img
                src="/images/logo-detailed.webp?v=2"
                alt="MKETICS"
                className="mx-auto w-full max-w-lg object-contain drop-shadow-[0_0_35px_rgba(14,165,233,0.25)]"
              />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                ["Proposals", "AI Ready"],
                ["Invoices", "Automated"],
                ["Clients", "Portal"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl app-surface p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] app-subtle">
                    {label}
                  </p>

                  <p className="mt-2 text-lg font-black text-sky-500">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-sky-400/20 bg-sky-500/10 p-5">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-sky-500">
                Live Business Stack
              </p>

              <p className="mt-3 leading-7 app-muted">
                CRM, client portals, invoices, proposals, support, analytics,
                workspace security and SaaS billing in one ecosystem.
              </p>
            </div>

            <p className="mt-7 text-center text-sm font-bold uppercase tracking-[0.3em] text-sky-600 dark:text-sky-300">
              Innovate • Integrate • Elevate
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
