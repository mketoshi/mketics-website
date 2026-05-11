import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  ArrowRight,
  CheckCircle2,
  Code2,
  ExternalLink,
  Network,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const projects = [
  {
    title: "MKETICS Business Platform",
    category: "System Design & Development",
    icon: Code2,
    description:
      "Client portal, admin dashboard, invoice system, payment integration, project tracking, and workflow automation.",
    technologies: [
      "React",
      "Supabase",
      "Automation",
      "Cloud",
    ],
  },

  {
    title: "Cloud Invoice & Payment System",
    category: "System Design & Development",
    icon: Code2,
    description:
      "Automated invoices, client access systems, secure workflows, PDF generation, and digital payment integration.",
    technologies: [
      "PDF",
      "Payments",
      "Client Portal",
      "Automation",
    ],
  },

  {
    title: "Business Network Deployment",
    category: "IT & Network Infrastructure",
    icon: Network,
    description:
      "WiFi deployment, structured cabling, CCTV integration, and enterprise infrastructure planning.",
    technologies: [
      "Networking",
      "WiFi",
      "CCTV",
      "Infrastructure",
    ],
  },

  {
    title: "CCTV Cloud Infrastructure",
    category: "IT & Network Infrastructure",
    icon: Network,
    description:
      "Cloud retention planning, centralized monitoring, and enterprise CCTV infrastructure systems.",
    technologies: [
      "Cloud",
      "Monitoring",
      "Storage",
      "Security",
    ],
  },

  {
    title: "MKETICS Brand System",
    category: "Digital Hub",
    icon: Sparkles,
    description:
      "Brand identity, website systems, quote flow design, and customer digital experiences.",
    technologies: [
      "Branding",
      "UX/UI",
      "SEO",
      "Web",
    ],
  },

  {
    title: "Digital Business Setup",
    category: "Digital Hub",
    icon: Sparkles,
    description:
      "Online presence, business positioning, SEO structure, and digital platform development.",
    technologies: [
      "Digital",
      "SEO",
      "Growth",
      "Platforms",
    ],
  },
];

const proof = [
  "Enterprise-ready solutions",
  "Modern cloud-ready systems",
  "South African registered business",
  "Professional digital infrastructure",
];

export default function Portfolio() {
  return (
    <main className="min-h-screen app-bg">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.12),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.18),transparent_55%)]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-28 text-center sm:pt-32">
          <img
            src="/images/logo-icon.webp?v=2"
            alt="MKETICS"
            loading="lazy"
            className="mx-auto h-16 w-16 object-contain drop-shadow-[0_0_25px_rgba(56,189,248,0.35)] sm:h-20 sm:w-20 md:h-24 md:w-24"
          />

          <p className="mt-8 font-bold uppercase tracking-[0.3em] text-sky-500">
            Portfolio
          </p>

          <h1 className="mt-6 text-5xl font-black leading-tight md:text-7xl">
            Technology
            <span className="bg-gradient-to-r from-sky-500 to-blue-700 bg-clip-text text-transparent dark:from-sky-400 dark:to-blue-500">
              {" "}
              Capabilities
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 app-muted">
            A showcase of MKETICS business systems,
            infrastructure deployments, digital platforms,
            and enterprise technology solutions.
          </p>

          {/* TRUST */}
          <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
            {proof.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl app-surface px-5 py-4"
              >
                <ShieldCheck className="h-5 w-5 shrink-0 text-sky-500" />

                <span className="text-sm font-bold app-muted">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const Icon = project.icon;

            return (
              <div
                key={project.title}
                className="group glass-card flex min-h-full flex-col rounded-[2rem] p-7 transition duration-300 hover:-translate-y-2 hover:border-sky-400/40"
              >
                {/* TOP */}
                <div className="flex items-start justify-between gap-5">
                  <div className="rounded-2xl bg-sky-500/10 p-4 text-sky-500 transition group-hover:scale-110">
                    <Icon className="h-8 w-8" />
                  </div>

                  <img
                    src="/images/logo-icon.webp?v=2"
                    alt="MKETICS"
                    loading="lazy"
                    className="h-12 w-12 object-contain opacity-80"
                  />
                </div>

                {/* CATEGORY */}
                <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-sky-500">
                  {project.category}
                </p>

                {/* TITLE */}
                <h2 className="mt-3 text-2xl font-black">
                  {project.title}
                </h2>

                {/* DESCRIPTION */}
                <p className="mt-4 flex-1 leading-8 app-muted">
                  {project.description}
                </p>

                {/* TECHNOLOGIES */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {project.technologies.map((tech) => (
                    <div
                      key={tech}
                      className="rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-2 text-xs font-bold text-sky-600 dark:text-sky-300"
                    >
                      {tech}
                    </div>
                  ))}
                </div>

                {/* FOOTER */}
                <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-5 dark:border-white/10">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] app-subtle">
                      Status
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />

                      <span className="text-sm font-bold text-green-500">
                        Active Capability
                      </span>
                    </div>
                  </div>

                  <div className="rounded-full bg-sky-500/10 p-3 text-sky-500">
                    <ExternalLink className="h-5 w-5 transition group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="brand-gradient overflow-hidden rounded-[2rem] p-8 text-center text-white sm:p-10 lg:p-14">
          <Sparkles className="mx-auto h-12 w-12" />

          <h2 className="mt-6 text-4xl font-black md:text-5xl">
            Ready to build your next technology solution?
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/90">
            MKETICS helps businesses design, deploy,
            and modernize software systems, digital
            platforms, networking infrastructure,
            and cloud-ready business solutions.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="/#quote"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-black text-slate-950"
            >
              Request Quote

              <ArrowRight className="h-5 w-5" />
            </a>

            <a
              href="/services"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-8 py-4 font-black text-white"
            >
              Explore Services
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}