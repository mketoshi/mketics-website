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
  Rocket,
  BarChart3,
} from "lucide-react";

const services = [
  {
    icon: Code2,
    title: "System Design & Development",
    subtitle: "Software • Automation • SaaS",
    description:
      "Custom business software, client portals, dashboards, automation systems and enterprise-grade applications built for scalability.",
    features: [
      "Web Applications",
      "Client Portals",
      "Automation Systems",
      "AI Integrations",
      "Business Dashboards",
      "Cloud Platforms",
    ],
  },

  {
    icon: Network,
    title: "IT & Network Infrastructure",
    subtitle: "Networking • Cloud • CCTV",
    description:
      "Professional networking, WiFi deployment, CCTV infrastructure, cloud systems and enterprise technology management.",
    features: [
      "WiFi Installation",
      "Cloud Infrastructure",
      "CCTV Systems",
      "Server Solutions",
      "IT Support",
      "Infrastructure Planning",
    ],
  },

  {
    icon: Sparkles,
    title: "Digital Hub",
    subtitle: "Branding • Websites • Growth",
    description:
      "Premium digital presence systems including branding, websites, SEO optimization and online business growth solutions.",
    features: [
      "Business Websites",
      "Brand Identity",
      "SEO Optimization",
      "Content Systems",
      "Digital Presence",
      "Growth Strategy",
    ],
  },
];

const stats = [
  {
    value: "120+",
    label: "Business Projects",
    icon: Rocket,
  },

  {
    value: "99.9%",
    label: "System Reliability",
    icon: ShieldCheck,
  },

  {
    value: "24/7",
    label: "Support Ready",
    icon: BarChart3,
  },
];

export default function Services() {
  return (
    <main className="min-h-screen app-bg">
      <Navbar />

      <section className="relative overflow-hidden px-4 pb-24 pt-32">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-sky-500 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-purple-500 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-5 py-2 text-sm font-black text-sky-500">
              <ShieldCheck className="h-4 w-4" />
              Enterprise Technology Solutions
            </div>

            <h1 className="mt-8 text-5xl font-black leading-tight md:text-7xl">
              Premium Business Technology
              <span className="block bg-gradient-to-r from-sky-500 to-cyan-400 bg-clip-text text-transparent">
                Built For Growth
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 app-muted">
              MKETICS delivers enterprise software systems, IT infrastructure,
              cloud platforms and digital transformation solutions for modern businesses.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-3">
            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-center shadow-xl backdrop-blur-xl"
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
        <div className="grid gap-8">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <div
                key={service.title}
                className="glass-card rounded-[2.5rem] p-8 shadow-2xl md:p-10"
              >
                <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
                  <div>
                    <div className="inline-flex rounded-2xl bg-sky-500/10 p-5 text-sky-500">
                      <Icon className="h-10 w-10" />
                    </div>

                    <p className="mt-6 text-sm font-black uppercase tracking-[0.2em] text-sky-500">
                      {service.subtitle}
                    </p>

                    <h2 className="mt-4 text-4xl font-black">
                      {service.title}
                    </h2>

                    <p className="mt-6 leading-8 app-muted">
                      {service.description}
                    </p>

                    <a
                      href="/contact"
                      className="mt-8 inline-flex items-center gap-2 rounded-full bg-sky-500 px-6 py-4 font-black text-white"
                    >
                      Request Consultation
                      <ArrowRight className="h-5 w-5" />
                    </a>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {service.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-3 rounded-2xl app-surface p-5 transition hover:border-sky-400/30"
                      >
                        <CheckCircle2 className="h-5 w-5 text-green-500" />

                        <span className="font-bold">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="glass-card rounded-[2.5rem] p-10">
          <div className="text-center">
            <p className="font-black uppercase tracking-[0.3em] text-sky-500">
              Why MKETICS
            </p>

            <h2 className="mt-5 text-4xl font-black md:text-5xl">
              Enterprise technology expertise.
            </h2>

            <p className="mx-auto mt-6 max-w-3xl leading-8 app-muted">
              MKETICS combines infrastructure experience, modern development,
              business automation and enterprise-grade deployment standards.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                icon: Server,
                title: "Infrastructure",
                text: "Enterprise-grade deployment and networking.",
              },

              {
                icon: ShieldCheck,
                title: "Security",
                text: "Reliable and secure technology ecosystems.",
              },

              {
                icon: Globe2,
                title: "Scalability",
                text: "Built for long-term business growth.",
              },

              {
                icon: Code2,
                title: "Innovation",
                text: "Modern SaaS and digital transformation systems.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[2rem] app-surface p-6"
              >
                <item.icon className="h-10 w-10 text-sky-500" />

                <h3 className="mt-5 text-2xl font-black">
                  {item.title}
                </h3>

                <p className="mt-4 leading-7 app-muted">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="brand-gradient rounded-[2.5rem] p-10 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-black">
            Ready to transform your business?
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/90">
            Speak with MKETICS regarding SaaS systems, cloud infrastructure,
            networking, digital platforms and enterprise automation.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-black text-slate-950"
            >
              Contact MKETICS
              <ArrowRight className="h-5 w-5" />
            </a>

            <a
              href="/pricing"
              className="rounded-full border border-white/20 bg-white/10 px-8 py-4 font-black text-white backdrop-blur-xl"
            >
              View Pricing
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
