import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  Mail,
  MapPin,
  Phone,
  MessageCircle,
  ArrowRight,
  Building2,
} from "lucide-react";

export default function Contact() {
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
          Contact
        </p>

        <h1 className="mt-6 text-5xl font-black leading-tight md:text-7xl">
          Let’s Build Something Powerful
        </h1>

        <p className="mx-auto mt-8 max-w-4xl text-lg leading-8 app-muted">
          Contact MKETICS for enterprise systems,
          infrastructure deployment, networking,
          software solutions, and digital
          transformation services.
        </p>
      </section>

      {/* CONTACT GRID */}
      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="glass-card rounded-[2rem] p-7">
            <Phone className="h-10 w-10 text-sky-500" />

            <h2 className="mt-5 text-2xl font-black">
              Phone
            </h2>

            <p className="mt-4 app-muted">
              072 286 4367
            </p>
          </div>

          <div className="glass-card rounded-[2rem] p-7">
            <Mail className="h-10 w-10 text-sky-500" />

            <h2 className="mt-5 text-2xl font-black">
              Email
            </h2>

            <p className="mt-4 app-muted">
              info@mketics.co.za
            </p>
          </div>

          <div className="glass-card rounded-[2rem] p-7">
            <MapPin className="h-10 w-10 text-sky-500" />

            <h2 className="mt-5 text-2xl font-black">
              Location
            </h2>

            <p className="mt-4 app-muted">
              KwaZulu-Natal, South Africa
            </p>
          </div>

          <div className="glass-card rounded-[2rem] p-7">
            <Building2 className="h-10 w-10 text-sky-500" />

            <h2 className="mt-5 text-2xl font-black">
              Company
            </h2>

            <p className="mt-4 app-muted">
              MKETICS (Pty) Ltd
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="brand-gradient rounded-[2rem] p-10 text-center text-white">
          <MessageCircle className="mx-auto h-12 w-12" />

          <h2 className="mt-6 text-4xl font-black">
            Fastest Response: WhatsApp
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/90">
            Speak directly with MKETICS regarding
            software systems, infrastructure projects,
            networking solutions, digital services, or
            business technology consulting.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="https://wa.me/27722864367?text=Hi%20MKETICS%2C%20I%20would%20like%20to%20discuss%20a%20project."
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