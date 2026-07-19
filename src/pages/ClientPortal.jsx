import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import SEO from "../components/seo/SEO";
import ClientPortalDashboard from "../components/client/ClientPortalDashboard";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";

const allowedPortalRoles = ["client", "admin", "staff"];

export default function ClientPortal() {
  const [portalState, setPortalState] = useState({
    loading: true,
    session: null,
    profile: null,
    error: "",
  });

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [loginStatus, setLoginStatus] = useState({
    loading: false,
    error: "",
  });

  const isPortalUser = Boolean(
    portalState.session &&
      portalState.profile &&
      allowedPortalRoles.includes(portalState.profile.role)
  );

  useEffect(() => {
    loadInitialSession();

    if (!isSupabaseConfigured || !supabase) return undefined;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadInitialSession();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadInitialSession() {
    if (!isSupabaseConfigured || !supabase) {
      setPortalState({
        loading: false,
        session: null,
        profile: null,
        error:
          "Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
      });
      return;
    }

    try {
      setPortalState((current) => ({ ...current, loading: true, error: "" }));

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      const session = sessionData?.session || null;

      if (!session) {
        setPortalState({
          loading: false,
          session: null,
          profile: null,
          error: "",
        });
        return;
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError) throw userError;

      const user = userData?.user;

      if (!user?.id) {
        await supabase.auth.signOut();

        setPortalState({
          loading: false,
          session: null,
          profile: null,
          error: "Unable to find the signed-in Supabase user.",
        });
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, phone, organisation")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        await supabase.auth.signOut();

        setPortalState({
          loading: false,
          session: null,
          profile: null,
          error:
            "Your login worked, but no MKETICS portal profile was found for this account.",
        });
        return;
      }

      if (!allowedPortalRoles.includes(profile.role)) {
        await supabase.auth.signOut();

        setPortalState({
          loading: false,
          session: null,
          profile: null,
          error: "This account does not have MKETICS client portal access.",
        });
        return;
      }

      setPortalState({
        loading: false,
        session,
        profile,
        error: "",
      });
    } catch (error) {
      setPortalState({
        loading: false,
        session: null,
        profile: null,
        error:
          error?.message ||
          "Unable to verify the client portal session. Please try signing in again.",
      });
    }
  }

  async function handleLogin(event) {
    event.preventDefault();

    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      setLoginStatus({
        loading: false,
        error: "Enter your portal email and password.",
      });
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setLoginStatus({
        loading: false,
        error: "Supabase is not configured.",
      });
      return;
    }

    try {
      setLoginStatus({ loading: true, error: "" });

      const { error } = await supabase.auth.signInWithPassword({
        email: loginForm.email.trim(),
        password: loginForm.password,
      });

      if (error) throw error;

      await loadInitialSession();

      setLoginForm({
        email: "",
        password: "",
      });

      setLoginStatus({ loading: false, error: "" });
    } catch (error) {
      setLoginStatus({
        loading: false,
        error:
          error?.message ||
          "Login failed. Check your email, password and portal profile.",
      });
    }
  }

  async function handleLogout() {
    if (!supabase) return;

    await supabase.auth.signOut();

    setPortalState({
      loading: false,
      session: null,
      profile: null,
      error: "",
    });
  }

  function updateLoginField(event) {
    const { name, value } = event.target;

    setLoginForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (loginStatus.error) {
      setLoginStatus({ loading: false, error: "" });
    }
  }

  if (portalState.loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#EAF6FF] px-5 text-[#061A33]">
        <SEO title="MKETICS Client Portal" description="MKETICS client portal." />

        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-[#0B7CFF]" size={34} />
          <p className="mt-4 text-sm font-black text-slate-600">
            Checking client portal session...
          </p>
        </div>
      </main>
    );
  }

  if (!isPortalUser) {
    return (
      <main className="min-h-screen bg-[#EAF6FF] px-5 py-12 text-[#061A33]">
        <SEO
          title="MKETICS Client Portal Login"
          description="Sign in to the MKETICS client portal."
        />

        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#0B7CFF] shadow-sm">
              <ShieldCheck size={16} />
              MKETICS Client Portal
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-tight text-[#020B1F] sm:text-5xl">
              View your projects, quotes and support updates.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
              Client portal access gives MKETICS clients a simple place to view
              active projects, quote records, support tickets and shared
              documents.
            </p>

            <div className="mt-7 rounded-[2rem] border border-cyan-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-bold leading-7 text-slate-700">
                This foundation uses Supabase authentication, profile roles and
                client-linked records. A client profile must be linked to a
                client record before data can display here.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleLogin}
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl sm:p-8"
          >
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
              <Lock size={24} />
            </div>

            <h2 className="mt-5 text-3xl font-black text-[#020B1F]">
              Client sign in
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              Use the client portal account created by MKETICS.
            </p>

            {portalState.error && (
              <StatusMessage type="error" message={portalState.error} />
            )}

            {loginStatus.error && (
              <StatusMessage type="error" message={loginStatus.error} />
            )}

            <div className="mt-6 grid gap-4">
              <label className="block">
                <span className="text-sm font-black text-[#061A33]">
                  Email Address
                </span>

                <input
                  name="email"
                  value={loginForm.email}
                  onChange={updateLoginField}
                  type="email"
                  placeholder="client@example.com"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-black text-[#061A33]">
                  Password
                </span>

                <input
                  name="password"
                  value={loginForm.password}
                  onChange={updateLoginField}
                  type="password"
                  placeholder="Your password"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loginStatus.loading}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF] px-6 py-3 font-black text-white shadow-[0_16px_40px_rgba(0,174,239,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loginStatus.loading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Signing in
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} className="ml-2" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#EAF6FF] text-[#061A33]">
      <SEO
        title="MKETICS Client Portal"
        description="View MKETICS project, quote, support and document records."
      />

      <section className="border-b border-white/70 bg-[#061A33] px-5 py-6 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
              MKETICS Client Portal
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Client Dashboard
            </h1>

            <p className="mt-2 text-sm font-semibold text-slate-300">
              Signed in as {portalState.profile?.full_name || portalState.profile?.email}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-black text-white transition hover:border-cyan-300 hover:bg-cyan-300 hover:text-[#061A33]"
          >
            <LogOut size={17} className="mr-2" />
            Sign Out
          </button>
        </div>
      </section>

      <ClientPortalDashboard profile={portalState.profile} />
    </main>
  );
}

function StatusMessage({ type, message }) {
  const isError = type === "error";

  return (
    <div
      className={`mt-5 flex items-start gap-3 rounded-2xl border p-4 ${
        isError
          ? "border-red-200 bg-red-50 text-red-900"
          : "border-emerald-200 bg-emerald-50 text-emerald-900"
      }`}
    >
      {isError ? (
        <AlertCircle size={20} className="mt-0.5 shrink-0" />
      ) : (
        <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
      )}

      <p className="text-sm font-bold leading-6">{message}</p>
    </div>
  );
}
