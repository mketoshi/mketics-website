import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

import {
  Mail,
  LockKeyhole,
  UserRound,
  ShieldCheck,
} from "lucide-react";

export default function ClientRegister() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("");
  const [loading, setLoading] = useState(false);

  const register = async (e) => {
    e.preventDefault();

    setLoading(true);
    setNotice("");
    setNoticeType("");

    const { error } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: "client",
          },
          emailRedirectTo: `${window.location.origin}/client-portal`,
        },
      });

    setLoading(false);

    if (error) {
      setNotice(error.message || "Could not create account.");
      setNoticeType("error");
      return;
    }

    setNotice(
      "Account created successfully. Please verify your email."
    );

    setNoticeType("success");

    setFullName("");
    setEmail("");
    setPassword("");
  };

  return (
    <main className="flex min-h-screen items-center justify-center app-bg px-4">
      <form
        onSubmit={register}
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
              Create Account
            </h1>

            <p className="text-sm app-subtle">
              MKETICS Client Portal
            </p>
          </div>
        </a>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-4 py-2 text-sm font-bold text-sky-600 dark:text-sky-300">
          <ShieldCheck className="h-4 w-4" />
          Secure Client Registration
        </div>

        <p className="mt-6 app-muted">
          Create your MKETICS client account
          to access projects, invoices, support
          systems, and digital services.
        </p>

        {notice && (
          <div
            className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
              noticeType === "success"
                ? "border border-green-400/30 bg-green-500/10 text-green-600 dark:text-green-200"
                : "border border-red-400/30 bg-red-500/10 text-red-500 dark:text-red-200"
            }`}
          >
            {notice}
          </div>
        )}

        <div className="relative mt-6">
          <UserRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

          <input
            className="app-input w-full rounded-2xl py-3 pl-12 pr-4 outline-none"
            placeholder="Full name"
            type="text"
            value={fullName}
            onChange={(e) =>
              setFullName(e.target.value)
            }
            required
          />
        </div>

        <div className="relative mt-4">
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
            minLength="6"
            required
          />
        </div>

        <button
          className="mt-6 w-full rounded-full bg-sky-500 px-6 py-4 font-black text-white transition hover:bg-sky-400 disabled:opacity-60"
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Creating account..."
            : "Create Account"}
        </button>

        <div className="mt-5 flex items-center justify-between text-sm">
          <a
            href="/client-login"
            className="font-bold text-sky-600 hover:text-sky-500 dark:text-sky-300"
          >
            Already have an account?
          </a>

          <a
            href="/"
            className="app-subtle hover:text-sky-500"
          >
            Back home
          </a>
        </div>
      </form>
    </main>
  );
}