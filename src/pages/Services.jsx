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
} from "lucide-react";

const services = [
  {
    icon: Code2,
    title: "System Design & Development",
    description:
      "Custom software systems, dashboards, portals, automation platforms, APIs, business applications, and enterprise-grade web systems.",
    features: [
      "Web Applications",
      "Business Dashboards",
      "Client Portals",
      "Automation Systems",
      "API Integrations",
      "Cloud Applications",
    ],
  },

  {
    icon: Network,
    title: "IT & Network Infrastructure",
    description:
      "Enterprise networking, WiFi deployment, CCTV systems, cloud infrastructure, support services, and business technology management.",
    features: [
      "WiFi Installation",
      "CCTV Infrastructure",
      "Cloud Solutions",
      "Server Systems",
      "Network Support",
      "Infrastructure Planning",
    ],
  },

  {
    icon: Sparkles,
    title: "Digital Hub",
    description:
      "Digital presence systems including branding, websites, SEO, online visibility, and customer digital experiences.",
    features: [
      "Business Websites",
      "Brand Identity",
      "SEO Optimization",
      "Digital Presence",
      "Content Systems",
      "Growth Strategy",
    ],
  },
];

export default function Services() {
  return (
    <main className="min-h-screen app-bg">
      <Navbar />

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 pb-24 pt-32 text-center">
        <p className="font-bold uppercase tracking-[0.3em] text-sky-500">
          Services
        </p>

        <h1 className="mt-6 text-5xl font-black leading-tight md:text-7xl">
          Enterprise Technology Solutions
        </h1>

        <p className="mx-auto mt-8 max-w-4xl text-lg leading-8 app-muted">
          MKETICS delivers modern business systems,
          IT infrastructure, and digital innovation
          solutions designed for growth, scalability,
          and operational efficiency.
        </p>
      </section>

      {/* MAIN SERVICES */}
      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="grid gap-8">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <div
                key={service.title}
                className="glass-card rounded-[2rem] p-8 md:p-10"
              >
                <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
                  <div>
                    <div className="inline-flex rounded-2xl bg-sky-500/10 p-5 text-sky-500">
                      <Icon className="h-10 w-10" />
                    </div>

                    <h2 className="mt-6 text-4xl font-black">
                      {service.title}
                    </h2>

                    <p className="mt-6 leading-8 app-muted">
                      {service.description}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {service.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-3 rounded-2xl app-surface p-5"
                      >
                        <CheckCircle2 className="h-5 w-5 text-sky-500" />

                        <span className="font-medium">
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

      {/* WHY MKETICS */}
      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="glass-card rounded-[2rem] p-10">
          <div className="text-center">
            <p className="font-bold uppercase tracking-[0.3em] text-sky-500">
              Why MKETICS
            </p>

            <h2 className="mt-5 text-4xl font-black md:text-5xl">
              Technology expertise built for business.
            </h2>

            <p className="mx-auto mt-6 max-w-3xl leading-8 app-muted">
              MKETICS combines enterprise IT experience,
              infrastructure expertise, and modern software
              development to deliver scalable and reliable
              technology solutions.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                icon: Server,
                title: "Infrastructure",
                text: "Enterprise-grade systems and deployment.",
              },

              {
                icon: ShieldCheck,
                title: "Security",
                text: "Reliable and secure technology solutions.",
              },

              {
                icon: Globe2,
                title: "Scalability",
                text: "Built for modern business growth.",
              },

              {
                icon: Code2,
                title: "Innovation",
                text: "Modern systems and digital transformation.",
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

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="brand-gradient rounded-[2rem] p-10 text-center text-white">
          <h2 className="text-4xl font-black">
            Ready to start your next project?
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/90">
            Speak with MKETICS regarding system
            development, IT infrastructure, networking,
            cloud solutions, or digital transformation.
          </p>

          <a
            href="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-black text-slate-950"
          >
            Contact MKETICS

            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}