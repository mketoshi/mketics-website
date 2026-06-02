import { useEffect } from "react";

import {
  CheckCircle2,
  ShieldCheck,
  Code2,
  Network,
  Camera,
  Globe2,
  Wrench,
  ArrowRight,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const servicePackages = [
  {
    name: "Website Starter",
    price: "From R2,500",
    period: "once-off",
    icon: Globe2,
    color: "from-sky-500 to-cyan-400",
    description: "A clean, mobile-ready website for a business that needs trust, clear services and simple client contact.",
    features: ["Landing page or small website", "Mobile responsive layout", "Contact / WhatsApp button", "Basic SEO structure", "Domain and hosting guidance"],
  },
  {
    name: "Business System",
    price: "From R4,500",
    period: "project-based",
    icon: Code2,
    color: "from-sky-600 to-blue-500",
    popular: true,
    description: "A custom business system planned around your workflow, users, documents, reports and daily operations.",
    features: ["Client portal", "Invoices and quotes", "Project tracking", "Admin dashboard", "Custom workflow planning"],
  },
  {
    name: "IT & Network Setup",
    price: "From R3,500",
    period: "site assessment required",
    icon: Network,
    color: "from-emerald-500 to-teal-400",
    description: "Network and IT setup for offices, schools, labs and business sites that need stable connectivity.",
    features: ["Network planning", "Wi-Fi setup", "Switch/router configuration", "IT support", "Technical report"],
  },
  {
    name: "CCTV & Security Tech",
    price: "From R5,500",
    period: "hardware quoted separately",
    icon: Camera,
    color: "from-cyan-600 to-sky-400",
    description: "CCTV and security technology planning for sites that need visibility, remote access and maintenance support.",
    features: ["IP camera planning", "NVR/DVR setup", "Remote viewing", "Cloud storage planning", "Maintenance support"],
  },
];

const monthlySupport = [
  "Website maintenance",
  "System support",
  "Cloud backup checks",
  "Basic IT support",
  "Security and update checks",
  "Monthly reporting",
];

export default function Pricing() {
  useEffect(() => {
    document.title = "Pricing | MKETICS";

    const meta = document.querySelector('meta[name="description"]');

    if (meta) {
      meta.setAttribute(
        "content",
        "View MKETICS service pricing for websites, business systems, IT support, networking, CCTV, cloud setup and digital business support."
      );
    }
  }, []);

  return (
    <main className="min-h-screen app-bg brand-grid-bg">
      <Navbar />

      <section className="relative overflow-hidden px-4 pb-20 pt-28 sm:pt-32">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-sky-500 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-sky-500 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-5 py-2 text-sm font-black text-sky-500">
              <ShieldCheck className="h-4 w-4" />
              MKETICS Pricing Guide
            </div>

            <h1 className="mt-8 text-4xl font-black leading-tight sm:text-5xl md:text-7xl">
              Pricing that explains
              <span className="block bg-gradient-to-r from-sky-500 to-cyan-400 bg-clip-text text-transparent">
                what you are paying for
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-3xl text-base leading-8 app-muted sm:text-lg">
              MKETICS pricing is built around practical delivery. These are starting prices so clients can understand the budget direction before a final scope, site visit or technical proposal is confirmed.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
            {servicePackages.map((plan) => {
              const Icon = plan.icon;

              return (
                <div
                  key={plan.name}
                  className={`mketics-card-pro relative rounded-[2rem] p-6 shadow-2xl transition duration-300 hover:-translate-y-1 sm:p-8 ${
                    plan.popular ? "border-sky-400/40" : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute right-5 top-5 rounded-full bg-sky-500 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white">
                      Popular
                    </div>
                  )}

                  <div className="mketics-icon-box h-16 w-16">
                    <Icon className="h-8 w-8" />
                  </div>

                  <h2 className="mt-7 text-2xl font-black sm:text-3xl">
                    {plan.name}
                  </h2>

                  <div className="mt-5">
                    <span className="text-4xl font-black sm:text-5xl">
                      {plan.price}
                    </span>
                    <p className="mt-2 text-sm font-bold app-muted">
                      {plan.period}
                    </p>
                  </div>

                  <p className="mt-5 leading-7 app-muted">
                    {plan.description}
                  </p>

                  <div className="mt-7 grid gap-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                        <span className="text-sm font-semibold">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <a
                    href="/quote"
                    className="mketics-button-primary mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 font-black transition"
                  >
                    Request Quote
                    <ArrowRight className="h-5 w-5" />
                  </a>
                </div>
              );
            })}
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="mketics-card-pro rounded-[2.5rem] p-8 shadow-2xl sm:p-10">
              <div className="inline-flex rounded-2xl bg-sky-500/10 p-4 text-sky-500">
                <Wrench className="h-8 w-8" />
              </div>

              <h2 className="mt-6 text-3xl font-black sm:text-4xl">
                Ongoing support options
              </h2>

              <p className="mt-5 leading-8 app-muted">
                For clients who need long-term assistance, MKETICS can provide ongoing support from <strong>R750/month</strong> depending on the service level, response time and system complexity.
              </p>

              <a
                href="/contact"
                className="mketics-button-primary mt-8 inline-flex items-center gap-2 rounded-full px-7 py-4 font-black transition"
              >
                Discuss Ongoing Support
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {monthlySupport.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl app-surface p-5">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                  <span className="font-bold app-muted">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
