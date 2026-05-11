import { motion } from "framer-motion";

import {
  ArrowRight,
  Code2,
  Network,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden app-bg">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.18),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.28),transparent_55%)]" />

      <div className="relative mx-auto grid min-h-[calc(100svh-88px)] max-w-7xl items-center gap-16 px-4 py-24 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-5 py-2 text-sm font-bold text-sky-600 dark:text-sky-300">
            <ShieldCheck className="h-4 w-4" />
            Enterprise Technology Solutions
          </div>

          <h1 className="mt-8 text-5xl font-black leading-tight text-slate-950 dark:text-white md:text-7xl">
            System Design,
            <br />
            IT Infrastructure
            <br />
            <span className="bg-gradient-to-r from-sky-500 to-blue-700 bg-clip-text text-transparent dark:from-sky-400 dark:to-blue-500">
              & Digital Innovation
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 app-muted">
            MKETICS builds enterprise software systems,
            networking infrastructure, cloud solutions,
            and modern digital platforms for businesses,
            organizations, and growing companies.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="/#quote"
              className="inline-flex items-center gap-3 rounded-full bg-sky-500 px-8 py-4 text-sm font-black text-white transition hover:bg-sky-400"
            >
              Request Quote
              <ArrowRight className="h-4 w-4" />
            </a>

            <a
              href="/services"
              className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-8 py-4 text-sm font-black text-slate-900 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Explore Services
            </a>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-3">
            {[
              ["Systems", "Software & Platforms", Code2],
              ["Infrastructure", "Networks & Cloud", Network],
              ["Digital Hub", "Presence & Growth", Sparkles],
            ].map(([title, subtitle, Icon]) => (
              <div key={title} className="glass-card rounded-[2rem] p-5">
                <Icon className="h-7 w-7 text-sky-500 dark:text-sky-300" />

                <div className="mt-4 text-xl font-black text-slate-950 dark:text-white">
                  {title}
                </div>

                <div className="mt-1 text-sm app-subtle">
                  {subtitle}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9 }}
          className="relative flex items-center justify-center"
        >
          <div className="absolute h-[420px] w-[420px] rounded-full bg-sky-500/20 blur-3xl" />

          <div className="glass-card relative rounded-[3rem] p-10">
            <img
              src="/images/logo-detailed.webp"
              alt="MKETICS"
              className="mx-auto w-full max-w-xl object-contain drop-shadow-[0_0_35px_rgba(14,165,233,0.25)]"
            />

            <p className="mt-8 text-center text-sm font-bold uppercase tracking-[0.3em] text-sky-600 dark:text-sky-300">
              Innovate • Integrate • Elevate
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}