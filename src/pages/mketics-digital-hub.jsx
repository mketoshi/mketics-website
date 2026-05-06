import React from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Code2,
  FileText,
  Globe2,
  Laptop,
  Mail,
  MessageCircle,
  Palette,
  ShieldCheck,
  Sparkles,
  Wifi,
} from "lucide-react";

const services = [
  {
    icon: FileText,
    title: "CV & Career Services",
    items: ["ATS CV design", "Cover letters", "Job applications", "LinkedIn setup"],
  },
  {
    icon: BriefcaseBusiness,
    title: "Business Services",
    items: ["CIPC assistance", "Company profiles", "Invoice templates", "Business emails"],
  },
  {
    icon: Laptop,
    title: "IT Support",
    items: ["Software installation", "Windows support", "Printer setup guidance", "Remote support"],
  },
  {
    icon: Palette,
    title: "Design Services",
    items: ["Logos", "Flyers", "Posters", "Business cards", "Social media designs"],
  },
  {
    icon: Code2,
    title: "Web Services",
    items: ["Websites", "Landing pages", "Booking systems", "Business dashboards"],
  },
  {
    icon: Globe2,
    title: "Online Assistance",
    items: ["Email setup", "Online forms", "Applications", "Document formatting"],
  },
];

export default function MketicsDigitalHub() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* NAV */}
      <header className="border-b border-white/10 bg-slate-950/90 px-4 py-4">
        <nav className="mx-auto flex max-w-7xl items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img
              src="/images/logo-icon.png"
              alt="MKETICS"
              className="h-11 w-11 rounded-xl object-contain"
            />
            <div>
              <h1 className="text-lg font-black">MKETICS</h1>
              <p className="text-xs text-slate-400">Digital Hub</p>
            </div>
          </a>

          <a
            href="https://wa.me/27722864367?text=Hi%20MKETICS%2C%20I%20need%20help%20from%20MKETICS%20Digital%20Hub."
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-sky-500 px-5 py-2.5 text-sm font-bold hover:bg-sky-400"
          >
            WhatsApp Us
          </a>
        </nav>
      </header>

      {/* HERO */}
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm text-sky-200">
            <Sparkles className="h-4 w-4" />
            Modern digital services without needing a printer
          </div>

          <h2 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            MKETICS Digital Hub
          </h2>

          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
            Online applications, CV design, business services, IT support,
            websites, design work, and digital assistance for individuals and
            small businesses.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#services"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-6 py-4 font-black text-white hover:bg-sky-400"
            >
              View Services <ArrowRight className="h-5 w-5" />
            </a>

            <a
              href="https://wa.me/27722864367?text=Hi%20MKETICS%2C%20I%20want%20to%20request%20a%20Digital%20Hub%20service."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-4 font-black text-white hover:bg-white/10"
            >
              <MessageCircle className="h-5 w-5" />
              Request Help
            </a>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl">
          <div className="grid gap-4">
            {[
              "Remote assistance available",
              "No printer required to start",
              "Perfect for CVs, business services, and IT support",
              "Powered by MKETICS digital systems",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 text-slate-200"
              >
                <ShieldCheck className="h-5 w-5 text-sky-300" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-10">
          <p className="font-bold uppercase tracking-[0.3em] text-sky-300">
            Services
          </p>
          <h2 className="mt-3 text-3xl font-black sm:text-5xl">
            Digital services you can start offering now.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 transition hover:-translate-y-1 hover:bg-white/[0.08]"
            >
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-sky-400/10 text-sky-300">
                <service.icon className="h-7 w-7" />
              </div>

              <h3 className="text-xl font-black">{service.title}</h3>

              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                {service.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* PACKAGES */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-sky-600 to-blue-700 p-8">
          <h2 className="text-3xl font-black">Starter Packages</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-5">
              <h3 className="text-xl font-black">CV Package</h3>
              <p className="mt-2 text-sm text-sky-100">From R150</p>
              <p className="mt-3 text-sm">CV design + formatting + PDF export.</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5">
              <h3 className="text-xl font-black">Business Startup</h3>
              <p className="mt-2 text-sm text-sky-100">From R350</p>
              <p className="mt-3 text-sm">Company profile, email setup, basic branding.</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5">
              <h3 className="text-xl font-black">Online Assistance</h3>
              <p className="mt-2 text-sm text-sky-100">From R100</p>
              <p className="mt-3 text-sm">Applications, forms, emails, and uploads.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 text-center">
        <Wifi className="mx-auto h-12 w-12 text-sky-300" />
        <h2 className="mt-5 text-3xl font-black sm:text-5xl">
          Need digital help today?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-slate-300">
          Contact MKETICS Digital Hub for online applications, CVs, business
          setup, IT support, and design services.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="https://wa.me/27722864367?text=Hi%20MKETICS%2C%20I%20need%20Digital%20Hub%20assistance."
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-green-500 px-7 py-4 font-black hover:bg-green-400"
          >
            WhatsApp MKETICS
          </a>

          <a
            href="mailto:info@mketics.co.za"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-7 py-4 font-black hover:bg-white/10"
          >
            <Mail className="h-5 w-5" />
            Email Us
          </a>
        </div>
      </section>
    </main>
  );
}