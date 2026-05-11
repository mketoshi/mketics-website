import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

import {
  LockKeyhole,
  ShieldCheck,
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
    <main className="flex min-h-screen items-center justify-center app-bg px-4">
      <form
        onSubmit={updatePassword}
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
              Reset Password
            </h1>

            <p className="text-sm app-subtle">
              MKETICS Client Portal
            </p>
          </div>
        </a>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-4 py-2 text-sm font-bold text-sky-600 dark:text-sky-300">
          <ShieldCheck className="h-4 w-4" />
          Secure Password Update
        </div>

        <p className="mt-6 app-muted">
          Create a new secure password for your MKETICS client account.
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
          <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

          <input
            className="app-input w-full rounded-2xl py-3 pl-12 pr-4 outline-none"
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
            className="app-input w-full rounded-2xl py-3 pl-12 pr-4 outline-none"
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
        </button>

        <a
          href="/client-login"
          className="mt-5 block text-center text-sm app-subtle hover:text-sky-500"
        >
          Back to Login
        </a>
      </form>
    </main>
  );
}