import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

import {
  LockKeyhole,
  Mail,
  ShieldCheck,
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
    <main className="flex min-h-screen items-center justify-center app-bg px-4">
      <form
        onSubmit={login}
        className="w-full max-w-md rounded-[2rem] app-card p-8 shadow-2xl"
      >
        <a href="/" className="inline-flex items-center gap-3">
          <img
            src="/images/logo-icon.webp"
            alt="MKETICS"
            className="h-12 w-12 rounded-2xl object-contain"
          />

          <div>
            <h1 className="text-2xl font-black">
              Client Login
            </h1>

            <p className="text-sm app-subtle">
              MKETICS Client Portal
            </p>
          </div>
        </a>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-4 py-2 text-sm font-bold text-sky-600 dark:text-sky-300">
          <ShieldCheck className="h-4 w-4" />
          Secure Client Access
        </div>

        <p className="mt-6 app-muted">
          Login securely to access your invoices,
          projects, support requests, and business
          systems.
        </p>

        {notice && (
          <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-500 dark:text-red-200">
            {notice}
          </div>
        )}

        <div className="relative mt-6">
          <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

          <input
            className="app-input w-full rounded-2xl py-3 pl-12 pr-4 outline-none"
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />
        </div>

        <div className="relative mt-4">
          <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

          <input
            className="app-input w-full rounded-2xl py-3 pl-12 pr-4 outline-none"
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
          className="mt-6 w-full rounded-full bg-sky-500 px-6 py-4 font-black text-white transition hover:bg-sky-400 disabled:opacity-60"
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Logging in..."
            : "Login to Client Portal"}
        </button>

        <div className="mt-5 flex items-center justify-between text-sm">
          <a
            href="/client-register"
            className="font-bold text-sky-600 hover:text-sky-500 dark:text-sky-300"
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

        <a
          href="/"
          className="mt-5 block text-center text-sm app-subtle hover:text-sky-500"
        >
          Back to MKETICS
        </a>
      </form>
    </main>
  );
}