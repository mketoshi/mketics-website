import {
  Menu,
  X,
  UserCircle,
  LogOut,
  Download,
} from "lucide-react";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [session, setSession] = useState(null);

  const links = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Solutions", href: "/solutions" },
    { label: "Pricing", href: "/pricing" },
    { label: "Digital Hub", href: "/mketics-digital-hub" },
    { label: "Contact", href: "/contact" },
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 mketics-nav-shell border-b border-slate-200/70 bg-white/95 backdrop-blur-2xl dark:border-white/10 dark:bg-[#020617]/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <a href="/" className="flex min-w-0 items-center gap-3">
          <span className="mketics-logo-frame h-12 w-12 shrink-0 sm:h-14 sm:w-14">
            <img
              src="/images/logo-icon.webp?v=2"
              alt="MKETICS"
              className="h-9 w-9 object-contain drop-shadow-[0_0_20px_rgba(14,165,233,0.35)] sm:h-10 sm:w-10"
            />
          </span>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-black tracking-wide text-slate-950 dark:text-white sm:text-xl">
              MKETICS
            </h1>

            <p className="hidden text-[10px] font-bold tracking-[0.22em] text-sky-600 dark:text-sky-300 sm:block">
              BUILD • CONNECT • PROTECT
            </p>
          </div>
        </a>

        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-sky-500/10 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-300"
            >
              {link.label}
            </a>
          ))}

          <a
            href="/docs/MKETICS_Service_Catalogue.pdf"
            download
            className="mketics-button-ghost inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black transition"
          >
            <Download className="h-4 w-4" />
            Catalogue
          </a>

          {!session ? (
            <a
              href="/client-login"
              className="mketics-button-ghost rounded-full px-5 py-3 text-sm font-black transition"
            >
              Client Login
            </a>
          ) : (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-900 hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                <UserCircle className="h-5 w-5 text-sky-500" />
                Profile
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-white/10 dark:bg-slate-950">
                  <p className="px-3 py-2 text-xs app-subtle">
                    {session.user?.email}
                  </p>

                  <a
                    href="/client-portal"
                    className="block rounded-xl px-3 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5"
                  >
                    Client Portal
                  </a>

                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="inline-flex shrink-0 rounded-xl border border-slate-200 bg-slate-100 p-3 text-slate-900 lg:hidden dark:border-white/10 dark:bg-white/5 dark:text-white"
          aria-expanded={open}
          aria-label="Toggle navigation menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="mobile-menu-panel border-t border-slate-200 bg-white shadow-2xl lg:hidden dark:border-white/10 dark:bg-[#020617]">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 sm:px-6">
            <p className="mb-1 text-xs font-black uppercase tracking-[0.22em] text-sky-600 dark:text-sky-300">
              Navigation
            </p>

            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="mketics-mobile-link flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-base font-black text-slate-800 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-white"
              >
                <span>{link.label}</span>
                <span className="text-sky-500">→</span>
              </a>
            ))}

            <div className="mt-2 grid gap-3">
              <a
                href="/docs/MKETICS_Service_Catalogue.pdf"
                download
                onClick={() => setOpen(false)}
                className="rounded-2xl border border-sky-400/30 bg-sky-500/10 px-5 py-4 text-center text-base font-black text-sky-700 dark:text-sky-200"
              >
                Download Catalogue
              </a>

              <a
                href="/quote"
                onClick={() => setOpen(false)}
                className="mketics-button-primary rounded-2xl px-5 py-4 text-center text-base font-black transition"
              >
                Request Quote
              </a>

              <a
            href="/docs/MKETICS_Service_Catalogue.pdf"
            download
            className="mketics-button-ghost inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black transition"
          >
            <Download className="h-4 w-4" />
            Catalogue
          </a>

          {!session ? (
                <a
                  href="/client-login"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-center text-base font-black text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200"
                >
                  Client Login
                </a>
              ) : (
                <>
                  <a
                    href="/client-portal"
                    onClick={() => setOpen(false)}
                    className="rounded-2xl border border-sky-400/30 bg-sky-500/10 px-5 py-4 text-center text-base font-black text-sky-700 dark:text-sky-200"
                  >
                    Client Portal
                  </a>

                  <button
                    onClick={logout}
                    className="rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-base font-black text-red-500"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
