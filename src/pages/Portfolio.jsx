import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  Code2,
  Network,
  Sparkles,
  ExternalLink,
} from "lucide-react";

const projects = [
  {
    title: "MKETICS Business Platform",
    category: "System Design & Development",
    icon: Code2,
    description:
      "Client portal, admin dashboard, invoice system, payment integration, and project tracking.",
  },

  {
    title: "Cloud Invoice & Payment System",
    category: "System Design & Development",
    icon: Code2,
    description:
      "Automated invoices, client access, PDF generation, and secure payment workflows.",
  },

  {
    title: "Business Network Deployment",
    category: "IT & Network Infrastructure",
    icon: Network,
    description:
      "WiFi deployment, structured cabling, CCTV integration, and enterprise infrastructure planning.",
  },

  {
    title: "CCTV Cloud Infrastructure",
    category: "IT & Network Infrastructure",
    icon: Network,
    description:
      "Cloud retention planning, centralized monitoring, and enterprise CCTV infrastructure systems.",
  },

  {
    title: "MKETICS Brand System",
    category: "Digital Hub",
    icon: Sparkles,
    description:
      "Brand identity, website systems, quote flow design, and customer digital experience.",
  },

  {
    title: "Digital Business Setup",
    category: "Digital Hub",
    icon: Sparkles,
    description:
      "Online presence, business positioning, SEO structure, and digital platform development.",
  },
];

export default function Portfolio() {
  return (
    <main className="min-h-screen app-bg">
      <Navbar />

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-32 text-center">
        <img
          src="/images/logo-icon.webp"
          alt="MKETICS"
          loading="lazy"
          className="mx-auto h-16 w-16 object-contain drop-shadow-[0_0_25px_rgba(56,189,248,0.35)] sm:h-20 sm:w-20 md:h-24 md:w-24"
        />

        <p className="mt-8 font-bold uppercase tracking-[0.3em] text-sky-500">
          Portfolio
        </p>

        <h1 className="mt-6 text-5xl font-black leading-tight md:text-7xl">
          Proof of Work
        </h1>

        <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 app-muted">
          A focused showcase of MKETICS systems,
          infrastructure solutions, and digital
          innovation projects.
        </p>
      </section>

      {/* PROJECTS */}
      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const Icon = project.icon;

            return (
              <div
                key={project.title}
                className="glass-card min-h-full rounded-[2rem] p-7 transition hover:-translate-y-2 hover:border-sky-400/40"
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="rounded-2xl bg-sky-500/10 p-4 text-sky-500">
                    <Icon className="h-8 w-8" />
                  </div>

                  <img
                    src="/images/logo-icon.webp"
                    alt="MKETICS"
                    loading="lazy"
                    className="h-12 w-12 object-contain opacity-80"
                  />
                </div>

                <p className="mt-8 text-sm font-bold text-sky-500">
                  {project.category}
                </p>

                <h2 className="mt-3 text-2xl font-black">
                  {project.title}
                </h2>

                <p className="mt-4 min-h-[120px] leading-8 app-muted">
                  {project.description}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-5 dark:border-white/10">
                  <span className="text-sm font-bold app-subtle">
                    MKETICS Project
                  </span>

                  <ExternalLink className="h-5 w-5 text-sky-500 transition group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="brand-gradient rounded-[2rem] p-10 text-center text-white">
          <h2 className="text-4xl font-black">
            Need a professional technology solution?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/90">
            MKETICS can help design, deploy, and
            support your next business system,
            infrastructure platform, or digital
            project.
          </p>

          <a
            href="/#quote"
            className="mt-8 inline-flex rounded-full bg-white px-8 py-4 font-black text-slate-950"
          >
            Request Quote
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}