import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

import {
  LockKeyhole,
  Mail,
  ShieldCheck,
  Rocket,
  ArrowRight,
} from "lucide-react";

export default function ClientLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e) => {
    e.preventDefault();

    setLoading(true);
    setNotice("");

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    setLoading(false);

    if (error) {
      setNotice(
        "Login failed. Please check your email or password."
      );

      return;
    }

    window.location.href = "/client-portal";
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden app-bg px-4 py-10">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-sky-500 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-purple-500 blur-3xl" />
      </div>

      <div className="glass-card relative w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
        <a href="/" className="inline-flex items-center gap-4">
          <img
            src="/images/logo-icon.webp"
            alt="MKETICS"
            className="h-14 w-14 rounded-2xl object-contain"
          />

          <div>
            <h1 className="text-3xl font-black">
              Client Login
            </h1>

            <p className="text-sm app-subtle">
              MKETICS Client Portal
            </p>
          </div>
        </a>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-4 py-2 text-sm font-black text-sky-600 dark:text-sky-300">
          <ShieldCheck className="h-4 w-4" />
          Secure Client Access
        </div>

        <p className="mt-6 leading-7 app-muted">
          Login securely to access invoices, projects, support requests,
          proposals and business systems.
        </p>

        {notice && (
          <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-500 dark:text-red-200">
            {notice}
          </div>
        )}

        <form onSubmit={login} className="mt-8 grid gap-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              className="app-input w-full rounded-2xl py-4 pl-12 pr-4 outline-none"
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          <div className="relative">
            <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              className="app-input w-full rounded-2xl py-4 pl-12 pr-4 outline-none"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />
          </div>

          <button
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-6 py-4 font-black text-white transition hover:bg-sky-400 disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login to Client Portal"}

            <ArrowRight className="h-5 w-5" />
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm">
          <a
            href="/client-register"
            className="font-black text-sky-600 hover:text-sky-500 dark:text-sky-300"
          >
            Create account
          </a>

          <a
            href="/forgot-password"
            className="app-subtle hover:text-sky-500"
          >
            Forgot password?
          </a>
        </div>

        <div className="mt-8 rounded-2xl border border-sky-400/20 bg-sky-500/10 p-5">
          <div className="flex items-center gap-3">
            <Rocket className="h-6 w-6 text-sky-500" />

            <div>
              <p className="font-black">
                MKETICS SaaS Platform
              </p>

              <p className="text-sm app-subtle">
                Enterprise client ecosystem
              </p>
            </div>
          </div>
        </div>

        <a
          href="/"
          className="mt-6 block text-center text-sm app-subtle hover:text-sky-500"
        >
          Back to MKETICS
        </a>
      </div>
    </main>
  );
}
