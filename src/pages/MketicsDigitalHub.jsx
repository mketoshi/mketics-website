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
  ShieldCheck,
  BarChart3,
} from "lucide-react";

const services = [
  {
    icon: Globe2,
    title: "Website Management",
    description:
      "Professional websites, landing pages, hosting management, updates and scalable business web platforms.",
  },
  {
    icon: Palette,
    title: "Brand Identity",
    description:
      "Logo systems, brand visuals, digital assets, social media graphics and presentation design.",
  },
  {
    icon: Search,
    title: "SEO & Digital Presence",
    description:
      "Search optimization, Google visibility, online business profiles and digital positioning strategies.",
  },
  {
    icon: LayoutDashboard,
    title: "Content & Digital Systems",
    description:
      "Content systems, digital workflows, online customer experiences and engagement tools.",
  },
];

const benefits = [
  "Professional brand and document support",
  "Mobile-ready websites",
  "Clear online presence",
  "Client-ready business material",
];

const metrics = [
  {
    value: "100%",
    label: "Custom Branding",
    icon: Sparkles,
  },
  {
    value: "24/7",
    label: "Digital Presence",
    icon: Globe2,
  },
  {
    value: "SEO",
    label: "Growth Focused",
    icon: BarChart3,
  },
];

export default function MketicsDigitalHub() {
  return (
    <main className="min-h-screen app-bg brand-grid-bg">
      <Navbar />

      <section className="relative overflow-hidden px-4 pb-24 pt-32">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-sky-500 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-purple-500 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl text-center">
          <img
            src="/images/logo-icon.webp"
            alt="MKETICS"
            loading="lazy"
            className="mx-auto h-16 w-16 object-contain drop-shadow-[0_0_25px_rgba(56,189,248,0.35)] sm:h-20 sm:w-20 md:h-24 md:w-24"
          />

          <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-5 py-2 text-sm font-black text-sky-500">
            <ShieldCheck className="h-4 w-4" />
            MKETICS Digital Hub
          </div>

          <h1 className="mt-8 text-5xl font-black leading-tight md:text-7xl">
            Business documents, websites and
            <span className="block bg-gradient-to-r from-sky-500 to-cyan-400 bg-clip-text text-transparent">
              digital support
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-4xl text-lg leading-8 app-muted">
            MKETICS Digital Hub supports clients who need practical digital work: websites, brand assets, company profiles, proposals, business documents, CV support and online presence improvements.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="/contact"
              className="brand-gradient inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 font-black text-white shadow-xl"
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

          <div className="mt-14 grid gap-5 sm:grid-cols-3">
            {metrics.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl"
                >
                  <Icon className="mx-auto h-8 w-8 text-sky-500" />

                  <p className="mt-4 text-4xl font-black text-sky-500">
                    {item.value}
                  </p>

                  <p className="mt-2 font-bold app-muted">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="grid gap-6 md:grid-cols-2">
          {services.map((service) => (
            <div
              key={service.title}
              className="glass-card rounded-[2rem] p-8 transition hover:-translate-y-1 hover:border-sky-400/30"
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

      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="glass-card rounded-[2.5rem] p-10">
          <div className="max-w-3xl">
            <p className="font-black uppercase tracking-[0.3em] text-sky-500">
              Why Digital Hub
            </p>

            <h2 className="mt-4 text-4xl font-black md:text-5xl">
              Practical digital support for businesses that need to look professional.
            </h2>

            <p className="mt-6 leading-8 app-muted">
              MKETICS Digital Hub is where clients get the smaller but important work done properly: profiles, proposals, websites, social graphics, CV updates, LinkedIn support and digital documents.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {benefits.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl app-surface p-5"
              >
                <CheckCircle2 className="h-5 w-5 text-sky-500" />
                <span className="font-bold">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="brand-gradient rounded-[2.5rem] p-10 text-center text-white shadow-2xl">
          <Sparkles className="mx-auto h-12 w-12" />

          <h2 className="mt-6 text-4xl font-black">
            Ready to make your business look more professional?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/90">
            Let MKETICS help with your website, profile, proposal, brand visuals and digital documents.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 font-black text-slate-950"
            >
              Contact MKETICS
            </a>

            <a
              href="/portfolio"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-8 py-4 font-black text-white"
            >
              View Portfolio
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
