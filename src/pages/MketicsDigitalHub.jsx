import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  ArrowRight,
  Globe2,
  Palette,
  Sparkles,
  Search,
  LayoutDashboard,
  CheckCircle2,
} from "lucide-react";

const services = [
  {
    icon: Globe2,
    title: "Website Management",
    description:
      "Professional websites, landing pages, hosting management, updates, and business web platforms.",
  },

  {
    icon: Palette,
    title: "Brand Identity",
    description:
      "Logo systems, brand visuals, digital assets, social media graphics, and business presentation design.",
  },

  {
    icon: Search,
    title: "SEO & Digital Presence",
    description:
      "Search optimization, Google visibility, online business profiles, and digital positioning strategies.",
  },

  {
    icon: LayoutDashboard,
    title: "Content & Digital Systems",
    description:
      "Content systems, digital workflows, online customer experiences, and business engagement tools.",
  },
];

export default function MketicsDigitalHub() {
  return (
    <main className="min-h-screen app-bg">
      <Navbar />

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 pb-24 pt-32 text-center">
        <img
          src="/images/logo-icon.webp"
          alt="MKETICS"
          loading="lazy"
          className="mx-auto h-16 w-16 object-contain drop-shadow-[0_0_25px_rgba(56,189,248,0.35)] sm:h-20 sm:w-20 md:h-24 md:w-24"
        />

        <p className="mt-8 font-bold uppercase tracking-[0.3em] text-sky-500">
          Digital Hub
        </p>

        <h1 className="mt-6 text-5xl font-black leading-tight md:text-7xl">
          Digital Presence & Business Growth
        </h1>

        <p className="mx-auto mt-8 max-w-4xl text-lg leading-8 app-muted">
          MKETICS Digital Hub helps businesses
          establish, manage, and scale their digital
          presence through branding, websites, SEO,
          content systems, and customer experiences.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href="/contact"
            className="brand-gradient inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 font-black text-white"
          >
            Start Your Project

            <ArrowRight className="h-5 w-5" />
          </a>

          <a
            href="/portfolio"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-8 py-4 font-black text-slate-900 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            View Portfolio
          </a>
        </div>
      </section>

      {/* SERVICES */}
      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="grid gap-6 md:grid-cols-2">
          {services.map((service) => (
            <div
              key={service.title}
              className="glass-card rounded-[2rem] p-8"
            >
              <div className="mb-6 inline-flex rounded-2xl bg-sky-500/10 p-4 text-sky-500">
                <service.icon className="h-8 w-8" />
              </div>

              <h2 className="text-3xl font-black">
                {service.title}
              </h2>

              <p className="mt-5 leading-8 app-muted">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY DIGITAL HUB */}
      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="glass-card rounded-[2rem] p-10">
          <div className="max-w-3xl">
            <p className="font-bold uppercase tracking-[0.3em] text-sky-500">
              Why Digital Hub
            </p>

            <h2 className="mt-4 text-4xl font-black md:text-5xl">
              Modern digital experiences for modern
              businesses.
            </h2>

            <p className="mt-6 leading-8 app-muted">
              MKETICS Digital Hub combines design,
              branding, strategy, and digital systems
              to help businesses strengthen their online
              presence and customer engagement.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              "Premium digital branding",
              "Modern website systems",
              "SEO-focused structure",
              "Business growth positioning",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl app-surface p-5"
              >
                <CheckCircle2 className="h-5 w-5 text-sky-500" />

                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="brand-gradient rounded-[2rem] p-10 text-center text-white">
          <Sparkles className="mx-auto h-12 w-12" />

          <h2 className="mt-6 text-4xl font-black">
            Ready to improve your digital presence?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/90">
            Let MKETICS help build your business
            presence, brand identity, and modern
            digital experience.
          </p>

          <a
            href="/contact"
            className="mt-8 inline-flex rounded-full bg-white px-8 py-4 font-black text-slate-950"
          >
            Contact MKETICS
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}