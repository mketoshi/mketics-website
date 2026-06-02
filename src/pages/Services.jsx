import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  Code2,
  Network,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Server,
  ShieldCheck,
  Globe2,
  ClipboardCheck,
  Camera,
  Wrench,
  FileText,
} from "lucide-react";

const services = [
  {
    icon: Code2,
    title: "Software Systems",
    subtitle: "Business apps • Portals • Automation",
    description:
      "We build practical systems that help businesses manage work better — from client portals and dashboards to quote, invoice and workflow tools.",
    features: [
      "Client portals",
      "Admin dashboards",
      "Invoice and quote tools",
      "Workflow automation",
      "Database-backed web apps",
      "System documentation",
    ],
  },
  {
    icon: Network,
    title: "IT & Network Infrastructure",
    subtitle: "Wi-Fi • Switching • Site readiness",
    description:
      "We plan, configure and support networks for offices, schools, labs and business environments where uptime and clean documentation matter.",
    features: [
      "Network assessments",
      "Wi-Fi planning",
      "Router and switch setup",
      "Lab and office connectivity",
      "Technical reports",
      "Ongoing support",
    ],
  },
  {
    icon: Camera,
    title: "CCTV & Security Technology",
    subtitle: "IP cameras • Remote viewing • Monitoring",
    description:
      "We help clients plan CCTV systems that are useful beyond recording — with IP-based management, maintenance records and future monitoring readiness.",
    features: [
      "IP camera planning",
      "NVR / DVR setup",
      "Remote viewing support",
      "Cloud storage guidance",
      "Maintenance records",
      "Security workflow planning",
    ],
  },
  {
    icon: Globe2,
    title: "Websites & Digital Platforms",
    subtitle: "Presence • Trust • Conversion",
    description:
      "We create websites and digital platforms that clearly explain your services, build trust and make it easy for clients to contact you.",
    features: [
      "Business websites",
      "Landing pages",
      "Online stores",
      "Mobile responsive design",
      "WhatsApp and forms",
      "Basic SEO structure",
    ],
  },
  {
    icon: Server,
    title: "Cloud & Systems Support",
    subtitle: "Storage • Backup • Access",
    description:
      "We support cloud-based workflows, file access, backups and secure digital operations for growing businesses and project teams.",
    features: [
      "Cloud planning",
      "Backup guidance",
      "User access setup",
      "File organization",
      "System support",
      "Update checks",
    ],
  },
  {
    icon: Sparkles,
    title: "Digital Hub Services",
    subtitle: "Branding • Documents • Business support",
    description:
      "For clients who need practical digital support, MKETICS assists with websites, profiles, proposals, business documents and online presence.",
    features: [
      "Company profiles",
      "Business proposals",
      "Digital documents",
      "Brand visuals",
      "CV / LinkedIn support",
      "Social media graphics",
    ],
  },
];

const process = [
  {
    title: "Understand first",
    text: "We ask what is not working, what you already have and what result you need.",
    icon: ClipboardCheck,
  },
  {
    title: "Recommend clearly",
    text: "You receive practical options, pricing direction and a clear scope before work starts.",
    icon: FileText,
  },
  {
    title: "Deliver properly",
    text: "We build, configure, document and support the solution after delivery.",
    icon: Wrench,
  },
  {
    title: "Protect the relationship",
    text: "MKETICS aims for long-term support, not quick once-off work only.",
    icon: ShieldCheck,
  },
];

export default function Services() {
  return (
    <main className="min-h-screen app-bg brand-grid-bg">
      <Navbar />

      <section className="relative overflow-hidden px-4 pb-16 pt-28 sm:pb-20 sm:pt-32">
        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <div className="brand-kicker">
              <ShieldCheck className="h-4 w-4" />
              MKETICS Services
            </div>

            <h1 className="brand-section-title mx-auto mt-8 max-w-5xl text-4xl sm:text-5xl md:text-7xl">
              Practical technology services for real business environments.
            </h1>

            <p className="mx-auto mt-7 max-w-3xl text-base leading-8 app-muted sm:text-lg">
              MKETICS helps clients build, connect and protect their operations through software systems, IT infrastructure, CCTV, cloud support, websites and digital business services.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:pb-24">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <article
                key={service.title}
                className="mketics-card-pro rounded-[2rem] p-6 shadow-2xl transition hover:-translate-y-1 hover:border-sky-400/40 sm:p-8"
              >
                <div className="mketics-icon-box h-16 w-16">
                  <Icon className="h-8 w-8" />
                </div>

                <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-sky-500">
                  {service.subtitle}
                </p>

                <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                  {service.title}
                </h2>

                <p className="mt-4 leading-7 app-muted">
                  {service.description}
                </p>

                <div className="mt-6 grid gap-3">
                  {service.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 rounded-2xl app-surface p-4">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-sky-500" />
                      <span className="text-sm font-bold app-muted">{feature}</span>
                    </div>
                  ))}
                </div>

                <a
                  href="/quote"
                  className="mketics-button-primary mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 font-black transition"
                >
                  Request Quote
                  <ArrowRight className="h-5 w-5" />
                </a>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="mketics-card-pro rounded-[2.5rem] p-8 sm:p-10 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="font-black uppercase tracking-[0.25em] text-sky-500">
                The MKETICS approach
              </p>
              <h2 className="mt-4 text-3xl font-black sm:text-4xl md:text-5xl">
                Not a template. Not guesswork. A clear service process.
              </h2>
              <p className="mt-6 leading-8 app-muted">
                MKETICS is built around practical delivery: understand the client, design the right solution, deliver professionally and support the relationship after handover.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {process.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-[2rem] app-surface p-6">
                    <Icon className="h-9 w-9 text-sky-500" />
                    <h3 className="mt-5 text-xl font-black">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 app-muted">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="mketics-section-panel rounded-[2.5rem] p-8 text-center text-white shadow-2xl sm:p-10 lg:p-14">
          <h2 className="text-3xl font-black sm:text-4xl md:text-5xl">
            Need a technology partner who can explain, build and support the work?
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/90">
            Speak to MKETICS about your website, system, network, CCTV or digital support project.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/quote"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-black text-slate-950"
            >
              Request Quote
              <ArrowRight className="h-5 w-5" />
            </a>

            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-8 py-4 font-black text-white backdrop-blur-xl"
            >
              Contact MKETICS
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
