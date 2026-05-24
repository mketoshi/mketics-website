import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

import {
  LockKeyhole,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("");

  const updatePassword = async (e) => {
    e.preventDefault();

    setNotice("");
    setNoticeType("");

    if (password.length < 6) {
      setNotice("Password must be at least 6 characters.");
      setNoticeType("error");
      return;
    }

    if (password !== confirmPassword) {
      setNotice("Passwords do not match.");
      setNoticeType("error");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setNotice(error.message || "Could not update password.");
      setNoticeType("error");
      return;
    }

    setNotice("Password updated successfully. Redirecting to login...");
    setNoticeType("success");

    setPassword("");
    setConfirmPassword("");

    setTimeout(() => {
      window.location.href = "/client-login";
    }, 2000);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden app-bg px-4 py-10">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-sky-500 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-purple-500 blur-3xl" />
      </div>

      <form
        onSubmit={updatePassword}
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
              Reset Password
            </h1>

            <p className="text-sm app-subtle">
              MKETICS Client Portal
            </p>
          </div>
        </a>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-4 py-2 text-sm font-black text-sky-600 dark:text-sky-300">
          <ShieldCheck className="h-4 w-4" />
          Secure Password Update
        </div>

        <p className="mt-6 leading-7 app-muted">
          Create a new secure password for your MKETICS client account. Use at
          least 6 characters.
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
          <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

          <input
            className="app-input w-full rounded-2xl py-4 pl-12 pr-4 outline-none"
            placeholder="New password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="relative mt-4">
          <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

          <input
            className="app-input w-full rounded-2xl py-4 pl-12 pr-4 outline-none"
            placeholder="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-sky-500 px-6 py-4 font-black text-white transition hover:bg-sky-400 disabled:opacity-60"
          type="submit"
          disabled={loading}
        >
          <ShieldCheck className="h-5 w-5" />

          {loading ? "Updating password..." : "Update Password"}

          <ArrowRight className="h-5 w-5" />
        </button>

        <div className="mt-6 rounded-2xl border border-green-400/20 bg-green-500/10 p-5">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-500" />

            <div>
              <p className="font-black">
                Protected Client Access
              </p>

              <p className="text-sm app-subtle">
                After updating your password, you will return to login.
              </p>
            </div>
          </div>
        </div>

        <a
          href="/client-login"
          className="mt-6 block text-center text-sm app-subtle hover:text-sky-500"
        >
          Back to Login
        </a>
      </form>
    </main>
  );
}
