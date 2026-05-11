import { motion } from "framer-motion";

import {
  ArrowRight,
  CheckCircle2,
  Cloud,
  Code2,
  Network,
  ShieldCheck,
  Sparkles,
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

export default function Hero() {
  return (
    <section className="relative overflow-hidden app-bg">
      {/* BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-sky-500/15 blur-3xl dark:bg-sky-500/20" />

        <div className="absolute bottom-0 right-0 h-[350px] w-[350px] rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100svh-88px)] max-w-7xl items-center gap-16 px-4 py-20 sm:py-24 lg:grid-cols-2 lg:gap-20">
        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* BADGE */}
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-5 py-2 text-sm font-bold text-sky-600 dark:text-sky-300">
            <ShieldCheck className="h-4 w-4" />

            Enterprise Technology Solutions
          </div>

          {/* HEADING */}
          <h1 className="mt-8 text-5xl font-black leading-[1.05] text-slate-950 dark:text-white sm:text-6xl lg:text-7xl">
            Building
            <span className="bg-gradient-to-r from-sky-500 to-blue-700 bg-clip-text text-transparent dark:from-sky-400 dark:to-blue-500">
              {" "}
              Modern Business
            </span>
            <br />
            Systems &
            <br />
            Digital Infrastructure
          </h1>

          {/* DESCRIPTION */}
          <p className="mt-8 max-w-2xl text-lg leading-8 app-muted">
            MKETICS delivers enterprise software systems,
            networking infrastructure, cloud solutions,
            digital platforms, and modern business
            technology built for scalability and growth.
          </p>

          {/* TRUST */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              "Enterprise-ready systems",
              "South African business",
              "Cloud & infrastructure solutions",
              "Professional digital support",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3"
              >
                <CheckCircle2 className="h-5 w-5 text-sky-500" />

                <span className="text-sm font-bold app-muted">
                  {item}
                </span>
              </div>
            ))}
          </div>

          {/* BUTTONS */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="/#quote"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-sky-500 px-8 py-4 text-sm font-black text-white transition hover:bg-sky-400"
            >
              Request Quote

              <ArrowRight className="h-4 w-4" />
            </a>

            <a
              href="/services"
              className="inline-flex items-center justify-center gap-3 rounded-full border border-slate-200 bg-white px-8 py-4 text-sm font-black text-slate-900 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Explore Services
            </a>
          </div>

          {/* HIGHLIGHTS */}
          <div className="mt-14 grid gap-5 sm:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="glass-card rounded-[2rem] p-5 transition duration-300 hover:-translate-y-1"
              >
                <item.icon className="h-7 w-7 text-sky-500 dark:text-sky-300" />

                <div className="mt-4 text-lg font-black text-slate-950 dark:text-white">
                  {item.title}
                </div>

                <div className="mt-1 text-sm app-subtle">
                  {item.subtitle}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9 }}
          className="relative flex items-center justify-center"
        >
          {/* GLOW */}
          <div className="absolute h-[450px] w-[450px] rounded-full bg-sky-500/20 blur-3xl" />

          {/* MAIN CARD */}
          <div className="glass-card relative w-full max-w-2xl overflow-hidden rounded-[3rem] p-8 sm:p-10">
            {/* TOP */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-500">
                  MKETICS
                </p>

                <h2 className="mt-3 text-3xl font-black">
                  Enterprise Platform
                </h2>
              </div>

              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-sky-500/10 text-sky-500">
                <Cloud className="h-8 w-8" />
              </div>
            </div>

            {/* LOGO */}
            <div className="mt-10">
              <img
                src="/images/logo-detailed.webp?v=2"
                alt="MKETICS"
                className="mx-auto w-full max-w-xl object-contain drop-shadow-[0_0_35px_rgba(14,165,233,0.25)]"
              />
            </div>

            {/* STATUS */}
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ["Systems", "Active"],
                ["Infrastructure", "Connected"],
                ["Cloud", "Ready"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl app-surface p-4"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.2em] app-subtle">
                    {label}
                  </p>

                  <p className="mt-2 text-lg font-black text-sky-500">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* FOOTER */}
            <p className="mt-8 text-center text-sm font-bold uppercase tracking-[0.3em] text-sky-600 dark:text-sky-300">
              Innovate • Integrate • Elevate
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}