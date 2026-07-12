import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import SEO from "../components/seo/SEO";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";

const allowedRoles = ["admin", "staff"];

export default function Admin() {
  const [authState, setAuthState] = useState({
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

  const [leadsState, setLeadsState] = useState({
    loading: false,
    error: "",
    leads: [],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const isAdmin = Boolean(
    authState.session &&
      authState.profile &&
      allowedRoles.includes(authState.profile.role)
  );

  const filteredLeads = useMemo(() => {
    return leadsState.leads.filter((lead) => {
      const matchesStatus =
        statusFilter === "all" || lead.status === statusFilter;

      const searchableText = [
        lead.full_name,
        lead.email,
        lead.phone,
        lead.organisation,
        lead.service_needed,
        lead.budget,
        lead.timeline,
        lead.lead_source,
        lead.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchTerm.trim() ||
        searchableText.includes(searchTerm.trim().toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [leadsState.leads, searchTerm, statusFilter]);

  const leadStats = useMemo(() => {
    const total = leadsState.leads.length;
    const newLeads = leadsState.leads.filter(
      (lead) => lead.status === "new"
    ).length;
    const quoted = leadsState.leads.filter(
      (lead) => lead.status === "quoted"
    ).length;
    const won = leadsState.leads.filter((lead) => lead.status === "won").length;

    return { total, newLeads, quoted, won };
  }, [leadsState.leads]);

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

  useEffect(() => {
    if (isAdmin) {
      fetchLeads();
    }
  }, [isAdmin]);

  async function loadInitialSession() {
    if (!isSupabaseConfigured || !supabase) {
      setAuthState({
        loading: false,
        session: null,
        profile: null,
        error:
          "Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
      });
      return;
    }

    try {
      setAuthState((current) => ({ ...current, loading: true, error: "" }));

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      const session = sessionData?.session || null;

      if (!session) {
        setAuthState({
          loading: false,
          session: null,
          profile: null,
          error: "",
        });
        return;
      }

      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) throw userError;

      const user = userData?.user;

      if (!user?.id) {
        await supabase.auth.signOut();

        setAuthState({
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

        setAuthState({
          loading: false,
          session: null,
          profile: null,
          error:
            "Your login worked, but no MKETICS admin profile was found for this account. Create a matching profile row in Supabase.",
        });
        return;
      }

      if (!allowedRoles.includes(profile.role)) {
        await supabase.auth.signOut();

        setAuthState({
          loading: false,
          session: null,
          profile: null,
          error: `This account does not have MKETICS admin access. Current role: ${profile.role || "none"}.`,
        });
        return;
      }

      setAuthState({
        loading: false,
        session,
        profile,
        error: "",
      });
    } catch (error) {
      setAuthState({
        loading: false,
        session: null,
        profile: null,
        error:
          error?.message ||
          "Unable to verify the admin session. Please try signing in again.",
      });
    }
  }

  async function handleLogin(event) {
    event.preventDefault();

    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      setLoginStatus({
        loading: false,
        error: "Enter your admin email and password.",
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
          "Login failed. Check your email, password and admin role.",
      });
    }
  }

  async function handleLogout() {
    if (!supabase) return;

    await supabase.auth.signOut();

    setAuthState({
      loading: false,
      session: null,
      profile: null,
      error: "",
    });

    setLeadsState({
      loading: false,
      error: "",
      leads: [],
    });
  }

  async function fetchLeads() {
    if (!supabase) return;

    try {
      setLeadsState((current) => ({
        ...current,
        loading: true,
        error: "",
      }));

      const { data, error } = await supabase
        .from("leads")
        .select(
          `
          id,
          created_at,
          updated_at,
          full_name,
          email,
          phone,
          organisation,
          service_needed,
          budget,
          timeline,
          preferred_contact,
          project_details,
          lead_source,
          status,
          recommended_service,
          service_pillar,
          readiness_level,
          supporting_services,
          selected_answers,
          page_url
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      setLeadsState({
        loading: false,
        error: "",
        leads: data || [],
      });
    } catch (error) {
      setLeadsState({
        loading: false,
        error:
          error?.message ||
          "Unable to load leads. Check Supabase RLS and admin profile role.",
        leads: [],
      });
    }
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

  if (authState.loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#EAF6FF] px-5 text-[#061A33]">
        <SEO title="MKETICS Admin" description="MKETICS admin dashboard." />

        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-[#0B7CFF]" size={34} />
          <p className="mt-4 text-sm font-black text-slate-600">
            Checking admin session...
          </p>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-[#EAF6FF] px-5 py-12 text-[#061A33]">
        <SEO title="MKETICS Admin Login" description="MKETICS admin login." />

        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#0B7CFF] shadow-sm">
              <ShieldCheck size={16} />
              MKETICS Admin
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-tight text-[#020B1F] sm:text-5xl">
              Business Console login.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
              Sign in to view website leads, manage enquiries and prepare the
              next MKETICS business workflow.
            </p>

            <div className="mt-7 rounded-[2rem] border border-cyan-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-bold leading-7 text-slate-700">
                This page is protected by Supabase authentication and database
                Row Level Security. Only users with an admin or staff profile
                role can view leads.
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
              Admin sign in
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              Use the admin account you created in Supabase Authentication.
            </p>

            {authState.error && (
              <StatusMessage type="error" message={authState.error} />
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
                  placeholder="admin@example.com"
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
        title="MKETICS Admin Dashboard"
        description="MKETICS lead management dashboard."
      />

      <section className="border-b border-white/70 bg-[#061A33] px-5 py-6 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
              MKETICS Business Console
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Lead Dashboard
            </h1>

            <p className="mt-2 text-sm font-semibold text-slate-300">
              Signed in as{" "}
              {authState.profile?.full_name || authState.profile?.email}
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

      <section className="px-5 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="Total Leads" value={leadStats.total} />
            <StatCard label="New Leads" value={leadStats.newLeads} />
            <StatCard label="Quoted" value={leadStats.quoted} />
            <StatCard label="Won" value={leadStats.won} />
          </div>

          <div className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-black text-[#020B1F]">
                  Website leads
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Leads submitted from the MKETICS contact form and Service
                  Explorer handoff.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchLeads}
                disabled={leadsState.loading}
                className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300 disabled:opacity-70"
              >
                {leadsState.loading ? (
                  <Loader2 size={17} className="mr-2 animate-spin" />
                ) : (
                  <RefreshCw size={17} className="mr-2" />
                )}
                Refresh
              </button>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_220px]">
              <label className="relative block">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by name, email, service, status..."
                  className="w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] py-3 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                />
              </label>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              >
                <option value="all">All statuses</option>
                <option value="new">New</option>
                <option value="reviewed">Reviewed</option>
                <option value="contacted">Contacted</option>
                <option value="quoted">Quoted</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {leadsState.error && (
              <StatusMessage type="error" message={leadsState.error} />
            )}

            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-[1050px] w-full border-collapse bg-white text-left">
                  <thead className="bg-[#F8FCFF]">
                    <tr>
                      <Th>Date</Th>
                      <Th>Client</Th>
                      <Th>Contact</Th>
                      <Th>Service</Th>
                      <Th>Budget</Th>
                      <Th>Timeline</Th>
                      <Th>Status</Th>
                      <Th>Source</Th>
                    </tr>
                  </thead>

                  <tbody>
                    {leadsState.loading && (
                      <tr>
                        <td colSpan="8" className="px-5 py-10 text-center">
                          <Loader2
                            className="mx-auto animate-spin text-[#0B7CFF]"
                            size={28}
                          />
                          <p className="mt-3 text-sm font-black text-slate-500">
                            Loading leads...
                          </p>
                        </td>
                      </tr>
                    )}

                    {!leadsState.loading && filteredLeads.length === 0 && (
                      <tr>
                        <td colSpan="8" className="px-5 py-10 text-center">
                          <Eye className="mx-auto text-slate-400" size={28} />
                          <p className="mt-3 text-sm font-black text-slate-500">
                            No leads found.
                          </p>
                        </td>
                      </tr>
                    )}

                    {!leadsState.loading &&
                      filteredLeads.map((lead) => (
                        <LeadRow key={lead.id} lead={lead} />
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[2rem] border border-cyan-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
                <ShieldCheck size={21} />
              </div>

              <div>
                <h3 className="text-lg font-black text-[#020B1F]">
                  Skeleton complete.
                </h3>

                <p className="mt-2 text-sm leading-7 text-slate-600">
                  This dashboard currently reads leads only. The next step is to
                  add lead detail view, status updates, internal notes and quote
                  draft actions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function LeadRow({ lead }) {
  return (
    <tr className="border-t border-slate-200 align-top transition hover:bg-[#F8FCFF]">
      <Td>
        <p className="font-black text-[#061A33]">
          {formatDate(lead.created_at)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {formatTime(lead.created_at)}
        </p>
      </Td>

      <Td>
        <p className="font-black text-[#020B1F]">{lead.full_name}</p>
        {lead.organisation && (
          <p className="mt-1 text-xs font-semibold text-slate-500">
            {lead.organisation}
          </p>
        )}
      </Td>

      <Td>
        <div className="grid gap-1">
          {lead.email && (
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Mail size={13} />
              {lead.email}
            </span>
          )}

          {lead.phone && (
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Phone size={13} />
              {lead.phone}
            </span>
          )}
        </div>
      </Td>

      <Td>
        <p className="font-black text-[#061A33]">{lead.service_needed}</p>
        {lead.recommended_service && (
          <p className="mt-1 text-xs font-semibold text-[#0B7CFF]">
            Recommended: {lead.recommended_service}
          </p>
        )}
      </Td>

      <Td>{lead.budget || "Not provided"}</Td>
      <Td>{lead.timeline || "Not provided"}</Td>

      <Td>
        <span className="inline-flex rounded-full bg-[#EAF6FF] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#0B7CFF]">
          {toReadableLabel(lead.status)}
        </span>
      </Td>

      <Td>
        <p>{toReadableLabel(lead.lead_source)}</p>
        {lead.page_url && (
          <a
            href={lead.page_url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex text-xs font-black text-[#0B7CFF] hover:underline"
          >
            View source
          </a>
        )}
      </Td>
    </tr>
  );
}

function StatCard({ label, value }) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0B7CFF]">
        {label}
      </p>
      <p className="mt-3 text-4xl font-black text-[#020B1F]">{value}</p>
    </article>
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

function Th({ children }) {
  return (
    <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
      {children}
    </th>
  );
}

function Td({ children }) {
  return (
    <td className="px-5 py-4 text-sm font-semibold leading-6 text-slate-700">
      {children}
    </td>
  );
}

function formatDate(value) {
  if (!value) return "Unknown";

  return new Intl.DateTimeFormat("en-ZA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

function formatTime(value) {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function toReadableLabel(value) {
  if (!value) return "Not provided";

  return String(value)
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}