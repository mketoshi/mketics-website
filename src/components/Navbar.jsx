import {
  Menu,
  X,
  UserCircle,
  LogOut,
} from "lucide-react";

import { useEffect, useState } from "react";

import { supabase } from "../lib/supabaseClient";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [session, setSession] = useState(null);

  const links = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Services",
      href: "/services",
    },
    {
      label: "Portfolio",
      href: "/portfolio",
    },
    {
      label: "Pricing",
      href: "/pricing",
    },
    {
      label: "Digital Hub",
      href: "/mketics-digital-hub",
    },
    {
      label: "Contact",
      href: "/contact",
    },
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session);
        }
      );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-2xl dark:border-white/10 dark:bg-[#020617]/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        {/* LOGO */}
        <a href="/" className="flex items-center gap-4">
          <img
            src="/images/logo-icon.webp?v=2"
            alt="MKETICS"
            className="h-14 w-14 object-contain drop-shadow-[0_0_20px_rgba(14,165,233,0.35)]"
          />

          <div>
            <h1 className="text-2xl font-black tracking-wide text-slate-950 dark:text-white">
              MKETICS
            </h1>

            <p className="text-xs tracking-[0.25em] text-sky-600 dark:text-sky-300">
              SYSTEMS • INFRASTRUCTURE • DIGITAL
            </p>
          </div>
        </a>

        {/* DESKTOP NAV */}
        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-bold text-slate-600 transition hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-300"
            >
              {link.label}
            </a>
          ))}

          <a
            href="/#quote"
            className="rounded-full bg-sky-500 px-6 py-3 text-sm font-black text-white transition hover:bg-sky-400"
          >
            Request Quote
          </a>

          {!session ? (
            <a
              href="/client-login"
              className="text-sm font-bold text-slate-500 transition hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-300"
            >
              Client Login
            </a>
          ) : (
            <div className="relative">
              <button
                onClick={() =>
                  setProfileOpen(!profileOpen)
                }
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

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setOpen(!open)}
          className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-3 text-slate-900 lg:hidden dark:border-white/10 dark:bg-white/5 dark:text-white"
        >
          {open ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="border-t border-slate-200 bg-white lg:hidden dark:border-white/10 dark:bg-[#020617]">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
              >
                {link.label}
              </a>
            ))}

            <a
              href="/#quote"
              onClick={() => setOpen(false)}
              className="rounded-2xl bg-sky-500 px-5 py-4 text-center text-sm font-black text-white"
            >
              Request Quote
            </a>

            {!session ? (
              <a
                href="/client-login"
                onClick={() => setOpen(false)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-center text-sm font-bold text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
              >
                Client Login
              </a>
            ) : (
              <>
                <a
                  href="/client-portal"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl border border-sky-400/20 bg-sky-500/10 px-5 py-4 text-center text-sm font-bold text-sky-700 dark:text-sky-200"
                >
                  Client Portal
                </a>

                <button
                  onClick={logout}
                  className="rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-500"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}