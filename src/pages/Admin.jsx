import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Bell,
  TrendingUp,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  Clock,
  Eye,
  FileText,
  Loader2,
  Lock,
  LogOut,
  ListChecks,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  ShieldCheck,
  SlidersHorizontal,
  StickyNote,
  Timer,
  WalletCards,
  X,
} from "lucide-react";
import SEO from "../components/seo/SEO";
import AdminOverviewDashboard from "../components/admin/AdminOverviewDashboard";
import QuoteDraftBuilder from "../components/admin/QuoteDraftBuilder";
import ProjectsClientsDashboard from "../components/admin/ProjectsClientsDashboard";
import BusinessNotificationsDashboard from "../components/admin/BusinessNotificationsDashboard";
import DocumentsDashboard from "../components/admin/DocumentsDashboard";
import AIProposalAssistant from "../components/admin/AIProposalAssistant";
import AIProjectPlanner from "../components/admin/AIProjectPlanner";
import ProjectTaskBoard from "../components/admin/ProjectTaskBoard";
import ProjectTimeReports from "../components/admin/ProjectTimeReports";
import BusinessReportsDashboard from "../components/admin/BusinessReportsDashboard";
import BusinessKPIInsightsDashboard from "../components/admin/BusinessKPIInsightsDashboard";
import ExecutiveDashboardExport from "../components/admin/ExecutiveDashboardExport";
import AdminSettingsDashboard from "../components/admin/AdminSettingsDashboard";
import BusinessFinanceDashboard from "../components/admin/BusinessFinanceDashboard";
import BusinessInvoicesDashboard from "../components/admin/BusinessInvoicesDashboard";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";

const allowedRoles = ["admin", "staff"];

const leadStatusOptions = [
  "new",
  "reviewed",
  "contacted",
  "quoted",
  "won",
  "lost",
  "archived",
];

const noteTemplates = [
  "Client contacted on WhatsApp. Waiting for response.",
  "Client requested a quotation. Prepare scope and pricing direction.",
  "Follow-up needed. Client has not responded yet.",
  "Client needs consultation before quote can be finalised.",
  "Client details reviewed. Ready for next action.",
];

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

  const [notesState, setNotesState] = useState({
    loading: false,
    error: "",
    notes: [],
  });

  const [quotesState, setQuotesState] = useState({
    loading: false,
    error: "",
    quotes: [],
  });

  const [noteForm, setNoteForm] = useState({
    note: "",
  });

  const [noteSaveState, setNoteSaveState] = useState({
    loading: false,
    error: "",
    success: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [activeConsoleTab, setActiveConsoleTab] = useState("overview");

  const [detailForm, setDetailForm] = useState({
    status: "new",
    internalNotes: "",
  });

  const [detailSaveState, setDetailSaveState] = useState({
    loading: false,
    error: "",
    success: "",
  });

  const isAdmin = Boolean(
    authState.session &&
      authState.profile &&
      allowedRoles.includes(authState.profile.role)
  );

  const selectedLead = useMemo(() => {
    return leadsState.leads.find((lead) => lead.id === selectedLeadId) || null;
  }, [leadsState.leads, selectedLeadId]);

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
    const reviewed = leadsState.leads.filter(
      (lead) => lead.status === "reviewed"
    ).length;
    const contacted = leadsState.leads.filter(
      (lead) => lead.status === "contacted"
    ).length;
    const quoted = leadsState.leads.filter(
      (lead) => lead.status === "quoted"
    ).length;
    const won = leadsState.leads.filter((lead) => lead.status === "won").length;

    return { total, newLeads, reviewed, contacted, quoted, won };
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

  useEffect(() => {
    if (!selectedLead) return;

    setDetailForm({
      status: selectedLead.status || "new",
      internalNotes: selectedLead.internal_notes || "",
    });

    setDetailSaveState({
      loading: false,
      error: "",
      success: "",
    });

    setNoteForm({ note: "" });
    setNoteSaveState({
      loading: false,
      error: "",
      success: "",
    });

    fetchLeadNotes(selectedLead.id);
    fetchLeadQuotes(selectedLead.id);
  }, [selectedLeadId, selectedLead?.status, selectedLead?.internal_notes]);

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
          error: `This account does not have MKETICS admin access. Current role: ${
            profile.role || "none"
          }.`,
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

    setNotesState({
      loading: false,
      error: "",
      notes: [],
    });

    setQuotesState({
      loading: false,
      error: "",
      quotes: [],
    });

    setSelectedLeadId(null);
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
          page_url,
          internal_notes
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

  async function fetchLeadNotes(leadId) {
    if (!supabase || !leadId) return;

    try {
      setNotesState({
        loading: true,
        error: "",
        notes: [],
      });

      const { data, error } = await supabase
        .from("lead_notes")
        .select("id, lead_id, author_id, note, created_at")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setNotesState({
        loading: false,
        error: "",
        notes: data || [],
      });
    } catch (error) {
      setNotesState({
        loading: false,
        error:
          error?.message ||
          "Unable to load lead notes. Check Supabase lead_notes policy.",
        notes: [],
      });
    }
  }

  async function fetchLeadQuotes(leadId) {
    if (!supabase || !leadId) return;

    try {
      setQuotesState({
        loading: true,
        error: "",
        quotes: [],
      });

      const { data, error } = await supabase
        .from("quotes")
        .select(
          `
          id,
          lead_id,
          client_id,
          project_id,
          quote_number,
          title,
          scope_summary,
          exclusions,
          amount,
          currency,
          status,
          valid_until,
          sent_at,
          accepted_at,
          rejected_at,
          created_at,
          updated_at
        `
        )
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setQuotesState({
        loading: false,
        error: "",
        quotes: data || [],
      });
    } catch (error) {
      setQuotesState({
        loading: false,
        error:
          error?.message ||
          "Unable to load quote history. Check Supabase quote permissions.",
        quotes: [],
      });
    }
  }

  async function handleSaveLeadDetails(event) {
    event.preventDefault();

    if (!selectedLead || !supabase) return;

    if (!leadStatusOptions.includes(detailForm.status)) {
      setDetailSaveState({
        loading: false,
        error: "Choose a valid lead status.",
        success: "",
      });
      return;
    }

    try {
      setDetailSaveState({
        loading: true,
        error: "",
        success: "",
      });

      const updatedLead = {
        status: detailForm.status,
        internal_notes: detailForm.internalNotes.trim() || null,
      };

      const { error } = await supabase
        .from("leads")
        .update(updatedLead)
        .eq("id", selectedLead.id);

      if (error) throw error;

      const updatedAt = new Date().toISOString();

      setLeadsState((current) => ({
        ...current,
        leads: current.leads.map((lead) =>
          lead.id === selectedLead.id
            ? {
                ...lead,
                ...updatedLead,
                updated_at: updatedAt,
              }
            : lead
        ),
      }));

      setDetailSaveState({
        loading: false,
        error: "",
        success: "Lead updated successfully.",
      });
    } catch (error) {
      setDetailSaveState({
        loading: false,
        error:
          error?.message ||
          "Unable to update this lead. Check Supabase update policy.",
        success: "",
      });
    }
  }

  async function handleAddLeadNote(event) {
    event.preventDefault();

    if (!selectedLead || !supabase) return;

    if (!noteForm.note.trim()) {
      setNoteSaveState({
        loading: false,
        error: "Write a note before saving.",
        success: "",
      });
      return;
    }

    try {
      setNoteSaveState({
        loading: true,
        error: "",
        success: "",
      });

      const newNote = {
        lead_id: selectedLead.id,
        author_id: authState.profile?.id || null,
        note: noteForm.note.trim(),
      };

      const { data, error } = await supabase
        .from("lead_notes")
        .insert(newNote)
        .select("id, lead_id, author_id, note, created_at")
        .single();

      if (error) throw error;

      setNotesState((current) => ({
        ...current,
        notes: [data, ...current.notes],
      }));

      setNoteForm({ note: "" });

      setNoteSaveState({
        loading: false,
        error: "",
        success: "Follow-up note saved.",
      });
    } catch (error) {
      setNoteSaveState({
        loading: false,
        error:
          error?.message ||
          "Unable to save note. Check Supabase lead_notes insert policy.",
        success: "",
      });
    }
  }

  function handleQuoteCreated(quote, markLeadAsQuoted) {
    setQuotesState((current) => ({
      ...current,
      quotes: quote ? [quote, ...current.quotes] : current.quotes,
    }));

    if (!selectedLead || !markLeadAsQuoted) return;

    setLeadsState((current) => ({
      ...current,
      leads: current.leads.map((lead) =>
        lead.id === selectedLead.id
          ? {
              ...lead,
              status: "quoted",
              updated_at: new Date().toISOString(),
            }
          : lead
      ),
    }));

    setDetailForm((current) => ({
      ...current,
      status: "quoted",
    }));
  }

  function handleQuoteConverted(conversion) {
    if (conversion?.quote) {
      setQuotesState((current) => ({
        ...current,
        quotes: current.quotes.map((quote) =>
          quote.id === conversion.quote.id
            ? {
                ...quote,
                ...conversion.quote,
              }
            : quote
        ),
      }));
    }

    if (!selectedLead || conversion?.leadStatus !== "won") return;

    setLeadsState((current) => ({
      ...current,
      leads: current.leads.map((lead) =>
        lead.id === selectedLead.id
          ? {
              ...lead,
              status: "won",
              updated_at: new Date().toISOString(),
            }
          : lead
      ),
    }));

    setDetailForm((current) => ({
      ...current,
      status: "won",
    }));
  }

  function handleOpenLead(lead) {
    setSelectedLeadId(lead.id);
  }

  function handleCloseLead() {
    setSelectedLeadId(null);

    setDetailSaveState({
      loading: false,
      error: "",
      success: "",
    });

    setNoteSaveState({
      loading: false,
      error: "",
      success: "",
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

  function updateDetailField(event) {
    const { name, value } = event.target;

    setDetailForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (detailSaveState.error || detailSaveState.success) {
      setDetailSaveState({
        loading: false,
        error: "",
        success: "",
      });
    }
  }

  function updateNoteField(event) {
    setNoteForm({
      note: event.target.value,
    });

    if (noteSaveState.error || noteSaveState.success) {
      setNoteSaveState({
        loading: false,
        error: "",
        success: "",
      });
    }
  }

  function useNoteTemplate(template) {
    setNoteForm({
      note: template,
    });

    setNoteSaveState({
      loading: false,
      error: "",
      success: "",
    });
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
                role can view and update leads.
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
          <AdminConsoleTabs
            activeTab={activeConsoleTab}
            onChange={(tab) => {
              setActiveConsoleTab(tab);
              setSelectedLeadId(null);
            }}
          />

          {activeConsoleTab === "overview" ? (
            <AdminOverviewDashboard
              isActive={activeConsoleTab === "overview"}
              onGoToTab={(tab) => {
                setActiveConsoleTab(tab);
                setSelectedLeadId(null);
              }}
            />
          ) : activeConsoleTab === "notifications" ? (
            <BusinessNotificationsDashboard
              isActive={activeConsoleTab === "notifications"}
              onGoToTab={(tab) => {
                setActiveConsoleTab(tab);
                setSelectedLeadId(null);
              }}
            />
          ) : activeConsoleTab === "documents" ? (
            <DocumentsDashboard isActive={activeConsoleTab === "documents"} />
          ) : activeConsoleTab === "ai" ? (
            <AIProposalAssistant isActive={activeConsoleTab === "ai"} />
          ) : activeConsoleTab === "planner" ? (
            <AIProjectPlanner isActive={activeConsoleTab === "planner"} />
          ) : activeConsoleTab === "tasks" ? (
            <ProjectTaskBoard isActive={activeConsoleTab === "tasks"} />
          ) : activeConsoleTab === "time" ? (
            <ProjectTimeReports isActive={activeConsoleTab === "time"} />
          ) : activeConsoleTab === "reports" ? (
            <BusinessReportsDashboard isActive={activeConsoleTab === "reports"} />
          ) : activeConsoleTab === "kpis" ? (
            <BusinessKPIInsightsDashboard isActive={activeConsoleTab === "kpis"} />
          ) : activeConsoleTab === "executive" ? (
            <ExecutiveDashboardExport isActive={activeConsoleTab === "executive"} />
          ) : activeConsoleTab === "finance" ? (
            <BusinessFinanceDashboard isActive={activeConsoleTab === "finance"} />
          ) : activeConsoleTab === "invoices" ? (
            <BusinessInvoicesDashboard isActive={activeConsoleTab === "invoices"} />
          ) : activeConsoleTab === "settings" ? (
            <AdminSettingsDashboard
              isActive={activeConsoleTab === "settings"}
              profile={authState.profile}
            />
          ) : activeConsoleTab === "leads" ? (
            <>
              <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            <StatCard label="Total Leads" value={leadStats.total} />
            <StatCard label="New" value={leadStats.newLeads} />
            <StatCard label="Reviewed" value={leadStats.reviewed} />
            <StatCard label="Contacted" value={leadStats.contacted} />
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
                {leadStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {toReadableLabel(status)}
                  </option>
                ))}
              </select>
            </div>

            {leadsState.error && (
              <StatusMessage type="error" message={leadsState.error} />
            )}

            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-[1150px] w-full border-collapse bg-white text-left">
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
                      <Th>Action</Th>
                    </tr>
                  </thead>

                  <tbody>
                    {leadsState.loading && (
                      <tr>
                        <td colSpan="9" className="px-5 py-10 text-center">
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
                        <td colSpan="9" className="px-5 py-10 text-center">
                          <Eye className="mx-auto text-slate-400" size={28} />
                          <p className="mt-3 text-sm font-black text-slate-500">
                            No leads found.
                          </p>
                        </td>
                      </tr>
                    )}

                    {!leadsState.loading &&
                      filteredLeads.map((lead) => (
                        <LeadRow
                          key={lead.id}
                          lead={lead}
                          onView={() => handleOpenLead(lead)}
                        />
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {selectedLead ? (
            <LeadDetailPanel
              lead={selectedLead}
              form={detailForm}
              saveState={detailSaveState}
              notesState={notesState}
              quotesState={quotesState}
              noteForm={noteForm}
              noteSaveState={noteSaveState}
              profile={authState.profile}
              onChange={updateDetailField}
              onNoteChange={updateNoteField}
              onUseTemplate={useNoteTemplate}
              onClose={handleCloseLead}
              onSave={handleSaveLeadDetails}
              onAddNote={handleAddLeadNote}
              onRefreshNotes={() => fetchLeadNotes(selectedLead.id)}
              onRefreshQuotes={() => fetchLeadQuotes(selectedLead.id)}
              onQuoteCreated={handleQuoteCreated}
              onQuoteConverted={handleQuoteConverted}
            />
          ) : (
            <div className="mt-6 rounded-[2rem] border border-cyan-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <h3 className="text-lg font-black text-[#020B1F]">
                    Lead follow-up ready.
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Click View on any lead to open follow-up actions, update the
                    status and save note history.
                  </p>
                </div>
              </div>
            </div>
          )}
            </>
          ) : (
            <ProjectsClientsDashboard isActive={activeConsoleTab === "projects"} />
          )}
        </div>
      </section>
    </main>
  );
}

function AdminConsoleTabs({ activeTab, onChange }) {
  const tabs = [
    {
      id: "overview",
      label: "Overview",
      description: "View pipeline stats and recent business activity.",
      icon: Activity,
    },
    {
      id: "notifications",
      label: "Notifications",
      description: "Track reminders, overdue work and business follow-ups.",
      icon: Bell,
    },
    {
      id: "leads",
      label: "Leads & Quotes",
      description: "Manage enquiries, quote drafts and follow-ups.",
      icon: ClipboardList,
    },
    {
      id: "ai",
      label: "AI Assistant",
      description: "Generate proposal drafts, quote support and client-ready follow-up text.",
      icon: Sparkles,
    },
    {
      id: "planner",
      label: "Project Planner",
      description: "Generate project phases, tasks, milestones and client checklists.",
      icon: ListChecks,
    },
    {
      id: "tasks",
      label: "Task Board",
      description: "Track project tasks, delivery checklists and blocked work.",
      icon: ListChecks,
    },
    {
      id: "time",
      label: "Time & Reports",
      description: "Log delivery hours and generate client-ready project reports.",
      icon: Timer,
    },
    {
      id: "reports",
      label: "Reports",
      description: "Generate business reports, monthly summaries and PDF-ready snapshots.",
      icon: BarChart3,
    },
    {
      id: "kpis",
      label: "KPI Insights",
      description: "View KPI charts, growth signals and business performance insights.",
      icon: TrendingUp,
    },
    {
      id: "executive",
      label: "Executive Snapshot",
      description: "Export investor-ready business snapshots and founder updates.",
      icon: BarChart3,
    },
    {
      id: "finance",
      label: "Finance",
      description: "Track income, payments, expenses and business cash position.",
      icon: WalletCards,
    },
    {
      id: "invoices",
      label: "Invoices",
      description: "Build invoices, track payments and export client-ready PDFs.",
      icon: FileText,
    },
    {
      id: "documents",
      label: "Documents",
      description: "Track client files, project records and quote documents.",
      icon: FileText,
    },
    {
      id: "settings",
      label: "Settings",
      description: "Manage company profile, admin preferences and document defaults.",
      icon: SlidersHorizontal,
    },
    {
      id: "projects",
      label: "Projects & Clients",
      description: "View converted client records and active projects.",
      icon: BriefcaseBusiness,
    },
  ];

  return (
    <div className="mb-6 grid gap-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-12">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-[1.5rem] border p-5 text-left transition ${
              isActive
                ? "border-cyan-300 bg-[#061A33] text-white shadow-[0_18px_45px_rgba(6,26,51,0.22)]"
                : "border-slate-200 bg-white text-[#061A33] hover:border-cyan-300 hover:bg-[#F8FCFF]"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${
                  isActive ? "bg-cyan-300 text-[#061A33]" : "bg-[#EAF6FF] text-[#0B7CFF]"
                }`}
              >
                <Icon size={21} />
              </div>

              <div>
                <p className="text-lg font-black">{tab.label}</p>
                <p
                  className={`mt-1 text-sm font-semibold leading-6 ${
                    isActive ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {tab.description}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function LeadRow({ lead, onView }) {
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
        <StatusBadge status={lead.status} />
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

      <Td>
        <button
          type="button"
          onClick={onView}
          className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-4 py-2 text-xs font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
        >
          <Eye size={14} className="mr-2" />
          View
        </button>
      </Td>
    </tr>
  );
}

function LeadDetailPanel({
  lead,
  form,
  saveState,
  notesState,
  quotesState,
  noteForm,
  noteSaveState,
  profile,
  onChange,
  onNoteChange,
  onUseTemplate,
  onClose,
  onSave,
  onAddNote,
  onRefreshNotes,
  onRefreshQuotes,
  onQuoteCreated,
  onQuoteConverted,
}) {
  const whatsappLink = createClientWhatsAppLink(
    lead.phone,
    buildFollowUpWhatsAppMessage(lead)
  );

  const emailLink = createClientEmailLink(lead);

  return (
    <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0B7CFF]">
            Lead Detail
          </p>

          <h2 className="mt-2 text-2xl font-black text-[#020B1F]">
            {lead.full_name}
          </h2>

          <p className="mt-2 text-sm font-semibold text-slate-600">
            Submitted {formatFullDate(lead.created_at)}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-[#F8FCFF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
        >
          <X size={17} className="mr-2" />
          Close
        </button>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-5">
          <DetailCard title="Client Details" icon={Mail}>
            <DetailLine label="Full Name" value={lead.full_name} />
            <DetailLine label="Email" value={lead.email} />
            <DetailLine label="Phone" value={lead.phone} />
            <DetailLine label="Organisation" value={lead.organisation} />
            <DetailLine
              label="Preferred Contact"
              value={lead.preferred_contact}
            />
          </DetailCard>

          <DetailCard title="Follow-up Actions" icon={MessageCircle}>
            <div className="grid gap-3 sm:grid-cols-3">
              <ActionLink
                href={whatsappLink}
                disabled={!lead.phone}
                label="WhatsApp"
                icon={MessageCircle}
                external
              />

              <ActionLink
                href={emailLink}
                disabled={!lead.email}
                label="Email"
                icon={Mail}
              />

              <ActionLink
                href={lead.phone ? `tel:${sanitizePhoneForTel(lead.phone)}` : "#"}
                disabled={!lead.phone}
                label="Call"
                icon={Phone}
              />
            </div>

            <p className="mt-3 text-xs font-semibold leading-6 text-slate-500">
              Use these actions to follow up with the client, then save a note
              so MKETICS has a proper communication history.
            </p>
          </DetailCard>

          <DetailCard title="Project Request" icon={ClipboardList}>
            <DetailLine label="Service Needed" value={lead.service_needed} />
            <DetailLine label="Budget" value={lead.budget} />
            <DetailLine label="Timeline" value={lead.timeline} />
            <DetailLine
              label="Lead Source"
              value={toReadableLabel(lead.lead_source)}
            />

            <div className="mt-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">
                Project Details
              </p>
              <p className="mt-2 whitespace-pre-wrap rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4 text-sm font-semibold leading-7 text-slate-700">
                {lead.project_details || "Not provided"}
              </p>
            </div>
          </DetailCard>

          {(lead.recommended_service ||
            lead.service_pillar ||
            lead.readiness_level ||
            lead.supporting_services ||
            lead.selected_answers) && (
            <DetailCard title="Service Explorer Data" icon={FileText}>
              <DetailLine
                label="Recommended Service"
                value={lead.recommended_service}
              />
              <DetailLine label="Service Pillar" value={lead.service_pillar} />
              <DetailLine
                label="Readiness Level"
                value={lead.readiness_level}
              />
              <DetailLine
                label="Supporting Services"
                value={lead.supporting_services}
              />

              {lead.selected_answers && (
                <div className="mt-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">
                    Selected Answers
                  </p>
                  <pre className="mt-2 whitespace-pre-wrap break-words rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4 text-sm font-semibold leading-7 text-slate-700">
                    {lead.selected_answers}
                  </pre>
                </div>
              )}
            </DetailCard>
          )}

          <LeadNotesHistory
            notesState={notesState}
            profile={profile}
            onRefresh={onRefreshNotes}
          />
        </div>

        <div className="grid gap-5 content-start">
          <form
            onSubmit={onSave}
            className="rounded-[1.5rem] border border-cyan-200 bg-[#F8FCFF] p-5"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
              <ShieldCheck size={22} />
            </div>

            <h3 className="mt-4 text-xl font-black text-[#020B1F]">
              Manage this lead
            </h3>

            <p className="mt-2 text-sm leading-7 text-slate-600">
              Update the status and keep internal notes for MKETICS follow-up.
            </p>

            {saveState.error && (
              <StatusMessage type="error" message={saveState.error} />
            )}

            {saveState.success && (
              <StatusMessage type="success" message={saveState.success} />
            )}

            <label className="mt-5 block">
              <span className="text-sm font-black text-[#061A33]">
                Lead Status
              </span>

              <select
                name="status"
                value={form.status}
                onChange={onChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
              >
                {leadStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {toReadableLabel(status)}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-black text-[#061A33]">
                Internal Summary
              </span>

              <textarea
                name="internalNotes"
                value={form.internalNotes}
                onChange={onChange}
                rows={6}
                placeholder="Example: Client contacted on WhatsApp. Waiting for content and logo."
                className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-7 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            <button
              type="submit"
              disabled={saveState.loading}
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF] px-6 py-3 font-black text-white shadow-[0_16px_40px_rgba(0,174,239,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saveState.loading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Save Lead Update
                </>
              )}
            </button>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
              <DetailLine
                label="Current Status"
                value={toReadableLabel(lead.status)}
              />
              <DetailLine
                label="Last Updated"
                value={formatFullDate(lead.updated_at)}
              />
            </div>
          </form>

          <form
            onSubmit={onAddNote}
            className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
              <StickyNote size={22} />
            </div>

            <h3 className="mt-4 text-xl font-black text-[#020B1F]">
              Add follow-up note
            </h3>

            <p className="mt-2 text-sm leading-7 text-slate-600">
              Save each important interaction so the lead history stays clear.
            </p>

            {noteSaveState.error && (
              <StatusMessage type="error" message={noteSaveState.error} />
            )}

            {noteSaveState.success && (
              <StatusMessage type="success" message={noteSaveState.success} />
            )}

            <label className="mt-5 block">
              <span className="text-sm font-black text-[#061A33]">
                New Note
              </span>

              <textarea
                value={noteForm.note}
                onChange={onNoteChange}
                rows={7}
                placeholder="Example: Sent WhatsApp follow-up. Client will send logo and content tomorrow."
                className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold leading-7 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            <div className="mt-4 grid gap-2">
              {noteTemplates.map((template) => (
                <button
                  type="button"
                  key={template}
                  onClick={() => onUseTemplate(template)}
                  className="rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-left text-xs font-bold leading-5 text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50"
                >
                  {template}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={noteSaveState.loading}
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#061A33] px-6 py-3 font-black text-white transition hover:bg-[#0B7CFF] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {noteSaveState.loading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Saving Note
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Save Follow-up Note
                </>
              )}
            </button>
          </form>

          <QuoteDraftBuilder
            lead={lead}
            quotesState={quotesState}
            onRefreshQuotes={onRefreshQuotes}
            onQuoteCreated={onQuoteCreated}
            onQuoteConverted={onQuoteConverted}
          />
        </div>
      </div>
    </section>
  );
}

function LeadNotesHistory({ notesState, profile, onRefresh }) {
  return (
    <DetailCard title="Follow-up Note History" icon={Clock}>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onRefresh}
          disabled={notesState.loading}
          className="inline-flex items-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-4 py-2 text-xs font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300 disabled:opacity-70"
        >
          {notesState.loading ? (
            <Loader2 size={14} className="mr-2 animate-spin" />
          ) : (
            <RefreshCw size={14} className="mr-2" />
          )}
          Refresh Notes
        </button>
      </div>

      {notesState.error && (
        <StatusMessage type="error" message={notesState.error} />
      )}

      {notesState.loading && (
        <div className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-5 text-center">
          <Loader2 className="mx-auto animate-spin text-[#0B7CFF]" size={24} />
          <p className="mt-2 text-sm font-black text-slate-500">
            Loading notes...
          </p>
        </div>
      )}

      {!notesState.loading && notesState.notes.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-5">
          <p className="text-sm font-bold leading-6 text-slate-600">
            No follow-up notes have been saved for this lead yet.
          </p>
        </div>
      )}

      {!notesState.loading &&
        notesState.notes.map((note) => (
          <article
            key={note.id}
            className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4"
          >
            <p className="whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-700">
              {note.note}
            </p>

            <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">
              {formatFullDate(note.created_at)} •{" "}
              {profile?.full_name || profile?.email || "MKETICS Admin"}
            </p>
          </article>
        ))}
    </DetailCard>
  );
}

function ActionLink({ href, disabled, label, icon: Icon, external = false }) {
  if (disabled) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-black text-slate-400"
      >
        <Icon size={16} className="mr-2" />
        {label}
      </button>
    );
  }

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-4 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
    >
      <Icon size={16} className="mr-2" />
      {label}
    </a>
  );
}

function DetailCard({ title, icon: Icon, children }) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
          <Icon size={19} />
        </div>

        <h3 className="text-lg font-black text-[#020B1F]">{title}</h3>
      </div>

      <div className="mt-5 grid gap-3">{children}</div>
    </article>
  );
}

function DetailLine({ label, value }) {
  if (!value) return null;

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className="inline-flex rounded-full bg-[#EAF6FF] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#0B7CFF]">
      {toReadableLabel(status)}
    </span>
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

function createClientWhatsAppLink(phone, message) {
  const number = normalisePhoneForWhatsApp(phone);

  if (!number) return "#";

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function createClientEmailLink(lead) {
  const subject = `MKETICS Follow-up - ${lead.service_needed || "Your enquiry"}`;

  const body = [
    `Hello ${lead.full_name || ""},`,
    "",
    "Thank you for contacting MKETICS.",
    "",
    `We received your enquiry about: ${
      lead.service_needed || "your project request"
    }.`,
    "",
    "Kindly let us know if you are available for a quick follow-up so we can confirm the scope and next step.",
    "",
    "Regards,",
    "MKETICS (PTY) LTD",
  ].join("\n");

  return `mailto:${lead.email}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

function buildFollowUpWhatsAppMessage(lead) {
  return [
    `Hello ${lead.full_name || ""},`,
    "",
    "Thank you for contacting MKETICS.",
    "",
    `We received your enquiry about: ${
      lead.service_needed || "your project request"
    }.`,
    "",
    "Kindly let us know if you are available for a quick follow-up so we can confirm the scope and next step.",
    "",
    "Regards,",
    "MKETICS (PTY) LTD",
  ].join("\n");
}

function normalisePhoneForWhatsApp(phone) {
  if (!phone) return "";

  const digits = String(phone).replace(/\D/g, "");

  if (!digits) return "";

  if (digits.startsWith("27")) return digits;

  if (digits.startsWith("0")) {
    return `27${digits.slice(1)}`;
  }

  return digits;
}

function sanitizePhoneForTel(phone) {
  if (!phone) return "";

  return String(phone).replace(/\s/g, "");
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

function formatFullDate(value) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en-ZA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
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