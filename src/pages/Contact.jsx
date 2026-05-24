import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  Mail,
  MapPin,
  Phone,
  MessageCircle,
  ArrowRight,
  Building2,
  Clock,
  ShieldCheck,
  Rocket,
} from "lucide-react";

const contactCards = [
  {
    title: "Phone",
    value: "072 286 4367",
    href: "tel:+27722864367",
    icon: Phone,
    note: "Call MKETICS directly",
  },
  {
    title: "Email",
    value: "info@mketics.co.za",
    href: "mailto:info@mketics.co.za",
    icon: Mail,
    note: "Send project requirements",
  },
  {
    title: "Location",
    value: "KwaZulu-Natal, South Africa",
    href: null,
    icon: MapPin,
    note: "Remote and onsite support",
  },
  {
    title: "Company",
    value: "MKETICS (Pty) Ltd",
    href: null,
    icon: Building2,
    note: "Registered business",
  },
];

const projectTypes = [
  "Business website",
  "Client portal",
  "AI proposal system",
  "Invoice automation",
  "Network infrastructure",
  "CCTV / cloud storage",
  "Digital branding",
  "Custom SaaS platform",
];

export default function Contact() {
  const whatsappMessage = encodeURIComponent(
    "Hi MKETICS, I would like to discuss a technology project."
  );

  return (
    <main className="min-h-screen app-bg">
      <Navbar />

      <section className="relative overflow-hidden px-4 pb-20 pt-32">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-sky-500 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-purple-500 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-5 py-2 text-sm font-black text-sky-500">
              <MessageCircle className="h-4 w-4" />
              Contact MKETICS
            </div>

            <h1 className="mt-8 text-5xl font-black leading-tight md:text-7xl">
              Let’s Build Something
              <span className="block bg-gradient-to-r from-sky-500 to-cyan-400 bg-clip-text text-transparent">
                Powerful
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 app-muted">
              Contact MKETICS for software systems, SaaS platforms, IT
              infrastructure, networking, cloud solutions, CCTV projects and
              digital transformation services.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a
                href={`https://wa.me/27722864367?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-green-500 px-8 py-4 font-black text-white shadow-xl"
              >
                <MessageCircle className="h-5 w-5" />
                WhatsApp MKETICS
              </a>

              <a
                href="/#quote"
                className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-8 py-4 font-black text-white shadow-xl"
              >
                Request Quote
                <ArrowRight className="h-5 w-5" />
              </a>

              <a
                href="/start-trial"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 font-black backdrop-blur-xl"
              >
                <Rocket className="h-5 w-5" />
                Start Trial
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {contactCards.map((card) => {
            const Icon = card.icon;

            const content = (
              <div className="glass-card h-full rounded-[2rem] p-7 transition hover:-translate-y-1 hover:border-sky-400/40">
                <Icon className="h-10 w-10 text-sky-500" />

                <h2 className="mt-5 text-2xl font-black">
                  {card.title}
                </h2>

                <p className="mt-4 font-bold app-muted">
                  {card.value}
                </p>

                <p className="mt-3 text-sm app-subtle">
                  {card.note}
                </p>
              </div>
            );

            return card.href ? (
              <a key={card.title} href={card.href}>
                {content}
              </a>
            ) : (
              <div key={card.title}>{content}</div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-24 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-card rounded-[2rem] p-8">
          <div className="inline-flex rounded-2xl bg-sky-500/10 p-4 text-sky-500">
            <Clock className="h-8 w-8" />
          </div>

          <h2 className="mt-6 text-4xl font-black">
            Best way to reach us
          </h2>

          <p className="mt-5 leading-8 app-muted">
            WhatsApp is usually the fastest channel for quick project discussions.
            For detailed specifications, documents, diagrams or proposals, email
            is recommended.
          </p>

          <div className="mt-8 grid gap-4">
            {[
              "Send project requirements",
              "Share screenshots or documents",
              "Request pricing or consultation",
              "Discuss technical scope",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl app-surface p-4">
                <ShieldCheck className="h-5 w-5 text-green-500" />
                <span className="font-bold app-muted">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-8">
          <p className="font-black uppercase tracking-[0.25em] text-sky-500">
            Common Requests
          </p>

          <h2 className="mt-4 text-4xl font-black">
            What can we help you build?
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {projectTypes.map((type) => (
              <div key={type} className="rounded-2xl app-surface p-5">
                <p className="font-bold">{type}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="brand-gradient rounded-[2.5rem] p-10 text-center text-white shadow-2xl">
          <MessageCircle className="mx-auto h-12 w-12" />

          <h2 className="mt-6 text-4xl font-black">
            Fastest Response: WhatsApp
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/90">
            Speak directly with MKETICS regarding software systems,
            infrastructure projects, networking solutions, digital services or
            business technology consulting.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href={`https://wa.me/27722864367?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-black text-slate-950"
            >
              WhatsApp MKETICS
              <ArrowRight className="h-5 w-5" />
            </a>

            <a
              href="mailto:info@mketics.co.za"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-8 py-4 font-black text-white"
            >
              Email Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
