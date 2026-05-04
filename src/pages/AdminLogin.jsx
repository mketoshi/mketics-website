import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

if (error) {
  setNotice("Login failed. Check your email or password.");
  return;
}

    window.location.href = "/admin";
  };

  return (
    <main className="min-h-[100svh] flex items-center justify-center bg-slate-950 px-4 text-white">
      <form
        onSubmit={login}
        className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 shadow-2xl"
      >
        <h1 className="text-3xl font-black">MKETICS Admin</h1>
        <p className="mt-2 text-slate-400">Login to manage leads</p>

{notice && (
  <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
    {notice}
  </div>
)}

        <input
          className="mt-6 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          className="mt-6 w-full rounded-full bg-sky-500 px-6 py-4 font-black text-white hover:bg-sky-400 disabled:opacity-60"
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </main>
  );
}