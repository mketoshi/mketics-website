import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Loader2,
  Lock,
  LogOut,
  Mail,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import SEO from "../components/seo/SEO";
import ClientPortalDashboard from "../components/client/ClientPortalDashboard";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";

const allowedPortalRoles = ["client", "admin", "staff"];
const authModes = [
  { id: "login", label: "Sign In" },
  { id: "register", label: "Create Account" },
  { id: "forgot", label: "Forgot Password" },
];

export default function ClientPortal() {
  const sessionRequestRef = useRef(0);
  const loginInProgressRef = useRef(false);

  const [portalState, setPortalState] = useState({
    loading: true,
    session: null,
    profile: null,
    error: "",
  });

  const [authMode, setAuthMode] = useState("login");

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [forgotForm, setForgotForm] = useState({
    email: "",
  });

  const [resetForm, setResetForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [loginStatus, setLoginStatus] = useState({
    loading: false,
    error: "",
    success: "",
  });

  const [registerStatus, setRegisterStatus] = useState({
    loading: false,
    error: "",
    success: "",
  });

  const [forgotStatus, setForgotStatus] = useState({
    loading: false,
    error: "",
    success: "",
  });

  const [resetStatus, setResetStatus] = useState({
    loading: false,
    error: "",
    success: "",
  });

  const isPortalUser = Boolean(
    portalState.session &&
      portalState.profile &&
      allowedPortalRoles.includes(portalState.profile.role)
  );

  useEffect(() => {
    let cancelled = false;

    async function startPortal() {
      const handledRecovery = await handlePasswordRecoveryRedirect();

      if (!cancelled && !handledRecovery) {
        await loadInitialSession();
      }
    }

    startPortal();

    if (!isSupabaseConfigured || !supabase) return undefined;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setAuthMode("reset");

        setPortalState({
          loading: false,
          session: session || null,
          profile: session?.user ? buildFallbackPortalProfile(session.user) : null,
          error: "",
        });

        setResetStatus({
          loading: false,
          error: "",
          success: "Recovery session ready. Enter and confirm your new password.",
        });

        return;
      }

      if (event === "SIGNED_OUT") {
        setPortalState({
          loading: false,
          session: null,
          profile: null,
          error: "",
        });
        return;
      }

      if (
        session &&
        authMode !== "reset" &&
        ["SIGNED_IN", "TOKEN_REFRESHED", "USER_UPDATED"].includes(event)
      ) {
        verifyPortalSession(session, session.user);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  async function handlePasswordRecoveryRedirect(options = {}) {
    const { quiet = false } = options;

    if (!isSupabaseConfigured || !supabase || typeof window === "undefined") {
      return false;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(
      window.location.hash ? window.location.hash.replace(/^#/, "") : ""
    );

    const code = searchParams.get("code");
    const urlType = searchParams.get("type") || hashParams.get("type");
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");
    const hasRecoverySignal =
      Boolean(code || accessToken || refreshToken) || urlType === "recovery";

    if (!hasRecoverySignal) return false;

    try {
      setAuthMode("reset");
      setPortalState((current) => ({ ...current, loading: true, error: "" }));

      let recoverySession = null;

      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) throw error;

        recoverySession = data?.session || null;
      } else if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) throw error;

        recoverySession = data?.session || null;
      } else {
        const { data } = await supabase.auth.getSession();
        recoverySession = data?.session || null;
      }

      cleanRecoveryUrl();

      if (!recoverySession) {
        setPortalState({
          loading: false,
          session: null,
          profile: null,
          error: "",
        });

        if (!quiet) {
          setResetStatus({
            loading: false,
            error:
              "The reset link opened, but no recovery session was created. Send a fresh reset link and open it in the same browser.",
            success: "",
          });
        }

        return true;
      }

      setPortalState({
        loading: false,
        session: recoverySession,
        profile: buildFallbackPortalProfile(recoverySession.user),
        error: "",
      });

      if (!quiet) {
        setResetStatus({
          loading: false,
          error: "",
          success: "Recovery session ready. Enter and confirm your new password.",
        });
      }

      return true;
    } catch (error) {
      cleanRecoveryUrl();

      setAuthMode("reset");
      setPortalState({
        loading: false,
        session: null,
        profile: null,
        error: "",
      });

      if (!quiet) {
        setResetStatus({
          loading: false,
          error:
            error?.message ||
            "Unable to prepare the password reset session. Send a new reset link and try again.",
          success: "",
        });
      }

      return true;
    }
  }

  async function ensurePasswordRecoverySession() {
    if (!supabase) return false;

    const { data } = await supabase.auth.getSession();

    if (data?.session) {
      return true;
    }

    await handlePasswordRecoveryRedirect({ quiet: true });

    const { data: retryData } = await supabase.auth.getSession();

    return Boolean(retryData?.session);
  }

  async function loadInitialSession() {
    const requestId = ++sessionRequestRef.current;

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

      if (requestId !== sessionRequestRef.current) return;

      const session = sessionData?.session || null;

      if (!session) {
        if (loginInProgressRef.current) return;

        setPortalState({
          loading: false,
          session: null,
          profile: null,
          error: "",
        });
        return;
      }

      await verifyPortalSession(session, session.user, {
        requestId,
        allowFallbackProfile: true,
      });
    } catch (error) {
      if (requestId !== sessionRequestRef.current) return;

      if (isAuthSessionMissingError(error)) {
        if (loginInProgressRef.current) return;

        setPortalState({
          loading: false,
          session: null,
          profile: null,
          error: "",
        });
        return;
      }

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

  async function verifyPortalSession(session, sessionUser, options = {}) {
    if (!supabase || !session) return false;

    const { requestId = sessionRequestRef.current, allowFallbackProfile = true } =
      options;

    try {
      setPortalState((current) => ({ ...current, loading: true, error: "" }));

      const user = sessionUser || session.user;

      if (!user?.id) {
        setPortalState({
          loading: false,
          session: null,
          profile: null,
          error: "Unable to find the signed-in Supabase user.",
        });
        return false;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, phone, organisation")
        .eq("id", user.id)
        .maybeSingle();

      if (requestId !== sessionRequestRef.current && !loginInProgressRef.current) {
        return false;
      }

      let portalProfile = profile;
      let profileWarning = "";

      if (profileError) {
        console.warn("Client portal profile lookup failed:", profileError);
        profileWarning =
          "Signed in, but the portal could not read the profile table. The dashboard opened using the authenticated account email.";
      }

      if (!portalProfile && allowFallbackProfile) {
        portalProfile = buildFallbackPortalProfile(user);
        profileWarning =
          "Signed in with a fallback portal profile. Link this account to a client record if client data does not appear.";
      }

      if (!portalProfile) {
        setPortalState({
          loading: false,
          session,
          profile: null,
          error:
            "Your login worked, but no MKETICS portal profile was found for this account. Create the client profile in Admin or Supabase and link it to a client record.",
        });
        return false;
      }

      if (!allowedPortalRoles.includes(portalProfile.role)) {
        if (allowFallbackProfile) {
          portalProfile = {
            ...portalProfile,
            role: "client",
          };
        } else {
          setPortalState({
            loading: false,
            session,
            profile: null,
            error: "This account does not have MKETICS client portal access.",
          });
          return false;
        }
      }

      setPortalState({
        loading: false,
        session,
        profile: portalProfile,
        error: profileWarning,
      });

      return true;
    } catch (error) {
      if (isAuthSessionMissingError(error)) {
        if (loginInProgressRef.current) return false;

        setPortalState({
          loading: false,
          session: null,
          profile: null,
          error: "",
        });
        return false;
      }

      const user = sessionUser || session.user;

      if (allowFallbackProfile && user?.id) {
        setPortalState({
          loading: false,
          session,
          profile: buildFallbackPortalProfile(user),
          error:
            "Signed in, but profile verification failed. The dashboard opened using the authenticated account email.",
        });
        return true;
      }

      setPortalState({
        loading: false,
        session: null,
        profile: null,
        error:
          error?.message ||
          "Unable to verify the client portal session. Please try signing in again.",
      });

      return false;
    }
  }

  async function handleLogin(event) {
    event.preventDefault();

    const submittedEmail = getSubmittedValue(
      event.currentTarget,
      "email",
      loginForm.email
    );

    const submittedPassword = getSubmittedValue(
      event.currentTarget,
      "password",
      loginForm.password
    );

    if (!submittedEmail || !submittedPassword) {
      setLoginStatus({
        loading: false,
        error:
          "Enter your portal email and password. If Chrome filled them automatically, delete and type them again once.",
        success: "",
      });
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setLoginStatus({
        loading: false,
        error: "Supabase is not configured.",
        success: "",
      });
      return;
    }

    try {
      const requestId = ++sessionRequestRef.current;
      loginInProgressRef.current = true;

      setLoginStatus({
        loading: true,
        error: "",
        success: "Signing in and checking portal access...",
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: submittedEmail,
        password: submittedPassword,
      });

      if (error) throw error;

      if (!data?.session) {
        throw new Error(
          "Login did not return an active session. Confirm this user is confirmed in Supabase Authentication."
        );
      }

      const verified = await verifyPortalSession(
        data.session,
        data.user || data.session.user,
        {
          requestId,
          allowFallbackProfile: true,
        }
      );

      if (!verified) {
        throw new Error(
          "Login worked, but the portal could not finish loading. Check the profile/client link and try again."
        );
      }

      setLoginForm({
        email: "",
        password: "",
      });

      setLoginStatus({ loading: false, error: "", success: "" });
    } catch (error) {
      setLoginStatus({
        loading: false,
        error:
          error?.message ||
          "Login failed. Check your email, password and portal profile.",
        success: "",
      });
    } finally {
      loginInProgressRef.current = false;
    }
  }

  async function handleRegister(event) {
    event.preventDefault();

    if (!registerForm.fullName.trim()) {
      setRegisterStatus({
        loading: false,
        error: "Enter your full name.",
        success: "",
      });
      return;
    }

    if (!registerForm.email.trim()) {
      setRegisterStatus({
        loading: false,
        error: "Enter your email address.",
        success: "",
      });
      return;
    }

    if (registerForm.password.length < 6) {
      setRegisterStatus({
        loading: false,
        error: "Password must be at least 6 characters.",
        success: "",
      });
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setRegisterStatus({
        loading: false,
        error: "Passwords do not match.",
        success: "",
      });
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setRegisterStatus({
        loading: false,
        error: "Supabase is not configured.",
        success: "",
      });
      return;
    }

    try {
      setRegisterStatus({ loading: true, error: "", success: "" });

      const { data, error } = await supabase.auth.signUp({
        email: registerForm.email.trim(),
        password: registerForm.password,
        options: {
          emailRedirectTo: `${window.location.origin}/client-portal`,
          data: {
            full_name: registerForm.fullName.trim(),
            portal_request: "client",
          },
        },
      });

      if (error) throw error;

      setRegisterForm({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setRegisterStatus({
        loading: false,
        error: "",
        success: data?.session
          ? "Account created. MKETICS must still link this account to a client record before client data appears."
          : "Account request created. Check your email to confirm the account, then MKETICS must link it to your client record.",
      });
    } catch (error) {
      setRegisterStatus({
        loading: false,
        error:
          error?.message ||
          "Unable to create the account. The email may already be registered.",
        success: "",
      });
    }
  }

  async function handleForgotPassword(event) {
    event.preventDefault();

    if (!forgotForm.email.trim()) {
      setForgotStatus({
        loading: false,
        error: "Enter the email address linked to your portal account.",
        success: "",
      });
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setForgotStatus({
        loading: false,
        error: "Supabase is not configured.",
        success: "",
      });
      return;
    }

    try {
      setForgotStatus({ loading: true, error: "", success: "" });

      const { error } = await supabase.auth.resetPasswordForEmail(
        forgotForm.email.trim(),
        {
          redirectTo: `${window.location.origin}/client-portal`,
        }
      );

      if (error) throw error;

      setForgotStatus({
        loading: false,
        error: "",
        success:
          "Password reset link sent. Check your email and follow the reset link.",
      });
    } catch (error) {
      setForgotStatus({
        loading: false,
        error:
          error?.message ||
          "Unable to send password reset email. Confirm the address and try again.",
        success: "",
      });
    }
  }

  async function handleUpdatePassword(event) {
    event.preventDefault();

    if (resetForm.password.length < 6) {
      setResetStatus({
        loading: false,
        error: "New password must be at least 6 characters.",
        success: "",
      });
      return;
    }

    if (resetForm.password !== resetForm.confirmPassword) {
      setResetStatus({
        loading: false,
        error: "Passwords do not match.",
        success: "",
      });
      return;
    }

    if (!supabase) return;

    try {
      setResetStatus({ loading: true, error: "", success: "" });

      const hasRecoverySession = await ensurePasswordRecoverySession();

      if (!hasRecoverySession) {
        throw new Error(
          "Auth session missing. Please request a fresh reset link and open it from the same browser before setting a new password."
        );
      }

      const { error } = await supabase.auth.updateUser({
        password: resetForm.password,
      });

      if (error) throw error;

      await supabase.auth.signOut();

      setResetForm({
        password: "",
        confirmPassword: "",
      });

      setAuthMode("login");
      setLoginStatus({
        loading: false,
        error: "",
        success: "Password updated. Sign in with your new password.",
      });
    } catch (error) {
      setResetStatus({
        loading: false,
        error:
          error?.message ||
          "Unable to update password. Use the reset link again if it expired.",
        success: "",
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


  async function handleClearPortalSession() {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.warn("Unable to sign out existing portal session:", error);
    }

    if (typeof window !== "undefined") {
      Object.keys(window.localStorage || {}).forEach((key) => {
        if (key.startsWith("sb-") || key.includes("supabase")) {
          window.localStorage.removeItem(key);
        }
      });

      Object.keys(window.sessionStorage || {}).forEach((key) => {
        if (key.startsWith("sb-") || key.includes("supabase")) {
          window.sessionStorage.removeItem(key);
        }
      });
    }

    setPortalState({
      loading: false,
      session: null,
      profile: null,
      error: "",
    });

    setLoginStatus({
      loading: false,
      error: "",
      success: "Portal session cleared. Type your email and password, then sign in again.",
    });
  }

  function updateLoginField(event) {
    const { name, value } = event.target;

    setLoginForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (loginStatus.error || loginStatus.success) {
      setLoginStatus({ loading: false, error: "", success: "" });
    }
  }

  function updateRegisterField(event) {
    const { name, value } = event.target;

    setRegisterForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (registerStatus.error || registerStatus.success) {
      setRegisterStatus({ loading: false, error: "", success: "" });
    }
  }

  function updateForgotField(event) {
    const { name, value } = event.target;

    setForgotForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (forgotStatus.error || forgotStatus.success) {
      setForgotStatus({ loading: false, error: "", success: "" });
    }
  }

  function updateResetField(event) {
    const { name, value } = event.target;

    setResetForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (resetStatus.error || resetStatus.success) {
      setResetStatus({ loading: false, error: "", success: "" });
    }
  }

  function changeAuthMode(mode) {
    setAuthMode(mode);
    setLoginStatus({ loading: false, error: "", success: "" });
    setRegisterStatus({ loading: false, error: "", success: "" });
    setForgotStatus({ loading: false, error: "", success: "" });
    setResetStatus({ loading: false, error: "", success: "" });
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
              active projects, quote records, invoices, receipts, support
              tickets and shared documents.
            </p>

            <div className="mt-7 rounded-[2rem] border border-cyan-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-bold leading-7 text-slate-700">
                Create Account only creates the login account. MKETICS must link
                the account to a client record before project and invoice data
                can display here.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
              {authMode === "register" ? (
                <UserPlus size={24} />
              ) : authMode === "forgot" || authMode === "reset" ? (
                <KeyRound size={24} />
              ) : (
                <Lock size={24} />
              )}
            </div>

            <h2 className="mt-5 text-3xl font-black text-[#020B1F]">
              {authMode === "register"
                ? "Create client account"
                : authMode === "forgot"
                  ? "Reset password"
                  : authMode === "reset"
                    ? "Set new password"
                    : "Client sign in"}
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              {authMode === "register"
                ? "Create the portal login account, then MKETICS will link it to your client record."
                : authMode === "forgot"
                  ? "Enter your portal email address and we will send a password reset link."
                  : authMode === "reset"
                    ? "Enter a new password for your MKETICS client portal account."
                    : "Use your MKETICS client portal email and password."}
            </p>

            {authMode !== "reset" && (
              <div className="mt-5 grid gap-2 rounded-full border border-slate-200 bg-[#F8FCFF] p-1 sm:grid-cols-3">
                {authModes.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => changeAuthMode(mode.id)}
                    className={`rounded-full px-4 py-2 text-xs font-black transition ${
                      authMode === mode.id
                        ? "bg-[#061A33] text-white shadow-sm"
                        : "text-slate-600 hover:bg-white hover:text-[#061A33]"
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            )}

            {portalState.error && (
              <StatusMessage type="error" message={portalState.error} />
            )}

            {authMode === "login" && (
              <LoginForm
                form={loginForm}
                status={loginStatus}
                onChange={updateLoginField}
                onSubmit={handleLogin}
                onForgot={() => changeAuthMode("forgot")}
                onClearSession={handleClearPortalSession}
              />
            )}

            {authMode === "register" && (
              <RegisterForm
                form={registerForm}
                status={registerStatus}
                onChange={updateRegisterField}
                onSubmit={handleRegister}
                onBack={() => changeAuthMode("login")}
              />
            )}

            {authMode === "forgot" && (
              <ForgotPasswordForm
                form={forgotForm}
                status={forgotStatus}
                onChange={updateForgotField}
                onSubmit={handleForgotPassword}
                onBack={() => changeAuthMode("login")}
              />
            )}

            {authMode === "reset" && (
              <ResetPasswordForm
                form={resetForm}
                status={resetStatus}
                onChange={updateResetField}
                onSubmit={handleUpdatePassword}
              />
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#EAF6FF] text-[#061A33]">
      <SEO
        title="MKETICS Client Portal"
        description="View MKETICS project, quote, invoice, support and document records."
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

function LoginForm({
  form,
  status,
  onChange,
  onSubmit,
  onForgot,
  onClearSession,
}) {
  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-4">
      {status.error && <StatusMessage type="error" message={status.error} />}
      {status.success && (
        <StatusMessage type="success" message={status.success} />
      )}

      <label className="block">
        <span className="text-sm font-black text-[#061A33]">
          Email Address
        </span>

        <input
          name="email"
          value={form.email}
          onChange={onChange}
          type="email"
          autoComplete="email"
          placeholder="client@example.com"
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
        />
      </label>

      <label className="block">
        <span className="text-sm font-black text-[#061A33]">Password</span>

        <input
          name="password"
          value={form.password}
          onChange={onChange}
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onClearSession}
          className="text-sm font-black text-slate-500 hover:text-[#0B7CFF] hover:underline"
        >
          Reset portal session
        </button>

        <button
          type="button"
          onClick={onForgot}
          className="text-sm font-black text-[#0B7CFF] hover:underline"
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={status.loading}
        className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF] px-6 py-3 font-black text-white shadow-[0_16px_40px_rgba(0,174,239,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status.loading ? (
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
  );
}

function RegisterForm({ form, status, onChange, onSubmit, onBack }) {
  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-4">
      {status.error && <StatusMessage type="error" message={status.error} />}
      {status.success && (
        <StatusMessage type="success" message={status.success} />
      )}

      <label className="block">
        <span className="text-sm font-black text-[#061A33]">Full Name</span>
        <input
          name="fullName"
          value={form.fullName}
          onChange={onChange}
          type="text"
          placeholder="Client full name"
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
        />
      </label>

      <label className="block">
        <span className="text-sm font-black text-[#061A33]">
          Email Address
        </span>
        <input
          name="email"
          value={form.email}
          onChange={onChange}
          type="email"
          autoComplete="email"
          placeholder="client@example.com"
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-black text-[#061A33]">Password</span>
          <input
            name="password"
            value={form.password}
            onChange={onChange}
            type="password"
            autoComplete="new-password"
            placeholder="Create password"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
          />
        </label>

        <label className="block">
          <span className="text-sm font-black text-[#061A33]">
            Confirm Password
          </span>
          <input
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={onChange}
            type="password"
            autoComplete="new-password"
            placeholder="Confirm password"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
          />
        </label>
      </div>

      <div className="rounded-2xl border border-cyan-200 bg-[#F8FCFF] p-4">
        <p className="text-xs font-bold leading-6 text-slate-600">
          After creating the account, MKETICS must link your login to a client
          record before private projects, invoices and documents can display.
        </p>
      </div>

      <button
        type="submit"
        disabled={status.loading}
        className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF] px-6 py-3 font-black text-white shadow-[0_16px_40px_rgba(0,174,239,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status.loading ? (
          <>
            <Loader2 size={18} className="mr-2 animate-spin" />
            Creating Account
          </>
        ) : (
          <>
            <UserPlus size={18} className="mr-2" />
            Create Account
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="text-sm font-black text-[#0B7CFF] hover:underline"
      >
        Already have an account? Sign in
      </button>
    </form>
  );
}

function ForgotPasswordForm({ form, status, onChange, onSubmit, onBack }) {
  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-4">
      {status.error && <StatusMessage type="error" message={status.error} />}
      {status.success && (
        <StatusMessage type="success" message={status.success} />
      )}

      <label className="block">
        <span className="text-sm font-black text-[#061A33]">
          Portal Email Address
        </span>
        <input
          name="email"
          value={form.email}
          onChange={onChange}
          type="email"
          autoComplete="email"
          placeholder="client@example.com"
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
        />
      </label>

      <button
        type="submit"
        disabled={status.loading}
        className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF] px-6 py-3 font-black text-white shadow-[0_16px_40px_rgba(0,174,239,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status.loading ? (
          <>
            <Loader2 size={18} className="mr-2 animate-spin" />
            Sending Link
          </>
        ) : (
          <>
            <Mail size={18} className="mr-2" />
            Send Reset Link
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="text-sm font-black text-[#0B7CFF] hover:underline"
      >
        Back to sign in
      </button>
    </form>
  );
}

function ResetPasswordForm({ form, status, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-4">
      {status.error && <StatusMessage type="error" message={status.error} />}
      {status.success && (
        <StatusMessage type="success" message={status.success} />
      )}

      <label className="block">
        <span className="text-sm font-black text-[#061A33]">
          New Password
        </span>
        <input
          name="password"
          value={form.password}
          onChange={onChange}
          type="password"
          autoComplete="new-password"
          placeholder="New password"
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
        />
      </label>

      <label className="block">
        <span className="text-sm font-black text-[#061A33]">
          Confirm New Password
        </span>
        <input
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={onChange}
          type="password"
          autoComplete="new-password"
          placeholder="Confirm new password"
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
        />
      </label>

      <button
        type="submit"
        disabled={status.loading}
        className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF] px-6 py-3 font-black text-white shadow-[0_16px_40px_rgba(0,174,239,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status.loading ? (
          <>
            <Loader2 size={18} className="mr-2 animate-spin" />
            Updating Password
          </>
        ) : (
          <>
            <KeyRound size={18} className="mr-2" />
            Update Password
          </>
        )}
      </button>
    </form>
  );
}

function cleanRecoveryUrl() {
  if (typeof window === "undefined") return;

  const cleanUrl = `${window.location.origin}${window.location.pathname}`;
  window.history.replaceState({}, document.title, cleanUrl);
}

function buildFallbackPortalProfile(user) {
  const metadata = user?.user_metadata || {};
  const fullName =
    metadata.full_name ||
    metadata.name ||
    user?.email?.split("@")[0] ||
    "MKETICS Client";

  return {
    id: user.id,
    full_name: fullName,
    email: user.email || "",
    role: "client",
    phone: metadata.phone || null,
    organisation: metadata.organisation || null,
  };
}

function getSubmittedValue(formElement, fieldName, fallback = "") {
  const formData = new FormData(formElement);
  const value = formData.get(fieldName);

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof fallback === "string" && fallback.trim()) {
    return fallback.trim();
  }

  return "";
}

function isAuthSessionMissingError(error) {
  const message = String(error?.message || "").toLowerCase();
  const name = String(error?.name || "").toLowerCase();

  return (
    message.includes("auth session missing") ||
    name.includes("authsessionmissing")
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
