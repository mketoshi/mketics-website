import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Clipboard,
  FileText,
  Loader2,
  Printer,
  RefreshCw,
  Save,
  Search,
  Share2,
  Sparkles,
  Target,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const financeSettingKey = "business_finance_records_v1";
const invoiceSettingKey = "business_invoice_records_v1";
const timeTrackingSettingKey = "project_time_tracking_v1";
const taskBoardSettingKey = "project_task_board_v1";
const remindersSettingKey = "business_reminders_v1";

const periodFilterOptions = [
  { value: "month", label: "Selected Month" },
  { value: "quarter", label: "Quarter to Date" },
  { value: "year", label: "Year to Date" },
  { value: "all", label: "All Records" },
];

const snapshotAudienceOptions = [
  "Internal Executive Snapshot",
  "Investor-Ready Snapshot",
  "Operations Review",
  "Funding Partner Snapshot",
  "Founder Update",
];

export default function ExecutiveDashboardExport({ isActive }) {
  const [dataState, setDataState] = useState({
    loading: false,
    error: "",
    leads: [],
    clients: [],
    projects: [],
    quotes: [],
    tickets: [],
    documents: [],
    leadNotes: [],
    financeRecords: [],
    invoices: [],
    timeEntries: [],
    tasks: [],
    reminders: [],
  });

  const [filters, setFilters] = useState({
    month: getCurrentMonthInputValue(),
    period: "year",
    audience: "Investor-Ready Snapshot",
    search: "",
  });

  const [snapshotState, setSnapshotState] = useState({
    loading: false,
    error: "",
    success: "",
    preview: "",
  });

  useEffect(() => {
    if (isActive) {
      fetchExecutiveData();
    }
  }, [isActive]);

  const periodRange = useMemo(
    () => buildPeriodRange(filters),
    [filters.month, filters.period]
  );

  const scopedData = useMemo(() => {
    return {
      leads: dataState.leads.filter((item) => isWithinRange(item.created_at, periodRange)),
      clients: dataState.clients.filter((item) => isWithinRange(item.created_at, periodRange)),
      projects: dataState.projects.filter(
        (item) =>
          isWithinRange(item.created_at, periodRange) ||
          isWithinRange(item.updated_at, periodRange) ||
          isWithinRange(item.completed_at, periodRange)
      ),
      quotes: dataState.quotes.filter(
        (item) =>
          isWithinRange(item.created_at, periodRange) ||
          isWithinRange(item.sent_at, periodRange) ||
          isWithinRange(item.accepted_at, periodRange)
      ),
      tickets: dataState.tickets.filter(
        (item) =>
          isWithinRange(item.created_at, periodRange) ||
          isWithinRange(item.updated_at, periodRange) ||
          isWithinRange(item.closed_at, periodRange)
      ),
      documents: dataState.documents.filter((item) => isWithinRange(item.created_at, periodRange)),
      leadNotes: dataState.leadNotes.filter((item) => isWithinRange(item.created_at, periodRange)),
      financeRecords: dataState.financeRecords.filter((item) => isWithinRange(item.transactionDate, periodRange)),
      invoices: dataState.invoices.filter((item) => isWithinRange(item.issueDate || item.createdAt, periodRange)),
      timeEntries: dataState.timeEntries.filter((item) => isWithinRange(item.entryDate, periodRange)),
      tasks: dataState.tasks.filter(
        (item) =>
          isWithinRange(item.createdAt, periodRange) ||
          isWithinRange(item.updatedAt, periodRange) ||
          isWithinRange(item.completedAt, periodRange)
      ),
      reminders: dataState.reminders.filter(
        (item) =>
          isWithinRange(item.createdAt, periodRange) ||
          isWithinRange(item.updatedAt, periodRange) ||
          isWithinRange(item.dueDate, periodRange)
      ),
    };
  }, [dataState, periodRange]);

  const executiveMetrics = useMemo(
    () => buildExecutiveMetrics(scopedData, dataState),
    [scopedData, dataState]
  );

  const investorSignals = useMemo(
    () => buildInvestorSignals(executiveMetrics, scopedData, dataState),
    [executiveMetrics, scopedData, dataState]
  );

  const activityTimeline = useMemo(() => {
    const timeline = buildExecutiveTimeline(scopedData);

    if (!filters.search.trim()) return timeline;

    const search = filters.search.trim().toLowerCase();

    return timeline.filter((item) =>
      [item.type, item.title, item.description, item.date]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [scopedData, filters.search]);

  const snapshotText = useMemo(
    () =>
      buildExecutiveSnapshotText({
        audience: filters.audience,
        periodLabel: periodRange.label,
        metrics: executiveMetrics,
        signals: investorSignals,
        timeline: activityTimeline,
      }),
    [filters.audience, periodRange.label, executiveMetrics, investorSignals, activityTimeline]
  );

  async function fetchExecutiveData() {
    if (!supabase) return;

    try {
      setDataState((current) => ({ ...current, loading: true, error: "" }));
      setSnapshotState({ loading: false, error: "", success: "", preview: "" });

      const [
        leadsResponse,
        clientsResponse,
        projectsResponse,
        quotesResponse,
        ticketsResponse,
        documentsResponse,
        notesResponse,
        financeResponse,
        invoicesResponse,
        timeResponse,
        tasksResponse,
        remindersResponse,
      ] = await Promise.all([
        supabase
          .from("leads")
          .select("id, full_name, organisation, service_needed, status, budget, timeline, created_at, updated_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("clients")
          .select("id, full_name, email, phone, organisation, created_at, updated_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("projects")
          .select("id, client_id, lead_id, title, description, service_type, status, start_date, due_date, completed_at, created_at, updated_at")
          .order("updated_at", { ascending: false }),
        supabase
          .from("quotes")
          .select("id, lead_id, client_id, project_id, quote_number, title, amount, currency, status, valid_until, sent_at, accepted_at, rejected_at, created_at, updated_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("support_tickets")
          .select("id, client_id, project_id, ticket_type, priority, subject, status, resolution_notes, closed_at, created_at, updated_at")
          .order("updated_at", { ascending: false }),
        supabase
          .from("documents")
          .select("id, client_id, project_id, quote_id, title, document_type, storage_path, public_url, notes, created_at, updated_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("lead_notes")
          .select("id, lead_id, note, created_at")
          .order("created_at", { ascending: false }),
        supabase.from("settings").select("setting_value").eq("setting_key", financeSettingKey).maybeSingle(),
        supabase.from("settings").select("setting_value").eq("setting_key", invoiceSettingKey).maybeSingle(),
        supabase.from("settings").select("setting_value").eq("setting_key", timeTrackingSettingKey).maybeSingle(),
        supabase.from("settings").select("setting_value").eq("setting_key", taskBoardSettingKey).maybeSingle(),
        supabase.from("settings").select("setting_value").eq("setting_key", remindersSettingKey).maybeSingle(),
      ]);

      const firstError =
        leadsResponse.error ||
        clientsResponse.error ||
        projectsResponse.error ||
        quotesResponse.error ||
        ticketsResponse.error ||
        documentsResponse.error ||
        notesResponse.error ||
        financeResponse.error ||
        invoicesResponse.error ||
        timeResponse.error ||
        tasksResponse.error ||
        remindersResponse.error;

      if (firstError) throw firstError;

      setDataState({
        loading: false,
        error: "",
        leads: leadsResponse.data || [],
        clients: clientsResponse.data || [],
        projects: projectsResponse.data || [],
        quotes: quotesResponse.data || [],
        tickets: ticketsResponse.data || [],
        documents: documentsResponse.data || [],
        leadNotes: notesResponse.data || [],
        financeRecords: normaliseFinanceRecords(financeResponse.data?.setting_value?.records || []),
        invoices: normaliseInvoices(invoicesResponse.data?.setting_value?.invoices || []),
        timeEntries: normaliseTimeEntries(timeResponse.data?.setting_value?.entries || []),
        tasks: normaliseTasks(tasksResponse.data?.setting_value?.tasks || []),
        reminders: normaliseReminders(remindersResponse.data?.setting_value?.reminders || []),
      });
    } catch (error) {
      setDataState({
        loading: false,
        error: error?.message || "Unable to load executive dashboard data. Check Supabase permissions.",
        leads: [],
        clients: [],
        projects: [],
        quotes: [],
        tickets: [],
        documents: [],
        leadNotes: [],
        financeRecords: [],
        invoices: [],
        timeEntries: [],
        tasks: [],
        reminders: [],
      });
    }
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));

    if (snapshotState.error || snapshotState.success) {
      setSnapshotState((current) => ({ ...current, error: "", success: "" }));
    }
  }

  function handleGenerateSnapshot() {
    setSnapshotState({
      loading: false,
      error: "",
      success: "Executive snapshot generated.",
      preview: snapshotText,
    });
  }

  async function handleCopySnapshot() {
    try {
      await navigator.clipboard.writeText(snapshotState.preview || snapshotText);
      setSnapshotState((current) => ({
        ...current,
        error: "",
        success: "Executive snapshot copied to clipboard.",
      }));
    } catch (error) {
      setSnapshotState((current) => ({
        ...current,
        error: "Unable to copy snapshot. Select and copy the text manually.",
        success: "",
      }));
    }
  }

  function handlePrintSnapshot() {
    printExecutiveSnapshot(snapshotState.preview || snapshotText, filters.audience, periodRange.label);
  }

  async function handleSaveSnapshotDocument() {
    if (!supabase) return;

    try {
      setSnapshotState((current) => ({ ...current, loading: true, error: "", success: "" }));

      const text = snapshotState.preview || snapshotText;
      const title = `${filters.audience} - ${periodRange.label}`;

      const { error } = await supabase.from("documents").insert({
        title,
        document_type: "Executive Snapshot",
        notes: text,
      });

      if (error) throw error;

      setSnapshotState({
        loading: false,
        error: "",
        success: "Executive snapshot saved as a document record.",
        preview: text,
      });
    } catch (error) {
      setSnapshotState((current) => ({
        ...current,
        loading: false,
        error: error?.message || "Unable to save executive snapshot. Check Supabase document permissions.",
        success: "",
      }));
    }
  }

  const previewText = snapshotState.preview || snapshotText;

  return (
    <section className="grid gap-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-200 bg-[#EAF6FF] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#0B7CFF]">
              <Share2 size={16} />
              Executive Snapshot
            </div>

            <h2 className="mt-5 text-3xl font-black text-[#020B1F]">
              Executive dashboard export and investor-ready snapshot.
            </h2>

            <p className="mt-3 max-w-4xl text-sm font-semibold leading-7 text-slate-600">
              Package the strongest MKETICS operating metrics, business pipeline,
              finance position, delivery capacity and growth signals into a clean
              founder, partner or investor-ready view.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchExecutiveData}
            disabled={dataState.loading}
            className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300 disabled:opacity-70"
          >
            {dataState.loading ? (
              <Loader2 size={17} className="mr-2 animate-spin" />
            ) : (
              <RefreshCw size={17} className="mr-2" />
            )}
            Refresh Snapshot Data
          </button>
        </div>

        {dataState.error && <StatusMessage type="error" message={dataState.error} />}
        {snapshotState.error && <StatusMessage type="error" message={snapshotState.error} />}
        {snapshotState.success && <StatusMessage type="success" message={snapshotState.success} />}

        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          <label className="block">
            <span className="text-sm font-black text-[#061A33]">Snapshot Type</span>
            <select
              name="audience"
              value={filters.audience}
              onChange={handleFilterChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            >
              {snapshotAudienceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-black text-[#061A33]">Month</span>
            <input
              type="month"
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            />
          </label>

          <label className="block">
            <span className="text-sm font-black text-[#061A33]">Period</span>
            <select
              name="period"
              value={filters.period}
              onChange={handleFilterChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            >
              {periodFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-black text-[#061A33]">Search Timeline</span>
            <div className="relative mt-2">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search activity..."
                className="w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] py-3 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </div>
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ExecutiveMetricCard
          label="Executive Score"
          value={`${executiveMetrics.executiveScore}%`}
          note={executiveMetrics.executiveScoreNote}
          icon={Target}
        />
        <ExecutiveMetricCard
          label="Revenue Pipeline"
          value={formatCurrency(executiveMetrics.totalPipelineValue)}
          note={`${formatCurrency(executiveMetrics.acceptedQuoteValue)} accepted quote value`}
          icon={TrendingUp}
        />
        <ExecutiveMetricCard
          label="Collected Revenue"
          value={formatCurrency(executiveMetrics.invoicePaid)}
          note={`${formatCurrency(executiveMetrics.invoiceOutstanding)} outstanding`}
          icon={WalletCards}
        />
        <ExecutiveMetricCard
          label="Net Cash"
          value={formatCurrency(executiveMetrics.netCash)}
          note={`${formatCurrency(executiveMetrics.paidExpenses)} paid expenses`}
          icon={BarChart3}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ExecutiveMetricCard
          label="Clients"
          value={executiveMetrics.totalClients}
          note={`${executiveMetrics.newClients} added in period`}
          icon={BriefcaseBusiness}
        />
        <ExecutiveMetricCard
          label="Active Projects"
          value={executiveMetrics.activeProjects}
          note={`${executiveMetrics.completedProjects} completed in period`}
          icon={BriefcaseBusiness}
        />
        <ExecutiveMetricCard
          label="Lead Conversion"
          value={`${executiveMetrics.leadConversionRate}%`}
          note={`${executiveMetrics.wonLeads} won leads from ${executiveMetrics.totalLeads} leads`}
          icon={Clipboard}
        />
        <ExecutiveMetricCard
          label="Delivery Capacity"
          value={`${executiveMetrics.billableHours} hrs`}
          note={`${executiveMetrics.taskCompletionRate}% task completion`}
          icon={FileText}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <h3 className="text-2xl font-black text-[#020B1F]">Investor-ready signals</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            Condensed signals for explaining MKETICS traction, risk and next action.
          </p>

          <div className="mt-5 grid gap-4">
            {investorSignals.map((signal) => (
              <article
                key={signal.title}
                className="rounded-[1.5rem] border border-slate-200 bg-[#F8FCFF] p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
                    <signal.icon size={21} />
                  </div>

                  <div>
                    <p className="text-lg font-black text-[#020B1F]">{signal.title}</p>
                    <p className="mt-2 text-sm font-semibold leading-7 text-slate-700">
                      {signal.body}
                    </p>
                    <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-[#0B7CFF]">
                      {signal.action}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-2xl font-black text-[#020B1F]">Activity evidence</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                Recent proof points for {periodRange.label}.
              </p>
            </div>
          </div>

          <div className="mt-5 grid max-h-[700px] gap-3 overflow-y-auto pr-1">
            {dataState.loading && (
              <div className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-6 text-center">
                <Loader2 className="mx-auto animate-spin text-[#0B7CFF]" size={28} />
                <p className="mt-3 text-sm font-black text-slate-500">Loading executive activity...</p>
              </div>
            )}

            {!dataState.loading && activityTimeline.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-6">
                <p className="text-sm font-bold leading-6 text-slate-600">
                  No executive activity found for the selected filters.
                </p>
              </div>
            )}

            {!dataState.loading &&
              activityTimeline.slice(0, 40).map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0B7CFF]">
                        {item.type}
                      </p>
                      <p className="mt-1 text-sm font-black text-[#020B1F]">{item.title}</p>
                      <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                        {item.description}
                      </p>
                    </div>
                    <p className="shrink-0 text-xs font-black text-slate-500">
                      {formatDate(item.date)}
                    </p>
                  </div>
                </article>
              ))}
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-2xl font-black text-[#020B1F]">Executive export</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
              Generate, copy, print or save a document-ready MKETICS business snapshot.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleGenerateSnapshot}
              className="inline-flex items-center justify-center rounded-full bg-[#061A33] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0B7CFF]"
            >
              <Sparkles size={17} className="mr-2" />
              Generate Snapshot
            </button>

            <button
              type="button"
              onClick={handleCopySnapshot}
              className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
            >
              <Clipboard size={17} className="mr-2" />
              Copy
            </button>

            <button
              type="button"
              onClick={handlePrintSnapshot}
              className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
            >
              <Printer size={17} className="mr-2" />
              Print / PDF
            </button>

            <button
              type="button"
              onClick={handleSaveSnapshotDocument}
              disabled={snapshotState.loading}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF] px-5 py-3 text-sm font-black text-white shadow-[0_16px_40px_rgba(0,174,239,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {snapshotState.loading ? (
                <Loader2 size={17} className="mr-2 animate-spin" />
              ) : (
                <Save size={17} className="mr-2" />
              )}
              Save Record
            </button>
          </div>
        </div>

        <pre className="mt-6 max-h-[720px] overflow-y-auto whitespace-pre-wrap rounded-[1.5rem] border border-slate-200 bg-[#F8FCFF] p-5 text-sm font-semibold leading-7 text-slate-700">
          {previewText}
        </pre>
      </div>
    </section>
  );
}

function ExecutiveMetricCard({ label, value, note, icon: Icon }) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">
            {label}
          </p>
          <p className="mt-3 text-3xl font-black text-[#020B1F]">{value}</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{note}</p>
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#EAF6FF] text-[#0B7CFF]">
          <Icon size={21} />
        </div>
      </div>
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

function buildExecutiveMetrics(scoped, allData) {
  const totalLeads = scoped.leads.length;
  const wonLeads = scoped.leads.filter((lead) => lead.status === "won").length;
  const quotedLeads = scoped.leads.filter((lead) => lead.status === "quoted").length;

  const totalQuotes = scoped.quotes.length;
  const acceptedQuotes = scoped.quotes.filter((quote) => quote.status === "accepted").length;
  const sentQuotes = scoped.quotes.filter((quote) => quote.status === "sent").length;
  const totalPipelineValue = sumAmounts(scoped.quotes, "amount");
  const acceptedQuoteValue = sumAmounts(scoped.quotes.filter((quote) => quote.status === "accepted"), "amount");
  const sentQuoteValue = sumAmounts(scoped.quotes.filter((quote) => quote.status === "sent"), "amount");

  const totalInvoiceValue = sumAmounts(scoped.invoices, "amount");
  const invoicePaid = scoped.invoices.reduce((total, invoice) => total + getInvoicePaidAmount(invoice), 0);
  const invoiceOutstanding = Math.max(totalInvoiceValue - invoicePaid, 0);
  const overdueInvoices = scoped.invoices.filter((invoice) => getInvoiceDisplayStatus(invoice) === "overdue").length;

  const paidIncome = scoped.financeRecords
    .filter((record) => record.type === "income" && record.paymentStatus === "paid")
    .reduce((total, record) => total + (Number(record.amount) || 0), 0);
  const expectedIncome = scoped.financeRecords
    .filter((record) => record.type === "income")
    .reduce((total, record) => total + (Number(record.amount) || 0), 0);
  const paidExpenses = scoped.financeRecords
    .filter((record) => record.type === "expense" && record.paymentStatus === "paid")
    .reduce((total, record) => total + (Number(record.amount) || 0), 0);
  const netCash = paidIncome + invoicePaid - paidExpenses;

  const activeProjects = allData.projects.filter((project) =>
    ["new", "planning", "active", "in_progress", "awaiting_client", "support"].includes(normalizeStatus(project.status))
  ).length;
  const completedProjects = scoped.projects.filter((project) => normalizeStatus(project.status) === "completed").length;
  const overdueProjects = allData.projects.filter((project) => isProjectOverdue(project)).length;

  const openTickets = allData.tickets.filter((ticket) => !["resolved", "closed"].includes(normalizeStatus(ticket.status))).length;
  const urgentTickets = allData.tickets.filter((ticket) => normalizeStatus(ticket.priority) === "urgent" && !["resolved", "closed"].includes(normalizeStatus(ticket.status))).length;

  const totalHours = roundOne(scoped.timeEntries.reduce((total, entry) => total + (Number(entry.hours) || 0), 0));
  const billableHours = roundOne(
    scoped.timeEntries
      .filter((entry) => normalizeStatus(entry.billingType) === "billable")
      .reduce((total, entry) => total + (Number(entry.hours) || 0), 0)
  );
  const taskCompletionRate = percent(
    scoped.tasks.filter((task) => normalizeStatus(task.status) === "done").length,
    scoped.tasks.length
  );

  const leadConversionRate = percent(wonLeads, totalLeads);
  const quoteAcceptanceRate = percent(acceptedQuotes, totalQuotes);
  const collectionRate = percent(invoicePaid, totalInvoiceValue);
  const billableRatio = percent(billableHours, totalHours);

  const executiveScore = Math.round(
    average([
      bounded(leadConversionRate),
      bounded(quoteAcceptanceRate),
      bounded(collectionRate),
      bounded(taskCompletionRate),
      overdueProjects === 0 ? 100 : 70,
      urgentTickets === 0 ? 100 : 65,
    ])
  );

  return {
    totalLeads,
    wonLeads,
    quotedLeads,
    leadConversionRate,
    totalQuotes,
    acceptedQuotes,
    sentQuotes,
    totalPipelineValue,
    acceptedQuoteValue,
    sentQuoteValue,
    quoteAcceptanceRate,
    totalInvoiceValue,
    invoicePaid,
    invoiceOutstanding,
    overdueInvoices,
    collectionRate,
    paidIncome,
    expectedIncome,
    paidExpenses,
    netCash,
    totalClients: allData.clients.length,
    newClients: scoped.clients.length,
    activeProjects,
    completedProjects,
    overdueProjects,
    openTickets,
    urgentTickets,
    totalHours,
    billableHours,
    billableRatio,
    taskCompletionRate,
    documentsAdded: scoped.documents.length,
    remindersOpen: allData.reminders.filter((reminder) => !reminder.completed).length,
    executiveScore,
    executiveScoreNote: executiveScore >= 80 ? "Strong operating position" : executiveScore >= 60 ? "Developing traction with follow-up needs" : "Needs focused founder attention",
  };
}

function buildInvestorSignals(metrics, scoped, allData) {
  return [
    {
      title: "Commercial traction",
      body: `MKETICS recorded ${metrics.totalLeads} leads in the selected period, with ${metrics.wonLeads} won leads and ${formatCurrency(metrics.totalPipelineValue)} in quoted pipeline value.`,
      action: metrics.totalPipelineValue > 0 ? "Keep converting quote pipeline into signed projects." : "Build pipeline by strengthening lead capture and follow-up.",
      icon: TrendingUp,
    },
    {
      title: "Revenue discipline",
      body: `Invoices show ${formatCurrency(metrics.invoicePaid)} collected against ${formatCurrency(metrics.totalInvoiceValue)} billed, with ${formatCurrency(metrics.invoiceOutstanding)} still outstanding.`,
      action: metrics.invoiceOutstanding > 0 ? "Prioritise payment follow-up and receipts." : "Maintain proof-of-payment and receipt records.",
      icon: WalletCards,
    },
    {
      title: "Delivery capacity",
      body: `${metrics.activeProjects} active projects are in the system, supported by ${metrics.billableHours} billable tracked hours and a ${metrics.taskCompletionRate}% task completion rate in the selected period.`,
      action: metrics.overdueProjects > 0 ? "Resolve overdue project dates before adding more delivery load." : "Use delivery proof to strengthen business credibility.",
      icon: BriefcaseBusiness,
    },
    {
      title: "Operational risk control",
      body: `${metrics.openTickets} support tickets are open, including ${metrics.urgentTickets} urgent tickets. ${metrics.remindersOpen} reminders remain open across the business console.`,
      action: metrics.urgentTickets > 0 ? "Close urgent support issues before they affect client trust." : "Continue using reminders and ticket history as operating controls.",
      icon: AlertCircle,
    },
    {
      title: "Evidence and governance",
      body: `${metrics.documentsAdded} document records were added in this period, while the system currently tracks ${allData.clients.length} clients, ${allData.projects.length} projects and ${allData.quotes.length} quotes.`,
      action: "Use saved reports, invoices, receipts and documents as investor-ready evidence.",
      icon: FileText,
    },
  ];
}

function buildExecutiveTimeline(scoped) {
  const timeline = [];

  scoped.leads.forEach((lead) => {
    timeline.push({
      id: `lead-${lead.id}`,
      type: "Lead",
      title: lead.full_name || "Website lead",
      description: `${lead.service_needed || "Service enquiry"} • ${toReadableLabel(lead.status)}`,
      date: lead.created_at,
    });
  });

  scoped.quotes.forEach((quote) => {
    timeline.push({
      id: `quote-${quote.id}`,
      type: "Quote",
      title: quote.quote_number || quote.title || "Quote",
      description: `${quote.title || "Quote"} • ${formatCurrency(quote.amount, quote.currency)} • ${toReadableLabel(quote.status)}`,
      date: quote.accepted_at || quote.sent_at || quote.created_at,
    });
  });

  scoped.invoices.forEach((invoice) => {
    timeline.push({
      id: `invoice-${invoice.id}`,
      type: "Invoice",
      title: invoice.invoiceNumber || invoice.title || "Invoice",
      description: `${invoice.title || "Invoice"} • ${formatCurrency(invoice.amount)} • ${toReadableLabel(getInvoiceDisplayStatus(invoice))}`,
      date: invoice.issueDate || invoice.createdAt,
    });
  });

  scoped.projects.forEach((project) => {
    timeline.push({
      id: `project-${project.id}`,
      type: "Project",
      title: project.title || "Project",
      description: `${project.service_type || "Service"} • ${toReadableLabel(project.status)}`,
      date: project.completed_at || project.updated_at || project.created_at,
    });
  });

  scoped.tickets.forEach((ticket) => {
    timeline.push({
      id: `ticket-${ticket.id}`,
      type: "Support",
      title: ticket.subject || "Support ticket",
      description: `${toReadableLabel(ticket.priority)} priority • ${toReadableLabel(ticket.status)}`,
      date: ticket.closed_at || ticket.updated_at || ticket.created_at,
    });
  });

  scoped.documents.forEach((document) => {
    timeline.push({
      id: `document-${document.id}`,
      type: "Document",
      title: document.title || "Document",
      description: `${document.document_type || "Record"}`,
      date: document.created_at,
    });
  });

  scoped.financeRecords.forEach((record) => {
    timeline.push({
      id: `finance-${record.id}`,
      type: "Finance",
      title: record.title || toReadableLabel(record.type),
      description: `${toReadableLabel(record.type)} • ${formatCurrency(record.amount)} • ${toReadableLabel(record.paymentStatus)}`,
      date: record.transactionDate || record.createdAt,
    });
  });

  scoped.leadNotes.forEach((note) => {
    timeline.push({
      id: `note-${note.id}`,
      type: "Follow-up Note",
      title: "Lead follow-up note",
      description: truncateText(note.note || "Follow-up note", 100),
      date: note.created_at,
    });
  });

  return timeline
    .filter((item) => item.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function buildExecutiveSnapshotText({ audience, periodLabel, metrics, signals, timeline }) {
  return [
    "MKETICS (PTY) LTD",
    audience,
    `Period: ${periodLabel}`,
    `Generated: ${formatFullDate(new Date().toISOString())}`,
    "",
    "1. Executive Summary",
    `MKETICS is operating with an executive score of ${metrics.executiveScore}%, supported by ${metrics.totalClients} client records, ${metrics.activeProjects} active projects, ${metrics.totalLeads} leads in scope and ${formatCurrency(metrics.totalPipelineValue)} in quoted pipeline value.`,
    `The selected period shows ${formatCurrency(metrics.invoicePaid)} collected, ${formatCurrency(metrics.invoiceOutstanding)} outstanding, ${metrics.billableHours} billable delivery hours and ${metrics.documentsAdded} saved document records.`,
    "",
    "2. Commercial Performance",
    `Leads in period: ${metrics.totalLeads}`,
    `Won leads: ${metrics.wonLeads}`,
    `Lead conversion rate: ${metrics.leadConversionRate}%`,
    `Quoted pipeline value: ${formatCurrency(metrics.totalPipelineValue)}`,
    `Accepted quote value: ${formatCurrency(metrics.acceptedQuoteValue)}`,
    `Quote acceptance rate: ${metrics.quoteAcceptanceRate}%`,
    "",
    "3. Finance Position",
    `Invoice value: ${formatCurrency(metrics.totalInvoiceValue)}`,
    `Invoice paid: ${formatCurrency(metrics.invoicePaid)}`,
    `Invoice outstanding: ${formatCurrency(metrics.invoiceOutstanding)}`,
    `Paid income records: ${formatCurrency(metrics.paidIncome)}`,
    `Paid expenses: ${formatCurrency(metrics.paidExpenses)}`,
    `Net cash position: ${formatCurrency(metrics.netCash)}`,
    "",
    "4. Delivery & Operations",
    `Active projects: ${metrics.activeProjects}`,
    `Completed projects in period: ${metrics.completedProjects}`,
    `Overdue projects: ${metrics.overdueProjects}`,
    `Tracked hours: ${metrics.totalHours}`,
    `Billable hours: ${metrics.billableHours}`,
    `Task completion rate: ${metrics.taskCompletionRate}%`,
    `Open support tickets: ${metrics.openTickets}`,
    `Urgent support tickets: ${metrics.urgentTickets}`,
    "",
    "5. Investor-Ready Signals",
    ...signals.flatMap((signal, index) => [
      `${index + 1}. ${signal.title}`,
      signal.body,
      `Action: ${signal.action}`,
      "",
    ]),
    "6. Recent Evidence",
    ...(timeline.length
      ? timeline.slice(0, 12).map((item) => `- ${formatDate(item.date)} | ${item.type}: ${item.title} (${item.description})`)
      : ["No activity evidence available for the selected period."]),
    "",
    "7. Recommended Founder Focus",
    ...buildFounderFocus(metrics).map((item) => `- ${item}`),
    "",
    "Prepared by MKETICS Business Console",
    "Speak Innovation. Deliver Value.",
  ].join("\n");
}

function buildFounderFocus(metrics) {
  const focus = [];

  if (metrics.invoiceOutstanding > 0) {
    focus.push(`Collect outstanding invoice balance of ${formatCurrency(metrics.invoiceOutstanding)}.`);
  }

  if (metrics.sentQuoteValue > 0) {
    focus.push(`Follow up sent quotes worth ${formatCurrency(metrics.sentQuoteValue)}.`);
  }

  if (metrics.urgentTickets > 0) {
    focus.push(`Resolve ${metrics.urgentTickets} urgent support ticket(s).`);
  }

  if (metrics.overdueProjects > 0) {
    focus.push(`Recover ${metrics.overdueProjects} overdue project(s).`);
  }

  if (metrics.documentsAdded === 0) {
    focus.push("Save delivery reports, invoices, receipts and proof documents for stronger governance evidence.");
  }

  if (focus.length === 0) {
    focus.push("Continue converting pipeline, documenting delivery and building investor-ready evidence.");
  }

  return focus;
}

function printExecutiveSnapshot(text, title, periodLabel) {
  const frame = document.createElement("iframe");
  frame.style.position = "fixed";
  frame.style.right = "0";
  frame.style.bottom = "0";
  frame.style.width = "0";
  frame.style.height = "0";
  frame.style.border = "0";
  document.body.appendChild(frame);

  const safeTitle = escapeHtml(title || "MKETICS Executive Snapshot");
  const safePeriod = escapeHtml(periodLabel || "Executive Period");
  const safeText = escapeHtml(text).replace(/\n/g, "<br>");

  const content = `<!doctype html>
<html>
<head>
  <title>${safeTitle}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 32px; color: #061A33; }
    .header { border-bottom: 3px solid #00AEEF; padding-bottom: 16px; margin-bottom: 24px; }
    h1 { margin: 0; font-size: 26px; }
    .subtitle { color: #0B7CFF; font-weight: 700; margin-top: 8px; }
    .report { white-space: normal; font-size: 12px; line-height: 1.6; }
    .footer { border-top: 1px solid #D8E8F7; margin-top: 28px; padding-top: 12px; font-size: 11px; color: #475569; }
    @media print { body { margin: 24px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>MKETICS (PTY) LTD</h1>
    <p class="subtitle">${safeTitle}</p>
    <p>${safePeriod}</p>
    <p>Speak Innovation. Deliver Value.</p>
    <p>services@mketics.co.za | +27 72 286 4367</p>
  </div>
  <div class="report">${safeText}</div>
  <div class="footer">Generated from the MKETICS Business Console.</div>
</body>
</html>`;

  frame.contentWindow.document.open();
  frame.contentWindow.document.write(content);
  frame.contentWindow.document.close();

  window.setTimeout(() => {
    frame.contentWindow.focus();
    frame.contentWindow.print();
    window.setTimeout(() => document.body.removeChild(frame), 1000);
  }, 250);
}

function normaliseFinanceRecords(records) {
  if (!Array.isArray(records)) return [];

  return records
    .filter((record) => record && record.id)
    .map((record) => ({
      id: record.id,
      type: record.type || "income",
      title: record.title || record.description || "Finance record",
      amount: Number(record.amount) || 0,
      paymentStatus: record.paymentStatus || record.status || "pending",
      transactionDate: record.transactionDate || record.date || record.createdAt || new Date().toISOString(),
      createdAt: record.createdAt || record.created_at || new Date().toISOString(),
      updatedAt: record.updatedAt || record.updated_at || record.createdAt || new Date().toISOString(),
    }));
}

function normaliseInvoices(invoices) {
  if (!Array.isArray(invoices)) return [];

  return invoices
    .filter((invoice) => invoice && invoice.id)
    .map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber || "Invoice",
      title: invoice.title || "MKETICS invoice",
      amount: Number(invoice.amount) || 0,
      paidAmount: Number(invoice.paidAmount) || 0,
      paymentStatus: invoice.paymentStatus || "draft",
      issueDate: invoice.issueDate || invoice.createdAt || new Date().toISOString(),
      dueDate: invoice.dueDate || "",
      receipts: normaliseReceipts(invoice.receipts || []),
      createdAt: invoice.createdAt || new Date().toISOString(),
      updatedAt: invoice.updatedAt || invoice.createdAt || new Date().toISOString(),
    }));
}

function normaliseReceipts(receipts) {
  if (!Array.isArray(receipts)) return [];

  return receipts
    .filter((receipt) => receipt && receipt.id)
    .map((receipt) => ({
      id: receipt.id,
      amount: Number(receipt.amount) || 0,
      paymentDate: receipt.paymentDate || receipt.createdAt || new Date().toISOString(),
    }));
}

function normaliseTimeEntries(entries) {
  if (!Array.isArray(entries)) return [];

  return entries
    .filter((entry) => entry && entry.id)
    .map((entry) => ({
      id: entry.id,
      hours: Number(entry.hours) || 0,
      billingType: entry.billingType || entry.billing_type || "billable",
      entryDate: entry.entryDate || entry.entry_date || entry.createdAt || new Date().toISOString(),
      createdAt: entry.createdAt || entry.created_at || new Date().toISOString(),
    }));
}

function normaliseTasks(tasks) {
  if (!Array.isArray(tasks)) return [];

  return tasks
    .filter((task) => task && task.id)
    .map((task) => ({
      id: task.id,
      title: task.title || "Task",
      status: task.status || "todo",
      createdAt: task.createdAt || task.created_at || new Date().toISOString(),
      updatedAt: task.updatedAt || task.updated_at || task.createdAt || new Date().toISOString(),
      completedAt: task.completedAt || task.completed_at || "",
    }));
}

function normaliseReminders(reminders) {
  if (!Array.isArray(reminders)) return [];

  return reminders
    .filter((reminder) => reminder && reminder.id)
    .map((reminder) => ({
      id: reminder.id,
      title: reminder.title || "Reminder",
      completed: Boolean(reminder.completed),
      dueDate: reminder.dueDate || reminder.due_date || "",
      createdAt: reminder.createdAt || reminder.created_at || new Date().toISOString(),
      updatedAt: reminder.updatedAt || reminder.updated_at || reminder.createdAt || new Date().toISOString(),
    }));
}

function buildPeriodRange(filters) {
  if (filters.period === "all") {
    return {
      start: null,
      end: null,
      label: "All records",
    };
  }

  const [yearValue, monthValue] = String(filters.month || getCurrentMonthInputValue())
    .split("-")
    .map((value) => Number(value));

  const year = Number.isFinite(yearValue) ? yearValue : new Date().getFullYear();
  const monthIndex = Number.isFinite(monthValue) ? monthValue - 1 : new Date().getMonth();

  if (filters.period === "month") {
    const start = new Date(year, monthIndex, 1);
    const end = new Date(year, monthIndex + 1, 1);

    return {
      start,
      end,
      label: formatMonthYear(start),
    };
  }

  if (filters.period === "quarter") {
    const quarterStartMonth = Math.floor(monthIndex / 3) * 3;
    const start = new Date(year, quarterStartMonth, 1);
    const end = new Date(year, monthIndex + 1, 1);
    const quarter = Math.floor(monthIndex / 3) + 1;

    return {
      start,
      end,
      label: `Q${quarter} ${year} to ${formatMonthYear(new Date(year, monthIndex, 1))}`,
    };
  }

  const start = new Date(year, 0, 1);
  const end = new Date(year, monthIndex + 1, 1);

  return {
    start,
    end,
    label: `${year} year to ${formatMonthYear(new Date(year, monthIndex, 1))}`,
  };
}

function isWithinRange(value, range) {
  if (!value) return false;
  if (!range.start && !range.end) return true;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return false;
  if (range.start && date < range.start) return false;
  if (range.end && date >= range.end) return false;

  return true;
}

function getInvoicePaidAmount(invoice) {
  const receiptTotal = normaliseReceipts(invoice?.receipts || []).reduce(
    (total, receipt) => total + (Number(receipt.amount) || 0),
    0
  );

  return Math.max(Number(invoice?.paidAmount) || 0, receiptTotal);
}

function getInvoiceDisplayStatus(invoice) {
  const status = normalizeStatus(invoice?.paymentStatus);
  const amount = Number(invoice?.amount) || 0;
  const paid = getInvoicePaidAmount(invoice);

  if (amount > 0 && paid >= amount) return "paid";
  if (invoice?.dueDate && new Date(invoice.dueDate) < startOfToday() && paid < amount) return "overdue";

  return status || "draft";
}

function isProjectOverdue(project) {
  const status = normalizeStatus(project?.status);

  if (!project?.due_date || status === "completed") return false;

  const dueDate = new Date(project.due_date);
  return !Number.isNaN(dueDate.getTime()) && dueDate < startOfToday();
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function sumAmounts(rows, key) {
  return rows.reduce((total, row) => total + (Number(row?.[key]) || 0), 0);
}

function percent(part, total) {
  const numerator = Number(part) || 0;
  const denominator = Number(total) || 0;

  if (!denominator) return 0;

  return Math.round((numerator / denominator) * 100);
}

function average(values) {
  const cleanValues = values.filter((value) => Number.isFinite(value));

  if (cleanValues.length === 0) return 0;

  return cleanValues.reduce((total, value) => total + value, 0) / cleanValues.length;
}

function bounded(value) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

function roundOne(value) {
  return Math.round((Number(value) || 0) * 10) / 10;
}

function normalizeStatus(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
}

function getCurrentMonthInputValue() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatCurrency(amount, currency = "ZAR") {
  const value = Number(amount || 0);

  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: currency || "ZAR",
  }).format(value);
}

function formatDate(value) {
  if (!value) return "Date not available";

  return new Intl.DateTimeFormat("en-ZA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

function formatFullDate(value) {
  if (!value) return "Date not available";

  return new Intl.DateTimeFormat("en-ZA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatMonthYear(value) {
  return new Intl.DateTimeFormat("en-ZA", {
    year: "numeric",
    month: "long",
  }).format(new Date(value));
}

function toReadableLabel(value) {
  if (!value) return "Not provided";

  return String(value)
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function truncateText(value, maxLength) {
  const text = String(value || "");

  if (text.length <= maxLength) return text;

  return `${text.slice(0, maxLength - 3)}...`;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
