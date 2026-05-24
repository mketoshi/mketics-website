import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

import {
  Mail,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  LockKeyhole,
} from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("");

  const resetPassword = async (e) => {
    e.preventDefault();

    setLoading(true);
    setNotice("");
    setNoticeType("");

    const { error } =
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

    setLoading(false);

    if (error) {
      setNotice(
        error.message || "Could not send password reset email."
      );

      setNoticeType("error");

      return;
    }

    setNotice(
      "Password reset email sent successfully. Please check your inbox."
    );

    setNoticeType("success");

    setEmail("");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden app-bg px-4 py-10">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-sky-500 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-purple-500 blur-3xl" />
      </div>

      <form
        onSubmit={resetPassword}
        className="glass-card relative w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl"
      >
        <a href="/" className="inline-flex items-center gap-4">
          <img
            src="/images/logo-icon.webp?v=2"
            alt="MKETICS"
            className="h-14 w-14 rounded-2xl object-contain"
          />

          <div>
            <h1 className="text-3xl font-black">
              Forgot Password
            </h1>

            <p className="text-sm app-subtle">
              MKETICS Client Portal
            </p>
          </div>
        </a>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-4 py-2 text-sm font-black text-sky-600 dark:text-sky-300">
          <ShieldCheck className="h-4 w-4" />
          Secure Password Recovery
        </div>

        <p className="mt-6 leading-7 app-muted">
          Enter your email address and MKETICS will send you a secure password
          reset link for your client portal account.
        </p>

        {notice && (
          <div
            className={`mt-5 rounded-2xl px-4 py-3 text-sm font-bold ${
              noticeType === "success"
                ? "border border-green-400/30 bg-green-500/10 text-green-600 dark:text-green-200"
                : "border border-red-400/30 bg-red-500/10 text-red-500 dark:text-red-200"
            }`}
          >
            {notice}
          </div>
        )}

        <div className="relative mt-8">
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

        <button
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-sky-500 px-6 py-4 font-black text-white transition hover:bg-sky-400 disabled:opacity-60"
          type="submit"
          disabled={loading}
        >
          <KeyRound className="h-5 w-5" />

          {loading
            ? "Sending reset link..."
            : "Send Reset Link"}

          <ArrowRight className="h-5 w-5" />
        </button>

        <div className="mt-6 rounded-2xl border border-sky-400/20 bg-sky-500/10 p-5">
          <div className="flex items-center gap-3">
            <LockKeyhole className="h-6 w-6 text-sky-500" />

            <div>
              <p className="font-black">
                Secure Account Recovery
              </p>

              <p className="text-sm app-subtle">
                Reset links are handled through Supabase authentication.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between text-sm">
          <a
            href="/client-login"
            className="font-black text-sky-600 hover:text-sky-500 dark:text-sky-300"
          >
            Back to Login
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
