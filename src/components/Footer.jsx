import {
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Download,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-white/90 px-4 py-12 dark:border-white/10 dark:bg-[#020617]/95">
      <div className="mketics-brand-bar absolute inset-x-0 top-0" />

      <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.35fr_0.8fr_0.8fr_1fr]">
        <div>
          <a href="/" className="inline-flex items-center gap-4">
            <span className="mketics-logo-frame h-16 w-16 shrink-0">
              <img
                src="/images/logo-icon.webp?v=2"
                alt="MKETICS"
                loading="lazy"
                className="h-12 w-12 object-contain drop-shadow-[0_0_18px_rgba(14,165,233,0.35)]"
              />
            </span>

            <div>
              <h2 className="text-2xl font-black tracking-wide text-slate-950 dark:text-white">
                MKETICS
              </h2>

              <p className="text-xs font-black tracking-[0.25em] text-sky-600 dark:text-sky-300">
                BUILD • CONNECT • PROTECT
              </p>
            </div>
          </a>

          <p className="mt-5 max-w-md leading-7 app-muted">
            Modern Knowledge Engineering, Technology & Innovative Commercial Solutions — software systems, IT infrastructure, networking, CCTV, cloud support, websites and digital business services.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl mketics-proof-badge p-4">
              <div className="flex items-center gap-2 text-sm font-black text-sky-600 dark:text-sky-300">
                <ShieldCheck className="h-4 w-4" />
                B-BBEE Level 1
              </div>
              <p className="mt-2 text-xs app-subtle">
                135% procurement recognition
              </p>
            </div>

            <div className="rounded-2xl mketics-proof-badge p-4">
              <div className="flex items-center gap-2 text-sm font-black text-sky-600 dark:text-sky-300">
                <Building2 className="h-4 w-4" />
                Registered PTY LTD
              </div>
              <p className="mt-2 text-xs app-subtle">
                Enterprise No. K2026290708
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href="/quote"
              className="mketics-button-primary inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-black transition"
            >
              Request Quote
            </a>
            <a
              href="/docs/MKETICS_Service_Catalogue.pdf"
              download
              className="mketics-button-ghost inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-black transition"
            >
              <Download className="h-4 w-4" />
              Catalogue
            </a>
          </div>

          <p className="mt-5 text-sm app-subtle">
            © {new Date().getFullYear()} MKETICS (Pty) Ltd. All rights reserved.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.25em] text-sky-600 dark:text-sky-300">
            Explore
          </h3>

          <div className="mt-5 grid gap-3 text-sm">
            <a href="/services" className="app-muted hover:text-sky-500">Services</a>
            <a href="/solutions" className="app-muted hover:text-sky-500">Solutions</a>
            <a href="/pricing" className="app-muted hover:text-sky-500">Pricing</a>
            <a href="/mketics-digital-hub" className="app-muted hover:text-sky-500">Digital Hub</a>
            <a href="/docs/MKETICS_Service_Catalogue.pdf" download className="app-muted hover:text-sky-500">Download Catalogue</a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.25em] text-sky-600 dark:text-sky-300">
            Client Access
          </h3>

          <div className="mt-5 grid gap-3 text-sm">
            <a href="/client-login" className="app-muted hover:text-sky-500">Client Login</a>
            <a href="/quote" className="app-muted hover:text-sky-500">Request Quote</a>
            <a href="/contact" className="app-muted hover:text-sky-500">Contact MKETICS</a>
          </div>

          <div className="mt-6 rounded-2xl border border-sky-400/20 bg-sky-500/10 p-4">
            <div className="flex items-center gap-2 text-sm font-black text-sky-600 dark:text-sky-300">
              <CheckCircle2 className="h-4 w-4" />
              Speak Innovation. Deliver Value.
            </div>
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
              Secure, documented and support-focused delivery
            </div>
          </div>
        </div>
      </div>
    
      <div className="mt-8 rounded-3xl border border-sky-400/20 bg-sky-500/5 p-5">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-400">Trust & Compliance</p>
        <div className="mt-4 grid gap-3 text-sm app-muted sm:grid-cols-2 lg:grid-cols-4">
          <p><span className="font-black text-white">Registered:</span> MKETICS (PTY) LTD</p>
          <p><span className="font-black text-white">Reg No:</span> 2026/290708/07</p>
          <p><span className="font-black text-white">B-BBEE:</span> Level 1 Contributor</p>
          <p><span className="font-black text-white">Recognition:</span> 135% Procurement</p>
        </div>
      </div>

    </footer>
  );
}
