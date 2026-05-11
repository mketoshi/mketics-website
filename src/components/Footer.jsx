import {
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/70 px-4 py-12 dark:border-white/10 dark:bg-[#020617]/90">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <a href="/" className="inline-flex items-center gap-4">
            <img
              src="/images/logo-icon.webp"
              alt="MKETICS"
              loading="lazy"
              className="h-14 w-14 object-contain drop-shadow-[0_0_18px_rgba(14,165,233,0.35)]"
            />

            <div>
              <h2 className="text-2xl font-black text-slate-950 dark:text-white">
                MKETICS
              </h2>

              <p className="text-xs tracking-[0.25em] text-sky-600 dark:text-sky-300">
                INNOVATE • INTEGRATE • ELEVATE
              </p>
            </div>
          </a>

          <p className="mt-5 max-w-md leading-7 app-muted">
            Enterprise technology solutions for system design,
            IT infrastructure, and digital business growth.
          </p>

          <p className="mt-5 text-sm app-subtle">
            © {new Date().getFullYear()} MKETICS (Pty) Ltd. All rights reserved.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.25em] text-sky-600 dark:text-sky-300">
            Company
          </h3>

          <div className="mt-5 grid gap-3 text-sm">
            <a href="/services" className="app-muted hover:text-sky-500">
              Services
            </a>

            <a href="/portfolio" className="app-muted hover:text-sky-500">
              Portfolio
            </a>

            <a href="/mketics-digital-hub" className="app-muted hover:text-sky-500">
              Digital Hub
            </a>

            <a href="/contact" className="app-muted hover:text-sky-500">
              Contact
            </a>

            <a href="/client-login" className="app-subtle hover:text-sky-500">
              Client Login
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.25em] text-sky-600 dark:text-sky-300">
            Contact
          </h3>

          <div className="mt-5 grid gap-4 text-sm">
            <a
              href="tel:+27722864367"
              className="flex items-center gap-3 app-muted hover:text-sky-500"
            >
              <Phone className="h-4 w-4 text-sky-500" />
              072 286 4367
            </a>

            <a
              href="mailto:info@mketics.co.za"
              className="flex items-center gap-3 app-muted hover:text-sky-500"
            >
              <Mail className="h-4 w-4 text-sky-500" />
              info@mketics.co.za
            </a>

            <div className="flex items-center gap-3 app-muted">
              <MapPin className="h-4 w-4 text-sky-500" />
              KwaZulu-Natal, South Africa
            </div>

            <div className="flex items-center gap-3 app-subtle">
              <ShieldCheck className="h-4 w-4 text-sky-500" />
              Registered South African business
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}